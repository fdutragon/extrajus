"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog"
import { 
  Zap, 
  ShieldCheck, 
  BrainCircuit, 
  ArrowDown, 
  ChevronRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  highlight: string
  description: string
  icon: React.ReactNode
  color: string
}

const STEPS: Step[] = [
  {
    title: "A Notificação",
    highlight: "Definitiva",
    description: "Resolva calotes e exija seus direitos sem precisar pagar advogados caros. Use nossa inteligência para criar notificações letais e profissionais sob medida em segundos.",
    icon: <Zap size={32} />,
    color: "text-amber-500"
  },
  {
    title: "Poder de Coerção",
    highlight: "Imediato",
    description: "A IA utiliza terminologia jurídica formal que intimida e fundamenta seu direito, obrigando a parte contrária a agir antes de enfrentar processos e protestos.",
    icon: <ShieldCheck size={32} />,
    color: "text-emerald-500"
  },
  {
    title: "Pronto para",
    highlight: "Enviar",
    description: "Basta descrever o que aconteceu. O motor cirúrgico formata a carta solene automaticamente com as leis aplicáveis. O resultado é um documento impecável e blindado.",
    icon: <BrainCircuit size={32} />,
    color: "text-primary"
  }
]

interface GoogleAdsOnboardingProps {
  onComplete?: () => void
}

export function GoogleAdsOnboarding({ onComplete }: GoogleAdsOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Evita múltiplos gatilhos na mesma sessão
    const hasSeenOnboarding = sessionStorage.getItem('ads-onboarding-seen')
    if (hasSeenOnboarding) return

    console.log("[AdsOnboarding] Preparando modal de boas-vindas...")
    // Pequeno delay para o editor carregar antes do "Wow"
    const timer = setTimeout(() => {
      setIsOpen(true)
      sessionStorage.setItem('ads-onboarding-seen', 'true')
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Efeito 1: Controla o progresso automático de cada slide de forma isolada
  useEffect(() => {
    if (!isOpen) return

    // Se for o último slide, congela o progresso em 100% e não ativa o timer automático para não fechar sozinho
    if (currentStep === STEPS.length - 1) {
      setProgress(100)
      return
    }

    setProgress(0)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1.5 // Avança o progresso de forma constante e fluida
        }
        return 100
      })
    }, 40)

    return () => clearInterval(timer)
  }, [isOpen, currentStep])

  // Efeito 2: Faz a transição de slide segura fora do ciclo de atualização do progresso
  useEffect(() => {
    if (!isOpen) return

    if (progress >= 100 && currentStep < STEPS.length - 1) {
      const nextTimer = setTimeout(() => {
        setCurrentStep((s) => s + 1)
        setProgress(0)
      }, 100) // Pequeno delay de transição para uma UX mais natural
      return () => clearTimeout(nextTimer)
    }
  }, [progress, isOpen, currentStep])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
      setProgress(0)
    } else {
      setIsOpen(false)
      // Custom event to trigger AI Prompt in the editor
      window.dispatchEvent(new CustomEvent('start-ai-onboarding'))
      // Chamar callback para avançar para a segunda etapa (modal de templates)
      onComplete?.()
    }
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-none p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
        <div className="relative px-6 sm:px-4 pt-10 pb-6 sm:pt-12 sm:pb-6 max-sm:pt-10 max-sm:pb-4 max-sm:min-h-0 sm:min-h-[390px] flex flex-col items-center text-center gap-6 max-sm:gap-3.5 justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

          {/* Progress Bars (Stories Style) */}
          <div className="absolute top-6 sm:top-8 max-sm:top-4 left-6 sm:left-4 right-6 sm:right-4 flex gap-1.5 z-20">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary transition-all duration-100 ease-linear",
                    i < currentStep ? "w-full" : i === currentStep ? "w-0" : "w-0"
                  )}
                  style={i === currentStep ? { width: `${progress}%` } : {}}
                />
              </div>
            ))}
          </div>

          {/* Icon Animation */}
          <div className={cn(
            "w-20 h-20 max-sm:w-16 max-sm:h-16 rounded-[2rem] max-sm:rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative z-10 shadow-2xl animate-in zoom-in-50 duration-500",
            step.color
          )}>
            <div className="absolute inset-0 bg-current opacity-10 blur-xl animate-pulse" />
            {step.icon}
          </div>

          {/* Text Content */}
          <div className="space-y-3 relative z-10">
            <h2 className="text-lg sm:text-xl font-black text-white leading-[1.3] uppercase tracking-wide">
              {step.title}{" "}
              <span className={cn("text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", step.color)}>
                {step.highlight}
              </span>
            </h2>
            <p className="text-xs sm:text-[13.5px] text-zinc-400 font-medium leading-relaxed px-4 sm:px-2">
              {step.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 w-full px-2">
            <Button 
              onClick={handleNext}
              className="w-full h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 group transition-all"
            >
              {isLastStep ? "Começar Agora" : "Próximo"}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

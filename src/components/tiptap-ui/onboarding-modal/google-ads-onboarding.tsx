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

export function GoogleAdsOnboarding() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Evita múltiplos gatilhos na mesma sessão
    const hasSeenOnboarding = sessionStorage.getItem('ads-onboarding-seen')
    if (hasSeenOnboarding) return

    // Detect Google Ads traffic (UTM or GCLID or REF)
    const params = new URLSearchParams(window.location.search)
    const isFromAds = params.get('utm_source') === 'google' || 
                      params.has('gclid') || 
                      params.has('gad_source') || 
                      params.get('ref') === 'ads' ||
                      params.get('utm_campaign') === 'ads'
    
    if (isFromAds) {
      console.log("[AdsOnboarding] Trânsito de Ads detectado. Preparando modal...")
      // Pequeno delay para o editor carregar antes do "Wow"
      const timer = setTimeout(() => {
        setIsOpen(true)
        sessionStorage.setItem('ads-onboarding-seen', 'true')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStep < STEPS.length - 1) {
            setCurrentStep(s => s + 1)
            return 0
          }
          return 100
        }
        return prev + 1 // Velocidade reduzida para dar mais tempo de leitura ao usuário
      })
    }, 50)

    return () => clearInterval(timer)
  }, [isOpen, currentStep])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
      setProgress(0)
    } else {
      setIsOpen(false)
      // Custom event to trigger AI Prompt in the editor
      window.dispatchEvent(new CustomEvent('start-ai-onboarding'))
    }
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-none p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
        <div className="relative px-6 py-10 max-sm:pt-12 max-sm:pb-6 max-sm:min-h-0 sm:min-h-[450px] flex flex-col items-center text-center gap-6 max-sm:gap-4 justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

          {/* Progress Bars (Stories Style) */}
          <div className="absolute top-6 max-sm:top-4 left-6 right-6 flex gap-1.5 z-20">
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
            <h2 className="text-2xl md:text-xl font-black text-white leading-[1.3] uppercase tracking-wide">
              {step.title}{" "}
              <span className={cn("text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", step.color)}>
                {step.highlight}
              </span>
            </h2>
            <p className="text-[13px] md:text-[15px] text-zinc-400 font-medium leading-relaxed px-4">
              {step.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 w-full px-2 flex flex-col gap-2">
            <Button 
              onClick={handleNext}
              className="w-full h-11 rounded-xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 group transition-all"
            >
              {isLastStep ? "Começar Agora" : "Próximo"}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            {isLastStep && (
              <button
                onClick={() => {
                  setCurrentStep(0)
                  setProgress(0)
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest transition-colors py-1 cursor-pointer"
              >
                Voltar ao Início (Ler Novamente)
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
    title: "O Contrato",
    highlight: "Perfeito",
    description: "Proteja seus negócios e blinde suas relações comerciais sem precisar de advogados caros. Use nossa inteligência para criar contratos robustos e profissionais sob medida em segundos.",
    icon: <Zap size={28} strokeWidth={1.5} />,
    color: "text-amber-500 dark:text-amber-400"
  },
  {
    title: "Segurança Jurídica",
    highlight: "Total",
    description: "A IA utiliza terminologia jurídica de ponta que garante a validade do seu acordo, protegendo seus interesses e prevenindo litígios futuros com cláusulas de alta performance.",
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    color: "text-emerald-500 dark:text-emerald-400"
  },
  {
    title: "Pronto para",
    highlight: "Assinar",
    description: "Basta descrever o seu acordo. O motor cirúrgico formata o contrato automaticamente com a estrutura jurídica ideal. O resultado é um documento pronto para ser assinado.",
    icon: <BrainCircuit size={28} strokeWidth={1.5} />,
    color: "text-primary dark:text-primary"
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

  // Auto-play slides com barra de progresso sincronizada
  useEffect(() => {
    if (!isOpen) return

    setProgress(0)
    const startTime = Date.now()
    const duration = 5000 // 5 segundos por slide

    // Timer para a transição do slide
    const slideTimer = setTimeout(() => {
      handleNext()
    }, duration)

    // Intervalo para a animação da barra
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
    }, 50)

    return () => {
      clearTimeout(slideTimer)
      clearInterval(progressInterval)
    }
  }, [isOpen, currentStep])

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
      <DialogContent className="max-w-md bg-card/95 dark:bg-zinc-950/95 border border-border/40 dark:border-none p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] dark:shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
        <div className="relative px-6 sm:px-4 pt-10 pb-9 sm:pt-12 sm:pb-9 max-sm:pt-10 max-sm:pb-7 max-sm:min-h-0 sm:min-h-[390px] flex flex-col items-center text-center gap-6 max-sm:gap-3.5 justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

          {/* Progress Bars (Stories Style) */}
          <div className="absolute top-6 sm:top-8 max-sm:top-4 left-6 sm:left-4 right-6 sm:right-4 flex gap-1.5 z-20">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary transition-all ease-linear",
                    i < currentStep ? "w-full" : i === currentStep ? "" : "w-0"
                  )}
                  style={{ 
                    width: i === currentStep ? `${progress}%` : i < currentStep ? '100%' : '0%',
                    transitionDuration: i === currentStep ? '50ms' : '300ms'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Icon Animation */}
          <div className="w-16 h-16 mt-3 sm:mt-4 rounded-full bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/80 flex items-center justify-center relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] animate-in zoom-in-50 duration-500">
            <div className={cn("absolute inset-0 bg-current opacity-[0.04] dark:opacity-[0.06] rounded-full blur-xl animate-pulse", step.color)} />
            <div className={step.color}>
              {step.icon}
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3 relative z-10">
            <h2 className="text-lg sm:text-xl font-black text-foreground dark:text-white leading-[1.3] uppercase tracking-wide">
              {step.title}{" "}
              <span className={cn("text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", step.color)}>
                {step.highlight}
              </span>
            </h2>
            <p className="text-[13px] sm:text-[14.5px] text-muted-foreground dark:text-zinc-400 font-medium leading-relaxed px-4 sm:px-2 pb-2">
              {step.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 w-full px-2">
            <Button 
              onClick={handleNext}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground dark:bg-white dark:text-black hover:bg-primary/90 dark:hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 group transition-all shadow-md dark:shadow-none"
            >
              {isLastStep ? "Começar" : "Próximo"}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

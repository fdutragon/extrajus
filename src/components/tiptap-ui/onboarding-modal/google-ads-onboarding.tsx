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
    title: "Documentos prontos",
    highlight: "em segundos",
    description: "Crie contratos, termos e notificações oficiais sem complicação. Nossa inteligência artificial entende o que você precisa e redige o texto completo de forma instantânea, economizando horas de trabalho manual.",
    icon: <Zap size={32} />,
    color: "text-amber-500"
  },
  {
    title: "Linguagem clara e",
    highlight: "profissional",
    description: "Não precisa entender de leis para escrever como um especialista. O sistema utiliza os termos corretos para garantir que seu documento seja sério, seguro e aceito em qualquer situação oficial.",
    icon: <ShieldCheck size={32} />,
    color: "text-emerald-500"
  },
  {
    title: "Controle total",
    highlight: "na sua mão",
    description: "Uma ferramenta simples e intuitiva feita para todos. Basta digitar o que você quer e deixar que a tecnologia faça a parte difícil. O resultado é um documento perfeito, pronto para ser usado.",
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
        return prev + 2 // Velocidade do progresso
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
        <div className="relative p-10 flex flex-col items-center text-center gap-8 min-h-[450px] justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

          {/* Progress Bars (Stories Style) */}
          <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-20">
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
            "w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center relative z-10 shadow-2xl animate-in zoom-in-50 duration-500",
            step.color
          )}>
            <div className="absolute inset-0 bg-current opacity-10 blur-xl animate-pulse" />
            {step.icon}
          </div>

          {/* Text Content */}
          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl font-black text-white leading-[1.3] uppercase tracking-tight">
              {step.title} <br />
              <span className={cn("text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", step.color)}>
                {step.highlight}
              </span>
            </h2>
            <p className="text-[14px] text-zinc-400 font-medium leading-relaxed px-4">
              {step.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 w-full pt-2">
            <Button 
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 group transition-all"
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

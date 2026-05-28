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
  Sparkles,
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
    title: "Documentos prontos em",
    highlight: "segundos",
    description: "Esqueça horas de redação. Digite o que precisa e a Lilith entrega a estrutura jurídica completa instantaneamente.",
    icon: <Zap size={32} />,
    color: "text-amber-500"
  },
  {
    title: "Blindagem jurídica",
    highlight: "absoluta",
    description: "Nossa IA foi treinada na legislação brasileira para garantir que cada parágrafo seja uma fortaleza de direitos.",
    icon: <ShieldCheck size={32} />,
    color: "text-emerald-500"
  },
  {
    title: "Dominação através da",
    highlight: "inteligência",
    description: "Você no comando, Lilith na execução. O editor jurídico mais avançado do mercado ao seu dispor.",
    icon: <BrainCircuit size={32} />,
    color: "text-primary"
  }
]

export function GoogleAdsOnboarding() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Detect Google Ads traffic (UTM or GCLID)
    const params = new URLSearchParams(window.location.search)
    const isFromAds = params.get('utm_source') === 'google' || params.has('gclid') || params.get('ref') === 'ads'
    
    if (isFromAds) {
      // Pequeno delay para o editor carregar antes do "Wow"
      const timer = setTimeout(() => setIsOpen(true), 1500)
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
    }
  }

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-none p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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
          <div className="space-y-4 relative z-10">
            <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
              {step.title} <br />
              <span className={cn("text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", step.color)}>
                {step.highlight}
              </span>
            </h2>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed px-4">
              {step.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="relative z-10 w-full pt-4">
            <Button 
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-xs gap-2 group transition-all"
            >
              {isLastStep ? "Dominar Agora" : "Próximo"}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Pointer to AI Prompt (only on last step) */}
          {isLastStep && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-md">
                Comece por aqui
              </span>
              <ArrowDown size={24} className="text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

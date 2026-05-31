"use client"

import { useState, useEffect } from "react"
import { Download, X, Sparkles, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
    }

    const handleAiFinished = () => {
      // Quando a IA termina de gerar o contrato, se o prompt estiver disponível, mostramos o convite
      if (deferredPrompt) {
        // Delay pequeno para não atropelar o sucesso da geração
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("ai-generation-finished", handleAiFinished)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("ai-generation-finished", handleAiFinished)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowPrompt(false)

    if (outcome === 'accepted') {
      toast.success("Instalação iniciada! Bem-vindo ao App ExtraJus.")
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 right-6 left-6 sm:left-auto sm:w-[320px] z-[2000] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-zinc-950/90 backdrop-blur-2xl border border-primary/30 rounded-2xl p-5 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] relative overflow-hidden group">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.25)]">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-[13px] font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                App ExtraJus <Sparkles size={12} className="text-primary animate-pulse" />
              </h4>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5">
                Instale para acesso instantâneo.
              </p>
            </div>
          </div>

          <p className="text-[12px] text-zinc-300 leading-relaxed font-medium">
            Deseja instalar o ExtraJus no seu celular para gerenciar seus contratos com mais rapidez?
          </p>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleInstallClick}
              className="flex-1 h-9 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              Instalar Agora
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowPrompt(false)}
              className="h-9 px-4 text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
            >
              Depois
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

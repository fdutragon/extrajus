"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, Monitor, Cloud, ShieldCheck, Zap, Download, Share, PlusSquare } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export function PwaInstallModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<"mobile" | "desktop">("mobile")
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const handleOpen = () => {
      if (typeof window !== "undefined") {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        setPlatform(isMobile ? "mobile" : "desktop")

        // Detecção de iOS agressiva (incluindo iPadOS moderno)
        const isIOSDevice = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !(window as any).MSStream
        setIsIOS(isIOSDevice)
      }
      setIsOpen(true)
    }

    window.addEventListener("open-pwa-modal", handleOpen)
    return () => window.removeEventListener("open-pwa-modal", handleOpen)
  }, [])

  const handleInstall = () => {
    // Conversão do Google Ads para Clique no Botão de Instalação
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-18191879169/hEqyCJvpwrYcEIGYyOJD',
          'value': 1.0,
          'currency': 'BRL'
      });
    }

    // Timer cego de 15s incondicional (ignorando APIs nativas instáveis)
    setTimeout(() => {
      localStorage.setItem("pwa_assumed_installed", "true")
      window.dispatchEvent(new CustomEvent("pwa-assumed-installed-changed"))
    }, 15000)

    // Dispara o prompt nativo via o handler existente
    window.dispatchEvent(new CustomEvent("trigger-pwa-install"))
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-w-[calc(100vw-2rem)] p-0 overflow-hidden border-border bg-background shadow-2xl">
        <div className="relative p-10 flex flex-col items-center text-center">
          
          <div className="flex items-center justify-center mb-6 drop-shadow-md">
            <Logo showText={false} iconSize={48} className="animate-in zoom-in duration-500" />
          </div>

          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tighter text-foreground italic">
              Salvamento Automático
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-2 max-w-md mx-auto font-medium">
              Garanta que suas minutas nunca sejam perdidas. Tenha a SmartDoc como um aplicativo dedicado que ajuda a fechar bons contratos no seu dia a dia.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/30 border border-border/50 text-center transition-all hover:bg-muted/50">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[13px] font-black text-foreground uppercase tracking-tighter mb-1">Edição sem Limites</p>
                <p className="text-[13px] text-muted-foreground font-medium leading-tight">Salve e edite quando quiser.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-muted/30 border border-border/50 text-center transition-all hover:bg-muted/50">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[13px] font-black text-foreground uppercase tracking-tighter mb-1">Instalação Instantânea</p>
                <p className="text-[13px] text-muted-foreground font-medium leading-tight">{isIOS ? "Processo nativo seguro do Safari." : "Instale sem sair do site."}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-4">
            {isIOS ? (
              <div className="w-full bg-muted/30 border border-border/50 rounded-2xl p-5 text-left flex flex-col gap-4 shadow-inner">
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest text-center">Como Instalar no iPhone/iPad:</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
                    <Share className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[13px] text-foreground font-medium leading-tight">1. Toque em <strong>Compartilhar</strong> na barra do Safari.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
                    <PlusSquare className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[13px] text-foreground font-medium leading-tight">2. Escolha <strong>Adicionar à Tela de Início</strong>.</p>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleInstall}
                className="w-full bg-primary text-primary-foreground font-black py-7 rounded-2xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.25)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                <Download className="mr-2 h-5 w-5 group-hover:animate-bounce relative z-10" />
                <span className="relative z-10 tracking-wider">INSTALAR APP AGORA</span>
              </Button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.3em] py-2"
            >
              Continuar no Navegador
            </button>
          </div>
        </div>

        {/* Bottom Bar Aesthetic */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      </DialogContent>
    </Dialog>
  )
}

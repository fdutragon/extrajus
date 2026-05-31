"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smartphone, Monitor, Cloud, ShieldCheck, Zap, Download } from "lucide-react"

export function PwaInstallModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<"mobile" | "desktop">("mobile")

  useEffect(() => {
    const handleOpen = () => {
      // Detecta plataforma básico
      if (typeof window !== "undefined") {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        setPlatform(isMobile ? "mobile" : "desktop")
      }
      setIsOpen(true)
    }

    window.addEventListener("open-pwa-modal", handleOpen)
    return () => window.removeEventListener("open-pwa-modal", handleOpen)
  }, [])

  const handleInstall = () => {
    // Dispara o prompt nativo via o handler existente
    window.dispatchEvent(new CustomEvent("trigger-pwa-install"))
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-w-[calc(100vw-2rem)] p-0 overflow-hidden border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="relative p-10 flex flex-col items-center text-center">
          
          <div className="h-14 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner group transition-all duration-500 hover:border-primary/50">
             {platform === "mobile" ? (
               <Smartphone className="w-7 h-7 text-primary animate-pulse" />
             ) : (
               <Monitor className="w-7 h-7 text-primary animate-pulse" />
             )}
          </div>

          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Salvamento Automático
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm leading-relaxed mt-3 max-w-md mx-auto font-medium">
              Garanta que sua obra nunca seja perdida. Transforme a ExtraJus em um aplicativo de elite.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center transition-all hover:bg-white/[0.05]">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[13px] font-black text-zinc-100 uppercase tracking-tighter mb-1">Edição sem Limites</p>
                <p className="text-[13px] text-zinc-400 font-medium leading-tight">Salve e edite seu modelo quando quiser.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center transition-all hover:bg-white/[0.05]">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[13px] font-black text-zinc-100 uppercase tracking-tighter mb-1">Instalação Instantânea</p>
                <p className="text-[13px] text-zinc-400 font-medium leading-tight">Instale em segundos sem sair do site.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-4">
            <Button 
              onClick={handleInstall}
              className="w-full bg-primary text-primary-foreground font-black py-7 rounded-2xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.25)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
              <Download className="mr-2 h-5 w-5 group-hover:animate-bounce relative z-10" />
              <span className="relative z-10 tracking-wider">INSTALAR APP AGORA</span>
            </Button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-[0.3em] py-2"
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

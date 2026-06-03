"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Building, ShieldAlert, Sparkles, Terminal } from "lucide-react"

export interface OnboardingModalProps {
  isOpen: boolean
  onSelectTemplate: (prompt: string) => void
  onClose: () => void
}

export function OnboardingModal({ isOpen, onSelectTemplate, onClose }: OnboardingModalProps) {
  const templates = [
    {
      title: "Prestação de Serviços",
      icon: <Building size={20} />,
      prompt: "Crie um contrato de prestação de serviços para um designer freelancer. O contratado deve entregar a identidade visual e o site da empresa. Defina o valor total em R$ 5.000,00 com 50% de entrada e o restante na entrega final.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Confidencialidade (NDA)",
      icon: <FileText size={20} />,
      prompt: "Elabore um contrato de confidencialidade (NDA) entre duas empresas que estão iniciando uma parceria comercial. Inclua cláusulas rigorosas de sigilo, proibição de uso de informações para fins próprios e multa de R$ 50.000,00 em caso de violação.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Compra e Venda",
      icon: <ShieldAlert size={20} />,
      prompt: "Redija um contrato de compra e venda de equipamento industrial. O valor é de R$ 150.000,00. Inclua cláusula de garantia de 12 meses, responsabilidade pelo frete por conta do comprador e foro de eleição em São Paulo/SP.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="w-full max-w-3xl bg-zinc-950/90 backdrop-blur-2xl border-border text-foreground rounded-3xl shadow-2xl p-0 overflow-hidden ring-1 ring-border animate-in zoom-in-95 duration-500">
        <div className="relative p-0 flex flex-col h-full">
          {/* Fundo Místico */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0  opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <div className="p-10 pb-8 flex flex-col gap-10 relative z-10 text-center">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                <Sparkles size={32} />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-zinc-100">
                Qual <span className="text-primary">Contrato</span> você precisa criar?
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] max-w-lg mx-auto">
                A Inteligência Artificial da ExtraJus está pronta. Selecione um modelo rápido de contrato abaixo ou digite seu próprio comando no editor.
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => onSelectTemplate(tpl.prompt)}
                  className={`group relative p-6 rounded-2xl border ${tpl.border} ${tpl.bg} hover:bg-muted/50 transition-all duration-300 text-left overflow-hidden hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tpl.color} bg-black/40 border border-white/5`}>
                    {tpl.icon}
                  </div>
                  <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wide mb-2">
                    {tpl.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                    {tpl.prompt.substring(0, 90)}...
                  </p>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-colors pointer-events-none" />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <button 
                onClick={onClose}
                className="mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                <Terminal size={14} />
                Quero digitar meu próprio comando
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

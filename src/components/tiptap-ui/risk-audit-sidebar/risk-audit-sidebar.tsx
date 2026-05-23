"use client"

import { Activity, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const renderBoldText = (text: string) => {
  if (!text) return ""
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export interface RiskAnalysisItem {
  originalText: string
  suggestion: string
  reason: string
  id: string
}

export interface RiskAuditSidebarProps {
  isLoading: boolean
  analysis: RiskAnalysisItem[]
}

export const RiskAuditSidebar = ({ isLoading, analysis }: RiskAuditSidebarProps) => {
  return (
    <div className="h-full flex flex-col bg-card border-l border-border relative">
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
                <Activity size={12} />
                <span>RADAR ANALÍTICO</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                <ShieldAlert size={28} className="text-primary opacity-40 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm italic">Analisando conformidade...</p>
                <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto uppercase tracking-tighter">Escaneando minutas e identificando pontos de atenção.</p>
              </div>
            </div>
          </div>
        ) : analysis.length === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
                <Activity size={12} />
                <span>RADAR ANALÍTICO</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
               <ShieldCheck size={32} className="text-muted-foreground" />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Inicie a análise para detectar inconsistências.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
                <ShieldCheck size={12} />
                <span>RELATÓRIO DE RISCOS</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-black">{analysis.length} ITENS</Badge>
            </div>

            <div className="space-y-4">
              {analysis.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-card/40 border-border hover:border-primary/30 transition-all group">
                   <div className="flex items-start justify-between mb-3">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Risco Identificado</span>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TEXTO ORIGINAL:</p>
                        <p className="text-[11px] font-medium leading-relaxed bg-muted/30 p-2 rounded-lg italic">&quot;{item.originalText}&quot;</p>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">SUGESTÃO DA IA:</p>
                        <p className="text-[11px] font-bold text-foreground leading-relaxed border-l-2 border-primary pl-3">{renderBoldText(item.suggestion)}</p>
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">JUSTIFICATIVA TÉCNICA:</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{renderBoldText(item.reason)}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

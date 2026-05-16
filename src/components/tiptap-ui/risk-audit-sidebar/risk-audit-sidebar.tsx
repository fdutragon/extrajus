"use client"

import { useEffect, useState } from "react"
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
import { Button } from "../../../components/tiptap-ui-primitive/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, ShieldCheck, X } from "lucide-react"

export function RiskAuditSidebar() {
  const { editor } = useTiptapEditor()
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [isAuditing, setIsAuditing] = useState(false)

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const aiStorage = editor.storage.ai
      if (aiStorage) {
        setIsAuditing(aiStorage.state === "loading")
        if (aiStorage.auditResults) {
          setResults(aiStorage.auditResults)
        }
      }
    }

    editor.on("transaction", handleUpdate)
    return () => {
      editor.off("transaction", handleUpdate)
    }
  }, [editor])

  const runAudit = () => {
    if (editor) {
      setIsOpen(true)
      ;(editor.commands as any).aiAuditRisk()
    }
  }

  const applySuggestion = (originalText: string, suggestion: string, id: string) => {
    if (!editor) return

    // Simple find and replace for the first occurrence of the original text
    // A robust implementation would use ProseMirror decorations or direct position mapping
    const doc = editor.state.doc
    let found = false

    doc.descendants((node, pos) => {
      if (found) return false
      if (node.isText && node.text?.includes(originalText)) {
        const start = pos + node.text.indexOf(originalText)
        const end = start + originalText.length
        
        editor.chain().focus().deleteRange({ from: start, to: end }).insertContentAt(start, suggestion).run()
        found = true
        return false
      }
    })

    // Remove from list
    if (found) {
      const newResults = results.filter(r => r.id !== id)
      // eslint-disable-next-line react-hooks/immutability
      editor.storage.ai.auditResults = newResults
      setResults(newResults)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <Button
          onClick={runAudit}
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 px-6 bg-primary hover:opacity-90 text-primary-foreground font-bold flex items-center gap-2 z-50 border border-primary/20"
        >
          <AlertTriangle className="w-5 h-5" />
          AUDITORIA DE RISCO
        </Button>
      )}

      {/* Sidebar Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-card border-l border-border shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-2 text-primary font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>RADAR LILITH</span>
            </div>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
            <Button 
              onClick={runAudit} 
              disabled={isAuditing}
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold"
            >
              {isAuditing ? "ANALISANDO..." : "REESCANEAR CONTRATO"}
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {isAuditing && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-medium text-sm italic">Lilith caçando brechas...</p>
              </div>
            )}

            {!isAuditing && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-primary/60 space-y-4 opacity-70">
                <ShieldCheck className="w-12 h-12" />
                <p className="font-bold text-center text-xs uppercase tracking-widest leading-relaxed">Nenhum risco detectado.<br/>O contrato está blindado.</p>
              </div>
            )}

            {!isAuditing && results.length > 0 && (
              <div className="space-y-4">
                {results.map((risk) => (
                  <div key={risk.id} className="bg-muted/30 border border-destructive/20 rounded-lg p-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-destructive uppercase tracking-widest mb-1 opacity-70">TERMO IDENTIFICADO:</p>
                      <p className="text-sm text-foreground bg-destructive/5 p-2 rounded border border-destructive/10 italic">&quot;{risk.originalText}&quot;</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">MOTIVO:</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{risk.reason}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">SUGESTÃO LILITH:</p>
                      <p className="text-sm text-primary bg-primary/5 p-2 rounded border border-primary/10 font-medium">&quot;{risk.suggestion}&quot;</p>
                    </div>
                    <Button 
                      onClick={() => applySuggestion(risk.originalText, risk.suggestion, risk.id)}
                      className="w-full bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest py-5 rounded-xl"
                    >
                      OTIMIZAR AGORA
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </>
  )
}

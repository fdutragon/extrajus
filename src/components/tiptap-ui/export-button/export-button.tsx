"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { CheckoutModal } from "@/components/checkout/checkout-modal"

export function ExportButton({ 
  isPublic = false,
  docType = "contrato",
  title = "Documento",
  variant = "toolbar",
  isLanding = false
}: { 
  isPublic?: boolean
  docType?: string
  title?: string
  variant?: "toolbar" | "premium"
  isLanding?: boolean
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExport = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const editorElement = document.querySelector(".notion-like-editor-content") as HTMLElement
    if (!editorElement) {
      toast.error("Documento não encontrado para exportação.")
      return
    }

    setIsExporting(true)
    const exportToast = toast.loading("Verificando saldo de Sinapses...", {
      style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }
    })

    try {
      let data: any = {}

      if (!isPublic) {
        // 1. Chamar a rota segura de cobrança de créditos no backend (Custa exatamente 2 créditos)
        const res = await fetch("/api/billing/charge-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })

        data = await res.json()

        if (!res.ok) {
          // Se falhar (saldo insuficiente), abre o modal de planos de Sinapses automaticamente!
          toast.error(data.error || "Saldo de Sinapses insuficiente para download.", { id: exportToast, duration: 5000 })
          
          // Disparar evento para abrir modal de planos de Sinapses
          window.dispatchEvent(new CustomEvent("open-plans-modal"))
          setIsExporting(false)
          return
        }
      }

      // Se passou da cobrança, inicia a exportação física do DOCX
      toast.loading("Compilando e formatando arquivo DOCX...", { id: exportToast })

      // 2. Obter o HTML bruto do editor
      const rawHtml = editorElement.innerHTML

      // 3. Gerar o DOCX de forma 100% segura e limpa pelo servidor
      const res = await fetch("/api/billing/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: rawHtml })
      });

      if (!res.ok) throw new Error("Falha na formatação do documento.");

      const blob = await res.blob();
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'documento'}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Documento exportado com sucesso!", { id: exportToast })

    } catch (err: any) {
      console.error("Export error", err)
      toast.error(err.message || "Erro ao exportar documento.", { id: exportToast })
    } finally {
      setIsExporting(false)
    }
  }, [isPublic, title])

  const handleExportClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Disparar evento de conversão do Google Ads para Iniciar finalização de compra
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-18209711344/z2CoCKaSnLgcEPDJiOtD'
      });
    }
    
    if (isPublic) {
      setIsModalOpen(true)
    } else {
      handleExport()
    }
  }, [isPublic, handleExport])

  // Listener global para acionar a exportação via IA ou outros componentes
  useEffect(() => {
    const handleTriggerExport = () => {
      handleExportClick()
    }
    window.addEventListener("trigger-document-export", handleTriggerExport)
    return () => window.removeEventListener("trigger-document-export", handleTriggerExport)
  }, [handleExportClick])

  const editorElement = typeof document !== "undefined" ? document.querySelector(".notion-like-editor-content") : null

  if (!editorElement && typeof document !== "undefined") {
    // Componente montado mas editor não encontrado (provavelmente ainda carregando)
  }

  return (
    <>
      {isLanding ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-[40rem] mx-auto p-6 sm:p-10 bg-card/40 border border-border/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          {/* Subtle occult glow background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full -z-10 group-hover:bg-emerald-500/10 transition-all duration-700" />
          
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-2">
               <Download className="w-7 h-7 text-emerald-500 animate-pulse" />
            </div>
            <h4 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {docType === "notificacao" ? "Baixe Agora Sua Notificação" : "Baixe Agora Seu Contrato"}
            </h4>
            <p className="text-sm sm:text-[15px] text-muted-foreground font-medium max-w-[30rem] leading-relaxed">
              Sua minuta oficial foi compilada com inteligência jurídica avançada e está pronta no formato editável Word (.DOCX) profissional.
            </p>
          </div>

          {/* Diferenciais Jurídicos de Alta Conversão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 w-full max-w-[30rem] py-4 border-t border-b border-border/30 my-2 text-left px-2 sm:px-4">
            <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-bold text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-500 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Minuta 100% Editável (.docx)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-bold text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-500 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Validade Jurídica Nacional</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-bold text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-500 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Formatação Técnica ABNT</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-[13px] font-bold text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-emerald-500 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Proteção Contra Ambiguidades</span>
            </div>
          </div>
          
          <Button
            onClick={handleExportClick}
            disabled={isExporting}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black tracking-[0.15em] uppercase rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 duration-300 transform hover:-translate-y-0.5 border border-emerald-500/20 text-xs sm:text-xs active:scale-98"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 animate-bounce" />
            )}
            <span>{isExporting ? "Preparando Arquivo..." : `Baixar ${docType === "notificacao" ? "Notificação" : "Contrato"} (.DOCX)`}</span>
          </Button>

          {/* Micro-segurança de transação */}
          
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 sm:h-7 gap-2 sm:gap-1.5 px-3 text-muted-foreground hover:text-foreground md:bg-primary md:text-primary-foreground md:hover:bg-primary/90 dark:md:bg-primary/10 dark:md:text-primary dark:md:hover:bg-primary/20 rounded-lg transition-all group border border-transparent md:border-primary/20 flex items-center justify-center shrink-0 md:shadow-md dark:md:shadow-none"
          onClick={handleExportClick}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="!w-3 !h-3 max-sm:!w-[14px] max-sm:!h-[14px] animate-spin text-primary" />
          ) : (
            <Download className="!w-3 !h-3 max-sm:!w-[14px] max-sm:!h-[14px] transition-transform" />
          )}
          <span className="text-[8px] sm:text-[8px] md:text-[9px] max-sm:text-[10px] font-black uppercase tracking-[0.2em] leading-none">
            {isExporting ? "Exportando" : "Baixar"}
          </span>
        </Button>
      )}

      {/* Checkout Paywall para Visitantes */}
      {isPublic && (
        <CheckoutModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => handleExport()}
          getDocumentContent={() => {
            const el = document.querySelector(".notion-like-editor-content")
            return el ? el.innerHTML : ""
          }}
          docType={docType}
          title={title}
        />
      )}
    </>
  )
}

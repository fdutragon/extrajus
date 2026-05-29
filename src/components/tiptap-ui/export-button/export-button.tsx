"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { CheckoutModal } from "@/components/checkout/checkout-modal"

export function ExportButton({ 
  isPublic = false,
  docType = "contrato",
  title = "Documento",
  content = "",
  variant = "toolbar"
}: { 
  isPublic?: boolean
  docType?: string
  title?: string
  content?: string
  variant?: "toolbar" | "premium"
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Disparar evento de conversão do Google Ads para Iniciar finalização de compra
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-18191879169/KGlTCMW5uLUcEIGYyOJD'
      });
    }
    
    if (isPublic) {
      setIsModalOpen(true)
    } else {
      handleExport()
    }
  }

  const handleExport = async (e?: React.MouseEvent) => {
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
          return
        }
      }

      // Se passou da cobrança, inicia a exportação física do DOCX
      toast.loading("Compilando e formatando arquivo DOCX...", { id: exportToast })

      // 2. Obter o HTML bruto do editor
      const rawHtml = editorElement.innerHTML

      // 3. Criar o cabeçalho específico do Word com suporte a estilos modernos e fontes elegantes
      const wordHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Documento ExtraJus</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 {
              size: 595.3pt 841.9pt; /* A4 */
              margin: 72.0pt 72.0pt 72.0pt 72.0pt; /* Margens de 2.54cm (padrão) */
              mso-header-margin: 36.0pt;
              mso-footer-margin: 36.0pt;
              mso-paper-source: 0;
            }
            div.Section1 {
              page: Section1;
            }
            body {
              font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
              font-size: 12.0pt;
              line-height: 1.6;
              color: #000000;
            }
            h1 {
              font-size: 16.0pt;
              font-weight: bold;
              text-align: center;
              text-transform: uppercase;
              margin-top: 12.0pt;
              margin-bottom: 24.0pt;
              color: #000000;
            }
            h2 {
              font-size: 13.0pt;
              font-weight: bold;
              margin-top: 18.0pt;
              margin-bottom: 6.0pt;
              color: #000000;
            }
            p {
              text-align: justify;
              margin-bottom: 12.0pt;
              line-height: 1.6;
            }
            p:not([data-node-text-align="center"]):not([data-node-text-align="right"]):not(.align-center):not(.align-right):not(.no-indent) {
              text-indent: 3.5em;
            }
            p.dense-metadata {
              margin-bottom: 2.0pt;
            }
            /* Suporte completo à estrutura de Legal Nodes do ExtraJus */
            .legal-node {
              margin-bottom: 12.0pt;
              text-align: justify;
            }
            .legal-node-level-1 {
              font-weight: bold;
              font-size: 13.0pt;
              margin-top: 18.0pt;
              color: #000000;
            }
            .legal-node-level-2 {
              margin-left: 24.0pt;
            }
            .legal-node-level-3 {
              margin-left: 48.0pt;
            }
            .legal-node-level-4 {
              margin-left: 72.0pt;
            }
            .legal-node-counter {
              font-weight: bold;
              margin-right: 8.0pt;
              display: inline-block;
            }
            .legal-node-content {
              display: inline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12.0pt;
              margin-bottom: 12.0pt;
            }
            td, th {
              border: 1.0pt solid #000000;
              padding: 8.0pt 10.0pt;
              text-align: left;
              vertical-align: top;
            }
            strong, b {
              font-weight: bold;
            }
            em, i {
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="Section1">
            ${rawHtml}
          </div>
        </body>
        </html>
      `

      // 4. Gerar o Blob e fazer download com extensão .docx
      const blob = new Blob(['\ufeff' + wordHtml], {
        type: 'application/msword;charset=utf-8'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `extrajus-documento-${new Date().getTime()}.docx`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Notificar se for você (isentado) ou usuário comum (cobrado)
      if (isPublic) {
        toast.success("Download gratuito liberado com sucesso!", { id: exportToast })
      } else if (data.isMaster) {
        toast.success("Download master gratuito liberado com sucesso!", { id: exportToast })
      } else {
        toast.success("Download concluído! Debitadas 2 Sinapses do seu saldo.", { id: exportToast })
      }

      // Emitir evento global de perfil atualizado para atualizar os saldos de créditos exibidos no header e sidebar em tempo real!
      window.dispatchEvent(new Event("profile-updated"))
    } catch (error) {
      console.error("Export DOCX error:", error)
      toast.error("Falha ao baixar o arquivo DOCX.", { id: exportToast })
    } finally {
      setIsExporting(false)
    }
  }

  const isPremium = variant === "premium"

  return (
    <>
      {isPremium ? (
        <div className="w-full max-w-[32rem] p-6 bg-muted/30 dark:bg-card/40 backdrop-blur-xl border border-border/80 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="space-y-2.5">
            <h4 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {docType === "notificacao" ? "Notificação Pronta e Revisada" : "Contrato Pronto e Revisado"}
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
          className="h-8 sm:h-7 gap-2 sm:gap-1.5 max-sm:gap-0 px-4 sm:px-3 max-sm:px-0 max-sm:w-10 max-sm:h-10 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all group border border-transparent hover:border-border/40 flex items-center justify-center shrink-0"
          onClick={handleExportClick}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="!w-3 !h-3 max-sm:!w-[18px] max-sm:!h-[18px] animate-spin text-primary" />
          ) : (
            <Download className="!w-3 !h-3 max-sm:!w-[18px] max-sm:!h-[18px] transition-transform" />
          )}
          <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none max-sm:hidden">
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
          documentContent={content}
          docType={docType}
          title={title}
        />
      )}
    </>
  )
}

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
  content = ""
}: { 
  isPublic?: boolean
  docType?: string
  title?: string
  content?: string
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 max-sm:gap-0 px-4 max-sm:px-0 max-sm:w-10 max-sm:h-10 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all group border border-transparent hover:border-border/40 flex items-center justify-center shrink-0"
        onClick={handleExportClick}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="w-3 h-3 max-sm:w-[18px] max-sm:h-[18px] animate-spin text-primary" />
        ) : (
          <Download className="w-3 h-3 max-sm:w-[18px] max-sm:h-[18px] transition-transform" />
        )}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none max-sm:hidden">
          {isExporting ? "Exportando" : "Baixar"}
        </span>
      </Button>

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

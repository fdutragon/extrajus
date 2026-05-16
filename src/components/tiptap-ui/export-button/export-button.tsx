"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "sonner"

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    // Select the actual content area
    const editorElement = document.querySelector(".notion-like-editor-content") as HTMLElement
    if (!editorElement) {
      toast.error("Arsenal não encontrado para exportação.")
      return
    }

    setIsExporting(true)
    const exportToast = toast.loading("Selando documento para exportação...", {
      style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }
    });

    try {
      // Create a clone to modify styles for export without flickering the UI
      const canvas = await html2canvas(editorElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(".notion-like-editor-content") as HTMLElement
          if (el) {
            el.style.backgroundColor = "white"
            el.style.color = "black"
            el.style.padding = "60px"
            
            // Force basic colors for all children to avoid html2canvas parsing errors (lab, oklch)
            const allElements = el.querySelectorAll("*")
            allElements.forEach((child: any) => {
              const computed = window.getComputedStyle(child)
              
              // If the element has a color using modern functions, fallback to black/basic
              // html2canvas fails on 'lab', 'oklch', etc.
              child.style.color = "black"
              
              if (computed.backgroundColor !== "rgba(0, 0, 0, 0)" && computed.backgroundColor !== "transparent") {
                 // Keep backgrounds but simplify them if they are complex
                 if (computed.backgroundColor.includes("oklch") || computed.backgroundColor.includes("lab")) {
                   child.style.backgroundColor = "#f4f4f5" // Simple zinc fallback
                 }
              }

              // Remove modern shadows/filters that might use unsupported colors
              child.style.boxShadow = "none"
              child.style.textShadow = "none"
              child.style.filter = "none"
            })
          }
        }
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`extrajus-pacto-${new Date().getTime()}.pdf`)
      
      toast.success("Documento selado e exportado com sucesso.", { id: exportToast })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Falha na exportação do ritual.", { id: exportToast })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-2 px-4 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all group border border-transparent hover:border-border/40 flex items-center justify-center"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 size={12} className="animate-spin text-primary" />
      ) : (
        <Download size={12} className="transition-transform" />
      )}
      <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
        {isExporting ? "Exportando" : "Baixar"}
      </span>
    </Button>
  )
}

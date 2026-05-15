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
    const editorElement = document.querySelector(".notion-like-editor")
    if (!editorElement) {
      toast.error("Editor não encontrado para exportação.")
      return
    }

    setIsExporting(true)
    try {
      const canvas = await html2canvas(editorElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`extrajus-contrato-${new Date().getTime()}.pdf`)
      
      toast.success("Documento selado e exportado com sucesso.")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Falha na exportação do ritual.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-2 px-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {isExporting ? "Selando..." : "Exportar"}
      </span>
    </Button>
  )
}

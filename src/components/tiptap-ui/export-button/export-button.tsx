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
    const editorElement = document.querySelector(".notion-like-editor-content") as HTMLElement
    if (!editorElement) {
      toast.error("Arsenal não encontrado para exportação.")
      return
    }

    setIsExporting(true)
    const exportToast = toast.loading("Selando documento para exportação...", {
      style: { background: '#09090b', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }
    })

    const scrollParent = editorElement.closest("main") as HTMLElement | null
    const originalOverflow = scrollParent?.style.overflow ?? ""
    const originalMaxHeight = scrollParent?.style.maxHeight ?? ""

    try {
      if (scrollParent) {
        scrollParent.style.overflow = "visible"
        scrollParent.style.maxHeight = "none"
      }

      // --- PDF layout constants (mm) ---
      const MARGIN_H = 20
      const MARGIN_TOP = 25
      const MARGIN_BOT = 20
      const CANVAS_SCALE = 2

      // --- Measure clause (level-1) positions BEFORE canvas capture ---
      // These are relative to the editor element's top, in real CSS px
      const editorTop = editorElement.getBoundingClientRect().top
      const clauseBreakPoints: Array<{ topPx: number; bottomPx: number }> = []
      editorElement.querySelectorAll(".legal-node-level-1").forEach((node) => {
        const rect = (node as HTMLElement).getBoundingClientRect()
        clauseBreakPoints.push({
          topPx: (rect.top - editorTop) * CANVAS_SCALE,
          bottomPx: (rect.bottom - editorTop) * CANVAS_SCALE,
        })
      })

      // Returns the best canvas Y cut point that avoids splitting clauses
      const safeCut = (rawCutPx: number): number => {
        // Find a clause whose body straddles the raw cut
        const hit = clauseBreakPoints.find(
          (c) => rawCutPx > c.topPx + 10 && rawCutPx < c.bottomPx - 10
        )
        if (hit) {
          // Push the cut UP to just before this clause starts (so it moves to next page)
          return Math.max(0, hit.topPx - 4)
        }
        return rawCutPx
      }

      const canvas = await html2canvas(editorElement, {
        scale: CANVAS_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowHeight: editorElement.scrollHeight,
        height: editorElement.scrollHeight,
        y: 0,
        onclone: (clonedDoc, clonedEl) => {
          // 1. Force CSS custom properties to concrete safe values on :root
          const rootStyle = clonedDoc.createElement("style")
          rootStyle.textContent = `
            :root {
              --foreground: #1a1a1a !important;
              --background: #ffffff !important;
              --muted-foreground: #555555 !important;
              --primary: #1a1a1a !important;
              --border: #d4d4d8 !important;
              --card: #ffffff !important;
              --card-foreground: #1a1a1a !important;
              color-scheme: light !important;
            }
            *, *::before, *::after {
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              -webkit-filter: none !important;
            }
            body, html { background: #ffffff !important; color: #1a1a1a !important; }
            .notion-like-editor-content {
              font-family: 'Georgia', 'Times New Roman', serif !important;
              font-size: 12pt !important;
              line-height: 1.75 !important;
              color: #1a1a1a !important;
              background: #ffffff !important;
              padding: 0 !important;
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
            }
            h1 {
              font-size: 15pt !important; font-weight: 700 !important;
              text-align: center !important; color: #111111 !important;
              margin-bottom: 20px !important; letter-spacing: 0.04em !important;
              text-transform: uppercase !important;
            }
            h2, h3, h4 { color: #111111 !important; font-weight: 700 !important; }
            p { color: #1a1a1a !important; background: transparent !important; text-align: justify !important; margin-bottom: 8px !important; }
            strong, b { color: #111111 !important; font-weight: 700 !important; }
            em, i { color: #1a1a1a !important; }
            .legal-node { color: #1a1a1a !important; background: transparent !important; }
            .legal-node.legal-node-level-1 { color: #111111 !important; font-weight: 700 !important; font-size: 12.5pt !important; }
            .legal-node.legal-node-level-2 { color: #1a1a1a !important; font-size: 12pt !important; }
            .legal-node.legal-node-level-3 { color: #1a1a1a !important; font-size: 11.5pt !important; }
            .legal-node.legal-node-level-4 { color: #333333 !important; font-size: 11pt !important; }
            .legal-node-counter { color: #111111 !important; font-weight: 700 !important; }
            .legal-node-content { color: #1a1a1a !important; }
            table { width: 100% !important; border-collapse: collapse !important; background: transparent !important; }
            td, th { border: 1px solid #9ca3af !important; padding: 10px 14px !important; color: #1a1a1a !important; background: transparent !important; }
            button, [role="toolbar"], header, nav, .fixed, .sticky,
            [data-toolbar], .tiptap-toolbar, footer { display: none !important; }
          `
          clonedDoc.head.appendChild(rootStyle)

          // 2. Walk every element: apply computed color inline to override CSS vars
          const MODERN_RE = /\b(lab|oklch|lch|oklab|color)\s*\(/i
          clonedDoc.querySelectorAll("*").forEach((node: any) => {
            // Compute the actual resolved color from the ORIGINAL doc and force it inline
            const orig = document.querySelector(`[data-node-view-wrapper]`) // fallback
            // Clear any modern color function from inline style properties
            const COLOR_PROPS = ["color", "backgroundColor", "borderColor",
              "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
              "outlineColor", "textDecorationColor", "caretColor"]
            COLOR_PROPS.forEach(prop => {
              const val: string = node.style?.[prop] || ""
              if (MODERN_RE.test(val)) {
                node.style[prop] = prop.includes("background") ? "transparent" : "#1a1a1a"
              }
            })
            // Force any var() usages by overriding with safe values
            if (node.style?.color?.includes("var(")) node.style.color = "#1a1a1a"
            if (node.style?.backgroundColor?.includes("var(")) node.style.backgroundColor = "transparent"
            node.style.boxShadow = "none"
            node.style.textShadow = "none"
            node.style.filter = "none"
          })
        }
      })

      // --- PDF generation with margins + smart page breaks ---
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfPageW = pdf.internal.pageSize.getWidth()
      const pdfPageH = pdf.internal.pageSize.getHeight()

      const contentW = pdfPageW - MARGIN_H * 2       // 170mm
      const contentH = pdfPageH - MARGIN_TOP - MARGIN_BOT // 252mm

      const pxPerMm = canvas.width / contentW
      const pageContentHeightPx = contentH * pxPerMm

      // Build smart cut points using safeCut
      const cutPoints: number[] = [0]
      let cursor = 0
      while (cursor < canvas.height) {
        const rawNext = cursor + pageContentHeightPx
        if (rawNext >= canvas.height) break
        const smartNext = safeCut(rawNext)
        cutPoints.push(smartNext)
        cursor = smartNext
      }
      cutPoints.push(canvas.height)

      const totalPages = cutPoints.length - 1

      const drawPage = (page: number, srcY: number, srcH: number) => {
        if (page > 0) pdf.addPage()

        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, pdfPageW, pdfPageH, "F")

        // Top rule
        pdf.setDrawColor(160, 160, 160)
        pdf.setLineWidth(0.3)
        pdf.line(MARGIN_H, MARGIN_TOP - 5, pdfPageW - MARGIN_H, MARGIN_TOP - 5)

        // Content slice
        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = srcH
        const ctx = pageCanvas.getContext("2d")!
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)
        const sliceData = pageCanvas.toDataURL("image/png")
        const sliceHeightMm = srcH / pxPerMm
        pdf.addImage(sliceData, "PNG", MARGIN_H, MARGIN_TOP, contentW, sliceHeightMm)

        // Bottom rule
        pdf.setDrawColor(160, 160, 160)
        pdf.setLineWidth(0.3)
        pdf.line(MARGIN_H, pdfPageH - MARGIN_BOT + 3, pdfPageW - MARGIN_H, pdfPageH - MARGIN_BOT + 3)

        // Page number
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        pdf.text(`${page + 1} / ${totalPages}`, pdfPageW / 2, pdfPageH - MARGIN_BOT + 8, { align: "center" })

        // Watermark
        pdf.setFontSize(7)
        pdf.setTextColor(180, 180, 180)
        pdf.text("ExtraJus · Documento Gerado Eletronicamente", pdfPageW / 2, pdfPageH - MARGIN_BOT + 13, { align: "center" })
      }

      for (let p = 0; p < totalPages; p++) {
        const srcY = cutPoints[p]
        const srcH = cutPoints[p + 1] - srcY
        drawPage(p, srcY, srcH)
      }

      pdf.save(`extrajus-pacto-${new Date().getTime()}.pdf`)
      toast.success(`Documento exportado — ${totalPages} página(s).`, { id: exportToast })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Falha na exportação do ritual.", { id: exportToast })
    } finally {
      if (scrollParent) {
        scrollParent.style.overflow = originalOverflow
        scrollParent.style.maxHeight = originalMaxHeight
      }
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

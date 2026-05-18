"use client"
 
import { useCallback } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "../../../../components/tiptap-ui-primitive/button"
import type { TextOptions } from "../../../../components/tiptap-extension/gemini-ai-extension"
import { useUiEditorState } from "../../../../hooks/use-ui-editor-state"
import { Check, X } from "lucide-react"
 
import "../../../../components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions.scss"
 
export interface AiMenuActionsProps {
  editor: Editor | null
  options: TextOptions
  onRegenerate?: () => void
  onAccept?: () => void
  onReject?: () => void
}
 
export function AiMenuActions({
  editor,
  options,
  onRegenerate,
  onAccept,
  onReject,
}: AiMenuActionsProps) {
  const { aiGenerationIsLoading } = useUiEditorState(editor)
 
  const handleDiscard = useCallback(() => {
    if (!editor) return
    ;(editor.commands as any).aiReject()
    onReject?.()
  }, [editor, onReject])
 
  const handleApply = useCallback(() => {
    if (!editor) return
    ;(editor.commands as any).aiAccept()
    onAccept?.()
  }, [editor, onAccept])
 
  return (
    <div className="tiptap-ai-menu-actions mt-3.5 p-4 border border-border/80 bg-card/65 backdrop-blur-md rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground">
          {aiGenerationIsLoading ? "Canalizando..." : "Sugestão pronta"}
        </span>
      </div>
 
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="h-8.5 px-3.5 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5"
          onClick={handleDiscard}
        >
          <X size={12} />
          Descartar
        </Button>
 
        <Button
          className="h-8.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold transition-all duration-200 active:scale-[0.98] border border-primary/20 flex items-center gap-1.5"
          onClick={handleApply}
          disabled={aiGenerationIsLoading}
        >
          <Check size={12} />
          Aplicar pacto
        </Button>
      </div>
    </div>
  )
}

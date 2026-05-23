"use client"
 
import { useCallback } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "../../../../components/tiptap-ui-primitive/button"
import type { TextOptions } from "../../../../components/tiptap-extension/gemini-ai-extension"
import { useUiEditorState } from "../../../../hooks/use-ui-editor-state"
import { Trash2, Sparkles } from "lucide-react"
 
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
          {aiGenerationIsLoading ? "Gerando..." : "Sugestão pronta"}
        </span>
      </div>
 
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="h-9 px-5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-[13px] font-medium flex items-center gap-2 group/discard"
          onClick={handleDiscard}
        >
          <Trash2 size={15} className="shrink-0" />
          <span>Descartar</span>
        </Button>
 
        <Button
          variant="ghost"
          className="h-9 px-6 rounded-xl bg-primary/25 border border-primary text-primary text-[13px] font-medium shadow-[0_0_20px_rgba(var(--primary),0.25)] transition-all duration-300 active:scale-[0.97] flex items-center gap-2.5 relative group/apply"
          onClick={handleApply}
          disabled={aiGenerationIsLoading}
        >
          <Sparkles size={15} className="relative z-10 transition-transform group-hover/apply:scale-110 shrink-0" />
          <span className="relative z-10">Aplicar sugestão</span>
        </Button>
      </div>
    </div>
  )
}

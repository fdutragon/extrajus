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
    ;(editor.commands as any).clearAiHighlights()
    ;(editor.commands as any).aiAccept()
    onAccept?.()
  }, [editor, onAccept])
 
  return (
    <div className="tiptap-ai-menu-actions mt-3.5 px-4 sm:px-6 py-2.5 sm:py-3 border border-border/80 bg-card sm:bg-card/65 sm:backdrop-blur-md rounded-2xl flex items-center justify-between gap-2 sm:gap-4 shadow-sm animate-in fade-in duration-300 max-sm:shadow-none">
      <div className="flex items-center gap-1.5 shrink-0 max-sm:hidden">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground whitespace-nowrap">
          Sugestão pronta
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2 flex-nowrap w-full sm:w-auto">
        <Button
          variant="ghost"
          className="h-8 sm:h-7.5 px-3 sm:px-3.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 text-[10px] sm:text-[11px] font-medium flex items-center justify-center gap-1.5 group/discard flex-1 sm:flex-none"
          onClick={handleDiscard}
        >
          <Trash2 size={11} className="sm:size-[12px] shrink-0" />
          <span className="whitespace-nowrap">Descartar</span>
        </Button>

        <Button
          variant="ghost"
          className="h-8 sm:h-7.5 px-3.5 sm:px-5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-[10px] sm:text-[11px] font-semibold shadow-[0_0_10px_rgba(var(--primary-rgb),0.05)] transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-1.5 relative group/apply flex-[1.5] sm:flex-none"
          onClick={handleApply}
          disabled={aiGenerationIsLoading}
        >
          <Sparkles size={11} className="sm:size-[12px] relative z-10 transition-transform group-hover/apply:scale-110 shrink-0" />
          <span className="relative z-10 whitespace-nowrap">Aplicar Sugestão</span>
        </Button>
      </div>
    </div>
  )
}


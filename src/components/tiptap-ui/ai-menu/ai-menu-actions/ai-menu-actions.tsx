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
    
    // 1. Limpa os destaques de edição da IA
    ;(editor.commands as any).clearAiHighlights()
    
    // 2. Aceita formalmente a alteração no documento
    ;(editor.commands as any).aiAccept()
    
    onAccept?.()
  }, [editor, onAccept])
 
  return (
    <div className="tiptap-ai-menu-actions mt-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-border/80 bg-card sm:bg-card/65 sm:backdrop-blur-md rounded-2xl flex items-center justify-between gap-2 sm:gap-4 shadow-sm animate-in fade-in duration-300 max-sm:shadow-none">
      <div className="flex items-center gap-1.5 shrink-0 max-sm:hidden">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground whitespace-nowrap">
          Sugestão pronta
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 flex-nowrap w-full sm:w-auto">
        <Button
          variant="ghost"
          className="ai-btn-discard h-9 sm:h-8 text-red-600 dark:text-red-400/90 hover:text-red-500 text-[11px] sm:text-[10px] font-semibold flex items-center justify-center gap-1.5 group/discard flex-1 sm:flex-none transition-all duration-300 rounded-full"
          onClick={handleDiscard}
        >
          <Trash2 size={14} className="sm:size-[12px] shrink-0 transition-transform group-hover/discard:scale-110" />
          <span className="whitespace-nowrap">Descartar</span>
        </Button>

        <Button
          variant="ghost"
          className="ai-btn-apply h-9 sm:h-8 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-[10px] font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 group/apply flex-1 sm:flex-none rounded-full"
          onClick={handleApply}
          disabled={aiGenerationIsLoading}
        >
          <Sparkles size={14} className="sm:size-[12px] transition-transform group-hover/apply:scale-110 shrink-0" />
          <span className="whitespace-nowrap">Aplicar</span>
        </Button>
      </div>
    </div>
  )
}


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
          className="h-9 sm:h-7.5 px-2 text-red-500 hover:text-red-400 hover:bg-transparent text-[11px] sm:text-[9px] font-bold flex items-center justify-center gap-1.5 group/discard flex-1 sm:flex-none transition-colors"
          onClick={handleDiscard}
        >
          <Trash2 size={12} className="sm:size-[10px] shrink-0" />
          <span className="whitespace-nowrap uppercase tracking-tight">Descartar</span>
        </Button>

        <Button
          variant="ghost"
          className="h-9 sm:h-7.5 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-transparent text-[11px] sm:text-[9px] font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-1.5 group/apply flex-1 sm:flex-none"
          onClick={handleApply}
          disabled={aiGenerationIsLoading}
        >
          <Sparkles size={12} className="sm:size-[10px] transition-transform group-hover/apply:scale-110 shrink-0" />
          <span className="whitespace-nowrap uppercase tracking-tight">Aplicar Alterações</span>
        </Button>
      </div>
    </div>
  )
}


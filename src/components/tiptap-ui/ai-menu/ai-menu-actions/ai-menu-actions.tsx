"use client"
 
import { useCallback } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "../../../../components/tiptap-ui-primitive/button"
import type { TextOptions } from "../../../../components/tiptap-extension/gemini-ai-extension"
import { useUiEditorState } from "../../../../hooks/use-ui-editor-state"
 
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
    <div className="tiptap-ai-menu-actions mt-2 px-3 sm:px-4 py-2 border border-border/60 bg-card/50 sm:backdrop-blur-md rounded-xl flex items-center justify-end shadow-sm animate-in fade-in duration-300">
      <Button
        variant="ghost"
        className="ai-btn-discard h-7 px-3 text-muted-foreground hover:text-red-500 text-[10px] font-semibold flex items-center justify-center transition-all duration-200 rounded-lg"
        onClick={handleDiscard}
      >
        <span className="whitespace-nowrap leading-none">Desfazer</span>
      </Button>
    </div>
  )
}


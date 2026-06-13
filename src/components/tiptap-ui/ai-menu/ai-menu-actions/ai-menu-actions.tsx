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
    <div className="tiptap-ai-menu-actions flex items-center justify-between pt-1.5 px-1 border-t border-border/40 animate-in fade-in duration-200">
      <span className="text-[9.5px] text-muted-foreground/50 leading-none pl-1 select-none">IA aplicou alterações</span>
      <Button
        variant="ghost"
        className="ai-btn-discard h-6 px-2.5 text-muted-foreground/60 hover:text-red-500 hover:bg-transparent text-[9.5px] font-medium flex items-center justify-center transition-colors duration-150 rounded-md"
        onClick={handleDiscard}
      >
        <span className="whitespace-nowrap leading-none">Desfazer</span>
      </Button>
    </div>
  )
}


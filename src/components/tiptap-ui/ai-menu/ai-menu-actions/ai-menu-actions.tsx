"use client"

import { useCallback } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "../../../../components/tiptap-ui-primitive/button"
import { RefreshAiIcon } from "../../../../components/tiptap-icons/refresh-ai-icon"
import { XIcon } from "../../../../components/tiptap-icons/x-icon"
import { CheckIcon } from "../../../../components/tiptap-icons/check-icon"
import type { TextOptions } from "../../../../components/tiptap-extension/gemini-ai-extension"
import { useUiEditorState } from "../../../../hooks/use-ui-editor-state"
import { ButtonGroup } from "../../../../components/tiptap-ui-primitive/button-group"

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

  const handleRegenerate = useCallback(() => {
    if (!editor) return
    ;(editor.chain() as any).focus().aiRegenerate(options).run()
    onRegenerate?.()
  }, [editor, onRegenerate, options])

  const handleDiscard = useCallback(() => {
    if (!editor) return
    ;(editor.chain() as any).focus().aiReject().run()
    onReject?.()
  }, [editor, onReject])

  const handleApply = useCallback(() => {
    if (!editor) return
    ;(editor.chain() as any).focus().aiAccept().run()
    onAccept?.()
  }, [editor, onAccept])

  return (
    <div className="tiptap-ai-menu-actions mt-6 p-3 bg-white/[0.02] dark:bg-orange-500/[0.03] border border-border dark:border-orange-500/10 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-sm">
      <div className="tiptap-ai-menu-results">
        <Button
          variant="ghost"
          className="tiptap-button text-[11px] font-medium hover:bg-orange-500/10 hover:text-orange-500 rounded-xl"
          onClick={handleRegenerate}
          disabled={aiGenerationIsLoading}
        >
          <RefreshAiIcon className="tiptap-button-icon mr-2" />
          Refazer ritual
        </Button>
      </div>

      <div className="tiptap-ai-menu-commit">
        <ButtonGroup className="gap-2">
          <Button
            variant="ghost"
            className="tiptap-button text-[11px] font-medium hover:bg-red-500/10 hover:text-red-500 rounded-xl"
            onClick={handleDiscard}
          >
            <XIcon className="tiptap-button-icon mr-2" />
            Descartar
          </Button>

          <Button
            data-style="primary"
            className="tiptap-button bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20 text-[11px] font-medium px-6 rounded-xl transition-all active:scale-95"
            onClick={handleApply}
          >
            <CheckIcon className="tiptap-button-icon mr-2" />
            Aplicar pacto
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

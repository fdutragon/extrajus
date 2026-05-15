"use client"

import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import {
  defaultUiState,
  type UiState,
} from "../components/tiptap-extension/ui-state-extension"

export function useUiEditorState(editor: Editor | null): UiState {
  return (
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) return defaultUiState
        return (editor.storage.uiState as UiState) || defaultUiState
      },
    }) || defaultUiState
  )
}

export default useUiEditorState

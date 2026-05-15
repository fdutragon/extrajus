"use client"

import type { Editor } from "@tiptap/react"
import { useEditorState } from "@tiptap/react"
import {
  defaultUiState,
  type UiState,
} from "../components/tiptap-extension/ui-state-extension"

export function useUiEditorState(editor: Editor | null): UiState {
  const stateString = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return JSON.stringify(defaultUiState)

      const state = editor.storage.uiState
      if (!state) {
        return JSON.stringify(defaultUiState)
      }

      return JSON.stringify(state)
    },
  })

  return stateString ? JSON.parse(stateString) : defaultUiState
}

export default useUiEditorState

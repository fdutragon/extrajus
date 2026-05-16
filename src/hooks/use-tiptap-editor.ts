"use client"

import type { Editor } from "@tiptap/react"
import { useCurrentEditor } from "@tiptap/react"
import { useEffect, useState, useCallback } from "react"

function getActivePageEditor(editor: Editor): Editor | null {
  const storage = editor.storage as unknown as Record<string, unknown>
  const pages = storage.pages as { activeEditor?: Editor | null } | undefined
  if (!pages || !("activeEditor" in pages)) return null
  return pages.activeEditor ?? null
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor["state"]
  canCommand?: Editor["can"]
} {
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = providedEditor ?? coreEditor

  const [storageEditor, setStorageEditor] = useState<Editor | null>(null)

  const updateHandler = useCallback(() => {
    if (!mainEditor) return
    const activeEditor = getActivePageEditor(mainEditor)
    setStorageEditor(prev => prev === activeEditor ? prev : activeEditor)
  }, [mainEditor])

  useEffect(() => {
    if (!mainEditor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageEditor(null)
      return
    }

    updateHandler()

    mainEditor.on("update", updateHandler)
    mainEditor.on("selectionUpdate", updateHandler)

    return () => {
      mainEditor.off("update", updateHandler)
      mainEditor.off("selectionUpdate", updateHandler)
    }
  }, [mainEditor, updateHandler])

  useEffect(() => {
    if (!storageEditor) return

    const handleDestroy = () => setStorageEditor(null)

    storageEditor.on("destroy", handleDestroy)
    return () => {
      storageEditor.off("destroy", handleDestroy)
    }
  }, [storageEditor])

  const finalEditor = storageEditor ?? mainEditor

  return {
    editor: finalEditor,
    editorState: finalEditor?.state,
    canCommand: finalEditor?.can,
  }
}

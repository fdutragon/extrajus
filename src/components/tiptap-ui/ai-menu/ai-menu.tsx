"use client"

import { useCallback, useEffect, useRef } from "react"
import { type Editor } from "@tiptap/react"
import { cn } from "@/lib/utils"

import { AiMenuItems } from "../../../components/tiptap-ui/ai-menu/ai-menu-items/ai-menu-items"

// -- Hooks --
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
import { useUiEditorState } from "../../../hooks/use-ui-editor-state"

// -- Utils --
import {
  getSelectedDOMElement,
  selectionHasText,
} from "../../../lib/tiptap-advanced-utils"

// -- Tiptap UI --
import { AiMenuInputTextarea } from "../../../components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input"
import { AiMenuActions } from "../../../components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions"

// -- UI Primitives --
import {
  Menu,
  MenuContent,
  useFloatingMenuStore,
} from "../../../components/tiptap-ui-primitive/menu"
import { Button } from "../../../components/tiptap-ui-primitive/button"
import {
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
} from "../../../components/tiptap-ui-primitive/combobox/combobox"
import { Card } from "../../../components/tiptap-ui-primitive/card/card"

import {
  getContextAndInsertAt,
  getSelectionRangeRect,
  createVirtualAnchor,
  createEditorWidthAnchorRect,
} from "../../../components/tiptap-ui/ai-menu/ai-menu-utils"
import {
  useAiContentTracker,
  useAiMenuState,
  useAiMenuStateProvider,
  useTextSelectionTracker,
} from "../../../components/tiptap-ui/ai-menu/ai-menu-hooks"

// -- Icons --
import { StopCircle2Icon } from "../../../components/tiptap-icons/stop-circle-2-icon"
import type { Tone } from "../../tiptap-extension/gemini-ai-extension"

import "../../../components/tiptap-ui/ai-menu/ai-menu.scss"

export function AiMenuStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { value, AiMenuStateContext } = useAiMenuStateProvider()

  return (
    <AiMenuStateContext.Provider value={value}>
      {children}
    </AiMenuStateContext.Provider>
  )
}

export function AiMenuContent({
  editor: providedEditor,
  anchorToSelection = false,
  plain = false,
}: {
  editor?: Editor | null
  anchorToSelection?: boolean
  plain?: boolean
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const { state, updateState, setFallbackAnchor, reset } = useAiMenuState()
  const { show, store } = useFloatingMenuStore()
  const { aiGenerationIsLoading, aiGenerationActive, aiGenerationHasMessage } =
    useUiEditorState(editor)
  const tiptapAiPromptInputRef = useRef<HTMLDivElement | null>(null)

  const closeAiMenu = useCallback(() => {
    if (!editor) return
    reset()
    store?.hideAll()
    ;(editor.commands as any).resetUiState()
  }, [editor, reset, store])

  const handlePromptSubmit = useCallback(
    (userPrompt: string) => {
      if (!editor || !userPrompt.trim()) return

      const { context } = getContextAndInsertAt(editor)
      // if context, add it to the user prompt
      const promptWithContext = context
        ? `${context}\n\n${userPrompt}`
        : userPrompt

      // Ensure fallback anchor is set before submitting
      if (!state.fallbackAnchor.element || !state.fallbackAnchor.rect) {
        if (anchorToSelection) {
          const selectionRect = getSelectionRangeRect(editor)

          if (selectionRect) {
            const anchorRect = createEditorWidthAnchorRect(
              editor.view.dom,
              selectionRect
            )

            const anchor = createVirtualAnchor(anchorRect, editor.view.dom)
            setFallbackAnchor(anchor, anchorRect)
          }
        } else {
          const currentSelectedElement = getSelectedDOMElement(editor)
          if (currentSelectedElement) {
            const rect = currentSelectedElement.getBoundingClientRect()
            setFallbackAnchor(currentSelectedElement, rect)
          }
        }
      }

      ;(editor
        .chain() as any)
        .aiTextPrompt({
          text: promptWithContext,
          insert: true,
          stream: true,
          tone: state.tone,
          format: "rich-text",
        })
        .run()
    },
    [
      editor,
      state.fallbackAnchor.element,
      state.fallbackAnchor.rect,
      state.tone,
      anchorToSelection,
      setFallbackAnchor,
    ]
  )

  const setAnchorElement = useCallback(
    (element: HTMLElement) => {
      store.setAnchorElement(element)
    },
    [store]
  )

  const handleSelectionChange = useCallback(
    (element: HTMLElement | null, rect: DOMRect | null) => {
      setFallbackAnchor(element, rect)
    },
    [setFallbackAnchor]
  )

  const handleOnReject = useCallback(() => {
    if (!editor) return
    ;(editor.commands as any).aiReject()
    closeAiMenu()
  }, [closeAiMenu, editor])

  const handleOnAccept = useCallback(() => {
    if (!editor) return
    ;(editor.commands as any).aiAccept()
    closeAiMenu()
  }, [closeAiMenu, editor])

  const handleInputOnClose = useCallback(() => {
    if (!editor) return
    if (aiGenerationIsLoading) {
      ;(editor.commands as any).aiReject({ type: "reset" })
    } else {
      ;(editor.commands as any).aiAccept()
    }
    closeAiMenu()
  }, [aiGenerationIsLoading, closeAiMenu, editor])

  const handleClickOutside = useCallback(() => {
    if (!aiGenerationIsLoading) {
      closeAiMenu()

      if (!editor) return
      ;(editor.commands as any).aiAccept()
    }
  }, [aiGenerationIsLoading, closeAiMenu, editor])

  useAiContentTracker({
    editor,
    aiGenerationActive,
    setAnchorElement,
    anchorToSelection,
  })

  useTextSelectionTracker({
    editor,
    aiGenerationActive,
    showMenuAtElement: show,
    setMenuVisible: (visible) => updateState({ isOpen: visible }),
    onSelectionChange: handleSelectionChange,
    prevent: aiGenerationIsLoading,
    anchorToSelection,
  })

  useEffect(() => {
    if (aiGenerationIsLoading) {
      updateState({ shouldShowInput: false })
    }
  }, [aiGenerationIsLoading, updateState])

  useEffect(() => {
    if (!plain && !aiGenerationActive && state.isOpen) {
      closeAiMenu()
    }
  }, [aiGenerationActive, state.isOpen, closeAiMenu, plain])

  const smoothFocusAndScroll = (element: HTMLElement | null) => {
    element?.focus()
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    })

    // Ensure the menu back to focus after focusing on the popover
    setTimeout(() => store.setAutoFocusOnShow(false), 0)
    return false
  }

  const shouldShowList =
    selectionHasText(editor) ||
    (aiGenerationHasMessage && state.shouldShowInput && state.inputIsFocused)

  if (plain) {
    return (
      <ComboboxProvider>
        <AiMenuInputTextarea
          ref={tiptapAiPromptInputRef}
          isLoading={aiGenerationIsLoading}
          autoFocus={false}
          isEditing={!editor?.isEmpty && (editor ? editor.getText().trim().length > 100 : false)}
          onStop={() => {
            if (!editor) return
            ;(editor.chain() as any).aiReject({ type: "reset" }).run()
            reset()
            ;(editor.commands as any).resetUiState()
          }}
          showPlaceholder={
            !aiGenerationIsLoading &&
            aiGenerationHasMessage &&
            !state.shouldShowInput
          }
          onInputFocus={() => updateState({ inputIsFocused: true })}
          onInputBlur={() => updateState({ inputIsFocused: false })}
          onClose={handleInputOnClose}
          onPlaceholderClick={() => updateState({ shouldShowInput: true })}
          onInputSubmit={(value) => handlePromptSubmit(value)}
          onToneChange={(tone: any) => updateState({ tone })}
        />

        {aiGenerationHasMessage && !aiGenerationIsLoading && (
          <AiMenuActions
            editor={editor || ({} as any)}
            options={{ tone: state.tone, format: "rich-text" }}
            onAccept={handleOnAccept}
            onReject={handleOnReject}
          />
        )}
      </ComboboxProvider>
    )
  }

  const content = (
    <ComboboxProvider>
      <Card className={cn("tiptap-ai-menu")}>
         {/* Internal content if needed */}
      </Card>
    </ComboboxProvider>
  )

  if (!editor || !state.isOpen) {
    return null
  }

  if (!aiGenerationActive) {
    return null
  }

  return (
    <Menu open={state.isOpen} placement="bottom-start" store={store}>
      <MenuContent
        onClickOutside={handleClickOutside}
        className="tiptap-ai-menu"
        flip={false}
      >
        <Card>
          <AiMenuInputTextarea
            ref={tiptapAiPromptInputRef}
            isLoading={aiGenerationIsLoading}
            isEditing={!editor?.isEmpty && (editor ? editor.getText().trim().length > 100 : false)}
            onStop={() => {
              if (!editor) return
              ;(editor.chain() as any).aiReject({ type: "reset" }).run()
              reset()
              ;(editor.commands as any).resetUiState()
            }}
            showPlaceholder={
              !aiGenerationIsLoading &&
              aiGenerationHasMessage &&
              !state.shouldShowInput
            }
            onInputFocus={() => updateState({ inputIsFocused: true })}
            onInputBlur={() => updateState({ inputIsFocused: false })}
            onClose={handleInputOnClose}
            onPlaceholderClick={() => updateState({ shouldShowInput: true })}
            onInputSubmit={(value) => handlePromptSubmit(value)}
            onToneChange={(tone: any) => updateState({ tone })}
          />

          {aiGenerationHasMessage && !aiGenerationIsLoading && (
            <AiMenuActions
              editor={editor}
              options={{ tone: state.tone, format: "rich-text" }}
              onAccept={handleOnAccept}
              onReject={handleOnReject}
            />
          )}
        </Card>

        {!aiGenerationIsLoading && (
          <ComboboxPopover
            flip={false}
            unmountOnHide
            autoFocus={false}
            onFocus={() => updateState({ inputIsFocused: true })}
            autoFocusOnShow={smoothFocusAndScroll}
            autoFocusOnHide={smoothFocusAndScroll}
            getAnchorRect={() => {
              return (
                tiptapAiPromptInputRef.current?.getBoundingClientRect() || null
              )
            }}
          >
            <ComboboxList
              style={{ display: shouldShowList ? "block" : "none" }}
            >
              <AiMenuItems />
            </ComboboxList>
          </ComboboxPopover>
        )}
      </MenuContent>
    </Menu>
  )
}

export function AiMenu({
  editor,
  anchorToSelection,
  plain,
}: {
  editor?: Editor | null
  anchorToSelection?: boolean
  plain?: boolean
}) {
  return (
    <AiMenuContent
      editor={editor}
      anchorToSelection={anchorToSelection}
      plain={plain}
    />
  )
}

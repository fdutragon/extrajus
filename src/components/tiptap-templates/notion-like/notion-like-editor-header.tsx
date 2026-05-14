"use client"

import { useContext } from "react"
import { EditorContext } from "@tiptap/react"
import { ThemeToggle } from "../../../components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"

// --- Tiptap UI ---
import { UndoRedoButton } from "../../../components/tiptap-ui/undo-redo-button"
import { MarkButton } from "../../../components/tiptap-ui/mark-button"
import { TurnIntoDropdown } from "../../../components/tiptap-ui/turn-into-dropdown"
import { ColorTextPopover } from "../../../components/tiptap-ui/color-text-popover"
import { LinkPopover } from "../../../components/tiptap-ui/link-popover"
import { TextAlignButton } from "../../../components/tiptap-ui/text-align-button"
import { ImproveDropdown } from "../../../components/tiptap-ui/improve-dropdown"
import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"

// --- UI Primitives ---
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "../../../components/tiptap-ui-primitive/toolbar"

// --- Styles ---
import "../../../components/tiptap-templates/notion-like/notion-like-editor-header.scss"

export function NotionEditorHeader() {
  const { editor } = useContext(EditorContext)!

  if (!editor) return null

  return (
    <header className="notion-like-editor-header">
      <Toolbar variant="ghost" className="h-full w-full flex flex-col items-center py-4 gap-4">
        {/* History Group */}
        <ToolbarGroup className="flex-col gap-1">
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>

        <ToolbarSeparator className="w-8 h-[1px] mx-0 my-1" />

        {/* AI Group */}
        <ToolbarGroup className="flex-col gap-1">
          <ImproveDropdown hideWhenUnavailable={true} />
        </ToolbarGroup>

        <ToolbarSeparator className="w-8 h-[1px] mx-0 my-1" />

        {/* Formatting Group */}
        <ToolbarGroup className="flex-col gap-1">
          <TurnIntoDropdown hideWhenUnavailable={true} />
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="underline" />
        </ToolbarGroup>

        <ToolbarSeparator className="w-8 h-[1px] mx-0 my-1" />

        {/* Links & Colors */}
        <ToolbarGroup className="flex-col gap-1">
          <LinkPopover hideWhenUnavailable={true} />
          <ColorTextPopover hideWhenUnavailable={true} />
        </ToolbarGroup>

        <ToolbarSeparator className="w-8 h-[1px] mx-0 my-1" />

        {/* Alignment */}
        <ToolbarGroup className="flex-col gap-1">
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
        </ToolbarGroup>

        <div className="mt-auto flex flex-col items-center gap-4 py-2">
          <CollaborationUsers />
          <ThemeToggle />
        </div>
      </Toolbar>
    </header>
  )
}

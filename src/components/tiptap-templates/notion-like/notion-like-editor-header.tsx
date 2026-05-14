"use client"

import { ThemeToggle } from "../../../components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"

// --- Tiptap UI ---
import { UndoRedoButton } from "../../../components/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import { Spacer } from "../../../components/tiptap-ui-primitive/spacer"
import { Separator } from "../../../components/tiptap-ui-primitive/separator"
import { ButtonGroup } from "../../../components/tiptap-ui-primitive/button-group"

// --- Styles ---
import "../../../components/tiptap-templates/notion-like/notion-like-editor-header.scss"

import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"

import { NotionToolbar } from "../../../components/tiptap-templates/notion-like/notion-like-editor-toolbar"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"

export function NotionEditorHeader() {
  return (
    <header className="notion-like-editor-header">
      <div className="notion-like-editor-header-toolbar">
        <NotionToolbar />
      </div>
      
      <Spacer />

      <div className="notion-like-editor-header-actions">
        <SignModal />
        
        <Separator orientation="vertical" className="h-4" />

        <ButtonGroup>
          <ButtonGroup>
            <UndoRedoButton action="undo" />
          </ButtonGroup>
          <ButtonGroup>
            <UndoRedoButton action="redo" />
          </ButtonGroup>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-4" />

        <ThemeToggle />

        <Separator orientation="vertical" className="h-4" />

        <CollaborationUsers />
      </div>
    </header>
  )
}

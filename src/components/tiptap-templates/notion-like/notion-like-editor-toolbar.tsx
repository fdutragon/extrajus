"use client"

import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
import { TurnIntoDropdown } from "../../../components/tiptap-ui/turn-into-dropdown"
import { MarkButton } from "../../../components/tiptap-ui/mark-button"
import { LinkPopover } from "../../../components/tiptap-ui/link-popover"
import { ColorTextPopover } from "../../../components/tiptap-ui/color-text-popover"
import { ImproveDropdown } from "../../../components/tiptap-ui/improve-dropdown"
import { TextAlignButton } from "../../../components/tiptap-ui/text-align-button"
import { ImageNodeFloating } from "../../../components/tiptap-node/image-node/image-node-floating"
import { MoreOptions } from "../../../components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../../components/tiptap-ui-primitive/toolbar"

export function NotionToolbar() {
  const { editor } = useTiptapEditor()

  if (!editor) return null

  return (
    <Toolbar variant="fixed" className="notion-toolbar-integrated">
      <ToolbarGroup>
        <ImproveDropdown hideWhenUnavailable={true} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TurnIntoDropdown hideWhenUnavailable={true} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="underline" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageNodeFloating />
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkPopover autoOpenOnLinkActive={false} />
        <ColorTextPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <MoreOptions />
    </Toolbar>
  )
}

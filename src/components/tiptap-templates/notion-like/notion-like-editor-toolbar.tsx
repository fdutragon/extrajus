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

import { ListButton } from "../../../components/tiptap-ui/list-button"
import { ResetAllFormattingButton } from "../../../components/tiptap-ui/reset-all-formatting-button"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"
import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"
import { ThemeToggle } from "../../../components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"

export function NotionToolbar({ 
  orientation = "horizontal",
  className
}: { 
  orientation?: "horizontal" | "vertical"
  className?: string
}) {
  const { editor } = useTiptapEditor()

  if (!editor) return null

  return (
    <Toolbar 
      variant="fixed" 
      orientation={orientation}
      className={cn(
        "flex items-center",
        orientation === "horizontal" ? "gap-2" : "flex-col gap-2 py-2",
        className
      )}
    >
      {/* AI Actions */}
      <ToolbarGroup>
        <ImproveDropdown hideWhenUnavailable={true} showText={orientation === "horizontal"} />
      </ToolbarGroup>

      <ToolbarSeparator orientation="vertical" />

      {/* Formatting Actions */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <ToolbarGroup>
          <TurnIntoDropdown hideWhenUnavailable={true} showText={orientation === "horizontal"} />
        </ToolbarGroup>

        <ToolbarSeparator orientation="vertical" />

        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="underline" />
          <MarkButton type="strike" />
          <ResetAllFormattingButton />
        </ToolbarGroup>

        <ToolbarSeparator orientation="vertical" />

        <ToolbarGroup>
          <ListButton type="bulletList" />
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </ToolbarGroup>
        
        <ToolbarSeparator orientation="vertical" />
        
        <ToolbarGroup>
          <LinkPopover autoOpenOnLinkActive={false} orientation={orientation} />
          <ColorTextPopover orientation={orientation} />
        </ToolbarGroup>
      </div>
    </Toolbar>
  )
}

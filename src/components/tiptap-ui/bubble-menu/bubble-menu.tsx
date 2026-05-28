"use client"

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code,
  MessageSquarePlus,
  Heading1,
  Heading2,
  Heading3,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BubbleMenuProps {
  editor: Editor | null
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="flex items-center gap-1 max-sm:gap-1 p-1 max-sm:p-1 bg-card border border-border rounded-xl max-sm:rounded-xl shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1 max-sm:gap-0.5 max-sm:pr-1 max-sm:mr-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("heading", { level: 1 }) && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("heading", { level: 2 }) && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("heading", { level: 3 }) && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("paragraph") && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Type size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("bold") && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("italic") && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 max-sm:h-7 max-sm:w-7 rounded-lg max-sm:rounded-lg transition-all", editor.isActive("underline") && "bg-primary/10 text-primary")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline size={14} className="max-sm:w-3.5 max-sm:h-3.5" />
        </Button>
      </div>
    </TiptapBubbleMenu>
  )
}

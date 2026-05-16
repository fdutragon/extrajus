"use client"

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus"
import { Editor } from "@tiptap/react"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code,
  Sparkles,
  ShieldAlert,
  MessageSquarePlus
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
      className="flex items-center gap-1 p-1 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-0.5 border-r border-zinc-100 dark:border-white/5 pr-1 mr-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-lg", editor.isActive("bold") && "bg-zinc-100 dark:bg-white/10 text-orange-500")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-lg", editor.isActive("italic") && "bg-zinc-100 dark:bg-white/10 text-orange-500")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-lg", editor.isActive("underline") && "bg-zinc-100 dark:bg-white/10 text-orange-500")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-1 pl-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-lg"
          onClick={() => (editor.commands as any).aiAsk?.()}
        >
          <Sparkles size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Lilith Audit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg"
        >
          <ShieldAlert size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Blindar</span>
        </Button>
      </div>
    </TiptapBubbleMenu>
  )
}

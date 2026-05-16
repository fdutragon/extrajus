"use client"

import { useState } from "react"
import { 
  ChevronLeft, 
  FileText, 
  UserPlus, 
  Check, 
  Download 
} from "lucide-react"
import Link from "next/link"
import { useCollab } from "../../../contexts/collab-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../../../components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"
import { UndoRedoButton } from "../../../components/tiptap-ui/undo-redo-button"
import { Separator } from "../../../components/tiptap-ui-primitive/separator"
import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"
import { cn } from "@/lib/utils"
import "../../../components/tiptap-templates/notion-like/notion-like-editor-header.scss"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"

export function NotionEditorHeader() {
  const { room } = useCollab()
  const [copied, setCopied] = useState(false)

  const handleInvite = () => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set("room", room)
    navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="notion-like-editor-header fixed top-0 left-0 w-full h-11 border-b border-border bg-background/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-between px-4 z-[100] transition-all hover:bg-background/60 dark:hover:bg-black/60">
      {/* Left: Navigation & Branding */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg transition-all">
            <ChevronLeft size={16} />
          </Button>
        </Link>
        <div className="flex items-baseline gap-2 group cursor-default">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary transition-all">Cânone</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">v2.4.0</span>
        </div>
        
        <Separator orientation="vertical" className="h-4 mx-1 opacity-20" />
        
        <div className="flex items-center gap-0.5">
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </div>
      </div>

      {/* Center: Document Title - The Soul of the Contract */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 group cursor-default">
        <div className="w-1 h-4 bg-primary/20 group-hover:bg-primary transition-all rounded-full" />
        <div className="flex items-center gap-2">
          <FileText size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">Contrato_Imperial_Alpha.docx</span>
        </div>
        <div className="w-1 h-4 bg-primary/20 group-hover:bg-primary transition-all rounded-full" />
      </div>

      {/* Right: Collaboration & The Ritual */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-2 border-r border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-7 gap-2 px-3 rounded-lg transition-all font-bold text-[9px] uppercase tracking-widest",
              copied ? "text-emerald-500 bg-emerald-500/10" : "text-primary hover:bg-primary/10"
            )}
            onClick={handleInvite}
          >
            {copied ? <Check size={12} /> : <UserPlus size={12} />}
            {copied ? "Convidar" : "Convidar"}
          </Button>
          
          <CollaborationUsers />
          <ThemeToggle />
        </div>
        
        <SignModal />
      </div>
    </header>
  )
}

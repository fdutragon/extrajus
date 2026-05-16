"use client"

import { 
  ChevronLeft,
  Share2,
  Download,
  MoreVertical,
  LayoutGrid,
  Library,
  BookOpen,
  History,
  FileText,
  Search,
  Settings2,
  Zap,
  ShieldCheck,
  BrainCircuit,
  PanelLeft,
  PanelRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { UserPlus, Check } from "lucide-react"
import { NotionEditor } from "@/components/tiptap-templates/notion-like/notion-like-editor"
import { SignModal } from "@/components/tiptap-ui/sign-modal/sign-modal"
import { CollaborationUsers } from "@/components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotionToolbar } from "@/components/tiptap-templates/notion-like/notion-like-editor-toolbar"
import { cn } from "@/lib/utils"

function InviteButton({ room }: { room: string }) {
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
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-7 gap-2 px-3 rounded-lg transition-all font-bold text-[9px] uppercase tracking-widest",
        copied ? "text-emerald-500 bg-emerald-500/10" : "text-orange-500 hover:bg-orange-500/10"
      )}
      onClick={handleInvite}
    >
      {copied ? <Check size={12} /> : <UserPlus size={12} />}
      {copied ? "Convidar" : "Convidar"}
    </Button>
  )
}

import { Suspense } from "react"

function EditorContent() {
  const searchParams = useSearchParams()
  const room = searchParams.get("room") || "extrajus-draft-001"
  const templateSlug = searchParams.get("template")

  return <NotionEditor room={room} templateSlug={templateSlug} />
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditorContent />
    </Suspense>
  )
}

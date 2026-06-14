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
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { UserPlus, Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { NotionEditor, LoadingSpinner } from "@/components/tiptap-templates/notion-like/notion-like-editor"
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
        "h-6 gap-2 px-3 rounded-lg transition-all font-bold text-[9px] uppercase tracking-widest",
        copied ? "text-primary bg-primary/10" : "text-primary hover:bg-primary/10"
      )}
      onClick={handleInvite}
    >
      {copied ? <Check size={12} /> : <UserPlus size={12} />}
      {copied ? "Link Copiado" : "Convidar"}
    </Button>
  )
}

import { Suspense } from "react"

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get("room")
  const templateSlug = searchParams.get("template")
  const mode = searchParams.get("mode")
  const readOnly = mode === "preview" || searchParams.get("readOnly") === "true"
  const [isPublic, setIsPublic] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (room) {
        localStorage.setItem("smartdoc_last_room", room)
        document.cookie = `smartdoc_last_room=${room}; path=/; max-age=31536000;`
      } else {
        let lastRoom = localStorage.getItem("smartdoc_last_room")
        if (!lastRoom) {
          const match = document.cookie.match(new RegExp('(^| )smartdoc_last_room=([^;]+)'))
          if (match) lastRoom = match[2]
        }
        if (lastRoom) {
          const params = new URLSearchParams(searchParams.toString())
          params.set("room", lastRoom)
          router.replace(`/editor-contratos?${params.toString()}`)
          return
        }
        
        const newRoom = `smartdoc-draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const params = new URLSearchParams(searchParams.toString())
        params.set("room", newRoom)
        router.replace(`/editor-contratos?${params.toString()}`)
      }
    }
  }, [room, searchParams])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsPublic(!session?.user)
    }
    checkAuth()
  }, [])

  if (isPublic === null || !room) {
    return <LoadingSpinner text="Iniciando Motor..." />
  }

  return <NotionEditor room={room} templateSlug={templateSlug} readOnly={readOnly} isPublic={isPublic} />
}

export default function EditorPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
      <EditorContent />
    </Suspense>
  )
}

"use client"

import { useContext, useEffect, useMemo } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import type { Doc as YDoc } from "yjs"
import { createPortal } from "react-dom"
import { SupabaseYjsProvider } from "../../../lib/supabase-yjs-provider"
import { Gemini } from "../../../components/tiptap-extension/gemini-ai-extension"
import { Spacer } from "../../../components/tiptap-extension/spacer-extension"
import { createClient } from "@/utils/supabase/client"
import { Logo } from "@/components/ui/logo"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Highlight } from "@tiptap/extension-highlight"
import { Placeholder, Selection } from "@tiptap/extensions"
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration"
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret"
import { Typography } from "@tiptap/extension-typography"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { UniqueID } from "@tiptap/extension-unique-id"
import {
  getHierarchicalIndexes,
  TableOfContents,
} from "@tiptap/extension-table-of-contents"
import { Underline } from "@tiptap/extension-underline"
import { Link as TiptapLink } from "@tiptap/extension-link"
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu"
import { Extension } from "@tiptap/core"

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearAiHighlights: () => ReturnType
    removeHighlightAtSelection: () => ReturnType
  }
}

// Extensão para gerenciar o highlight de novos textos da IA
const AiHighlightManager = Extension.create({
  name: 'aiHighlightManager',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'legalNode', 'notificationNode'],
        attributes: {
          aiHighlight: {
            default: false,
            parseHTML: element => element.hasAttribute('data-ai-highlight'),
            renderHTML: attributes => {
              if (!attributes.aiHighlight) return {}
              return { 'data-ai-highlight': 'true' }
            },
          },
        },
      },
    ]
  },

  addCommands(): any {
    return {
      clearAiHighlights: () => ({ tr, state, dispatch }: any) => {
        let changed = false
        state.doc.descendants((node: any, pos: number) => {
          if (node.attrs && node.attrs.aiHighlight) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              aiHighlight: false,
            })
            changed = true
          }
        })
        if (changed && dispatch) dispatch(tr)
        return changed
      },
      removeHighlightAtSelection: () => ({ tr, state, dispatch }: any) => {
        const { selection } = state
        const { $from } = selection
        let changed = false
        
        // Verifica o nó atual e ancestrais
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth)
          if (node.attrs && node.attrs.aiHighlight) {
            const pos = $from.before(depth)
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              aiHighlight: false,
            })
            changed = true
          }
        }
        
        if (changed && dispatch) dispatch(tr)
        return changed
      }
    }
  },

  onSelectionUpdate({ editor }) {
    ;(editor.commands as any).removeHighlightAtSelection()
  },

  onTransaction({ transaction, editor }) {
    if (transaction.docChanged) {
      ;(editor.commands as any).removeHighlightAtSelection()
    }
  },
})

// --- Hooks ---
import { useUiEditorState } from "../../../hooks/use-ui-editor-state"
import { useScrollToHash } from "../../../components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash"

// --- Custom Extensions ---
import { HorizontalRule } from "../../../components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { UiState } from "../../../components/tiptap-extension/ui-state-extension"
import { Image } from "../../../components/tiptap-node/image-node/image-node-extension"
import { NodeBackground } from "../../../components/tiptap-extension/node-background-extension"
import { NodeAlignment } from "../../../components/tiptap-extension/node-alignment-extension"
import { TocNode } from "../../../components/tiptap-node/toc-node/extensions/toc-node-extension"
import { LegalNode } from "../../../components/tiptap-node/legal-node/legal-node-extension"
import { NotificationNode } from "../../../components/tiptap-node/notification-node/notification-node-extension"
import { VariableNode } from "../../../components/tiptap-node/variable-node/variable-extension"

// --- Tiptap Node ---
import { ImageUploadNode } from "../../../components/tiptap-node/image-upload-node/image-upload-node-extension"

// --- Table Node ---
import { TableKit } from "../../../components/tiptap-node/table-node/extensions/table-node-extension"
import { TableHandleExtension } from "../../../components/tiptap-node/table-node/extensions/table-handle"
import { TableHandle } from "../../../components/tiptap-node/table-node/ui/table-handle/table-handle"
import { TableSelectionOverlay } from "../../../components/tiptap-node/table-node/ui/table-selection-overlay"
import { TableCellHandleMenu } from "../../../components/tiptap-node/table-node/ui/table-cell-handle-menu"
import { TableExtendRowColumnButtons } from "../../../components/tiptap-node/table-node/ui/table-extend-row-column-button"
import "../../../components/tiptap-node/table-node/styles/prosemirror-table.scss"
import "../../../components/tiptap-node/table-node/styles/table-node.scss"

import "../../../components/tiptap-node/blockquote-node/blockquote-node.scss"
import "../../../components/tiptap-node/code-block-node/code-block-node.scss"
import "../../../components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "../../../components/tiptap-node/list-node/list-node.scss"
import "../../../components/tiptap-node/image-node/image-node.scss"
import "../../../components/tiptap-node/heading-node/heading-node.scss"
import "../../../components/tiptap-node/paragraph-node/paragraph-node.scss"
import "../../../components/tiptap-node/legal-node/legal-node.scss"
import "../../../components/tiptap-node/notification-node/notification-node.scss"
import "../../../components/tiptap-node/variable-node/variable-node.scss"

// --- Tiptap UI ---
import { SlashDropdownMenu } from "../../../components/tiptap-ui/slash-dropdown-menu"
import { DragContextMenu } from "../../../components/tiptap-ui/drag-context-menu"

// --- Contexts ---
import { UserProvider, useUser } from "../../../contexts/user-context"
import { CollabProvider, useCollab } from "../../../contexts/collab-context"
import { AiProvider, useAi } from "../../../contexts/ai-context"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../../../lib/tiptap-utils"

// --- Styles ---
import "../../../components/tiptap-templates/notion-like/notion-like-editor.scss"

// --- Content ---
import { 
  ChevronLeft, 
  ChevronDown,
  FileText, 
  Library, 
  Settings2, 
  BrainCircuit, 
  Zap, 
  Check, 
  UserPlus,
  ShieldCheck,
  History,
  Brain,
  ArrowRight,
  ShieldAlert,
  Command,
  Cpu,
  PanelLeft,
  PanelRight,
  Search,
  Save,
  Lock,
  Activity,
  Sparkles,
  MousePointer2,
  Eye,
  Type,
  Minus,
  Plus,
  X
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Separator } from "../../../components/tiptap-ui-primitive/separator"
import { ThemeToggle } from "./notion-like-editor-theme-toggle"
import { useSearchParams } from "next/navigation"
import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"
import { GoogleAdsOnboarding } from "../../../components/tiptap-ui/onboarding-modal/google-ads-onboarding"
import { cn } from "@/lib/utils"
import { TurnIntoDropdown } from "../../../components/tiptap-ui/turn-into-dropdown"
import { MarkButton } from "../../../components/tiptap-ui/mark-button"
import { ResetAllFormattingButton } from "../../../components/tiptap-ui/reset-all-formatting-button"
import { ListButton } from "../../../components/tiptap-ui/list-button"
import { TextAlignButton } from "../../../components/tiptap-ui/text-align-button"
import { LinkPopover } from "../../../components/tiptap-ui/link-popover"
import { ColorTextPopover } from "../../../components/tiptap-ui/color-text-popover"
import { UndoRedoButton } from "../../../components/tiptap-ui/undo-redo-button"
import {
  AiMenu,
  AiMenuStateProvider,
} from "../../../components/tiptap-ui/ai-menu/ai-menu"
import { useAiMenuState } from "../../../components/tiptap-ui/ai-menu/ai-menu-hooks"
import { NotionToolbar } from "../../../components/tiptap-templates/notion-like/notion-like-editor-toolbar"
import { MobileToolbar } from "../../../components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar"
import { SetupErrorMessage } from "../../../components/tiptap-templates/notion-like/setup-error-message"
import { TocSidebar } from "../../../components/tiptap-node/toc-node"
import { ExportButton } from "../../../components/tiptap-ui/export-button/export-button"
import { DataRoom } from "../../../components/tiptap-ui/data-room/data-room"
import { BubbleMenu } from "../../../components/tiptap-ui/bubble-menu/bubble-menu"
import {
  TocProvider,
  useToc,
} from "../../../components/tiptap-node/toc-node/context/toc-context"
import { ListNormalizationExtension } from "../../../components/tiptap-extension/list-normalization-extension"
import { Indent } from "../../../components/tiptap-extension/indent-extension"
import { BrandSVG } from "@/components/brand-svg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const renderBoldText = (text: string) => {
  if (!text) return ""
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function InviteButton({ room }: { room: string }) {
  const [copied, setCopied] = useState(false)

  const handleInvite = () => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set("room", room)
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true)
      toast.success("Link de acesso copiado.")
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-8 gap-2 px-4 rounded-full transition-all font-black text-[9px] uppercase tracking-widest border border-transparent",
        copied ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/10"
      )}
      onClick={handleInvite}
    >
      {copied ? <Check size={12} /> : <UserPlus size={12} />}
      {copied ? "Pronto" : "Convidar"}
    </Button>
  )
}

export interface NotionEditorProps {
  room: string
  placeholder?: string
  templateSlug?: string | null
  readOnly?: boolean
  isPublic?: boolean
}

export interface EditorProviderProps {
  provider: SupabaseYjsProvider
  ydoc: YDoc
  placeholder?: string
  geminiKey: string | null
  templateSlug?: string | null
  readOnly?: boolean
  isPublic?: boolean
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Estabelecendo Conexão..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden select-none">
      {/* Background Dark Occult Luxury Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,176,59,0.06),transparent_65%)] animate-pulse duration-[4000ms]" />
      
      {/* Subtle background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-7 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Glowing Logo Container with Ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Glow */}
          <div className="absolute w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse duration-[2000ms]" />
          
          {/* Animated Spinner Ring */}
          <div className="absolute w-24 h-24 rounded-full border-2 border-primary/10 border-t-primary/70 animate-spin duration-[1500ms]" />
          
          {/* Logo with premium style */}
          <div className="relative p-4 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            <Logo iconSize={48} showText={false} className="flex-col text-center" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2 max-w-xs text-center px-4 relative z-10">
          <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase italic animate-pulse select-none">
            Iniciando Motor
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
  const { editor } = useContext(EditorContext)!
  const {
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    aiGenerationHasMessage,
    isDragging,
  } = useUiEditorState(editor)

  // Selection based effect to handle AI generation acceptance
  useEffect(() => {
    if (!editor) return

    if (
      !aiGenerationIsLoading &&
      aiGenerationIsSelection &&
      aiGenerationHasMessage
    ) {
      ;(editor.chain() as any).focus().aiAccept().run()
      ;(editor.commands as any).resetUiState()

      // Fix para Mobile: Após aceitar a geração, faz scroll para o topo do documento
      // para garantir que o título (H1) fique visível e não cortado pelo scroll automático do navegador
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        requestAnimationFrame(() => {
          const scrollContainer = document.querySelector('main') as HTMLElement | null
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
      }
    }
  }, [
    aiGenerationHasMessage,
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    editor,
  ])

  useScrollToHash()

  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className={cn(
        "notion-like-editor-content",
        isDragging ? "cursor-grabbing" : "cursor-text"
      )}
    >
      <DragContextMenu />
      <SlashDropdownMenu />
      {/* MobileToolbar removida conforme solicitado para simplificação total no mobile */}
    </EditorContent>
  )
}

const ORACLE_LOGS = [
  { id: 1, user: "Gestor", action: "Cláusula de Sigilo Otimizada", time: "12m atrás", version: "v2.4.1" },
  { id: 2, user: "ExtraJus AI", action: "Auditoria de Conformidade Concluída", time: "45m atrás", version: "v2.4.0" },
  { id: 3, user: "Gestor", action: "Importação de Modelo: M&A", time: "2h atrás", version: "v2.3.8" },
  { id: 4, user: "Sistema", action: "Sessão Colaborativa Iniciada", time: "4h atrás", version: "v2.3.0" },
];

const ORACLE_INSIGHTS = {
  score: 92,
  status: "Conformidade Elevada",
  vulnerabilityMsg: '"Identifiquei um ponto de atenção na cláusula 7.2. Deseja realizar a otimização técnica?"',
};

/**
 * Component that creates and provides the editor instance
 */
export function EditorLayout({ isPublic = false, readOnly: propReadOnly, templateSlug }: { isPublic?: boolean; readOnly?: boolean; templateSlug?: string | null } = {}) {
  const [oracleTab, setOracleTab] = useState("insights")
  const [fileName, setFileName] = useState("MINUTA-DE-CONTRATO")
  const [userContracts, setUserContracts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [auditResults, setAuditResults] = useState<any[]>([])
  const [isAuditing, setIsAuditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFocused, setIsFocused] = useState(true)
  const [credits, setCredits] = useState<number | null>(null)
  const [contractStatus, setContractStatus] = useState<string | null>(null)
  const [showEntranceGlow, setShowEntranceGlow] = useState(true)
  const [editorFocused, setEditorFocused] = useState(false)
  const [optimizedRisks, setOptimizedRisks] = useState<string[]>([])
  const [pendingOptimization, setPendingOptimization] = useState<string | null>(null)
  const { user } = useUser()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceGlow(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  const { state, updateState } = useAiMenuState()
  const { editor } = useContext(EditorContext)!
  const { aiGenerationIsLoading } = useUiEditorState(editor)

  // Sincronização de título com o modelo selecionado
  useEffect(() => {
    if (state.selectedContractType) {
      setFileName(state.selectedContractType)
    }
  }, [state.selectedContractType])

  // Mapeamento inicial de Template Slug para Tipo de Contrato
  useEffect(() => {
    if (templateSlug && !state.selectedContractType) {
      const formattedName = templateSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      updateState({ selectedContractType: formattedName })
    }
  }, [templateSlug, state.selectedContractType, updateState])

  useEffect(() => {
    const handleAiFinished = (e: any) => {
      if (pendingOptimization && e.detail?.success) {
        setOptimizedRisks(prev => [...prev, pendingOptimization])
        setPendingOptimization(null)
      } else if (e.detail?.success === false) {
        setPendingOptimization(null) // Revert if failed
      }
    }
    window.addEventListener("ai-generation-finished", handleAiFinished)
    return () => window.removeEventListener("ai-generation-finished", handleAiFinished)
  }, [pendingOptimization, editor])

  // Fix robusto para manter o header 100% visível no mobile mesmo com o teclado virtual aberto
  useEffect(() => {
    if (typeof window === "undefined") return

    // Trava definitiva do html e body no mobile para evitar qualquer tipo de tranco/scroll no layout viewport
    const html = document.documentElement
    const body = document.body
    let isLocked = false
    let origHtmlOverflow = ""
    let origHtmlHeight = ""
    let origBodyOverflow = ""
    let origBodyHeight = ""
    let origBodyPosition = ""
    let origBodyWidth = ""

    const lockBodyScroll = () => {
      if (window.innerWidth < 768 && !isLocked) {
        origHtmlOverflow = html.style.overflow || ""
        origHtmlHeight = html.style.height || ""
        origBodyOverflow = body.style.overflow || ""
        origBodyHeight = body.style.height || ""
        origBodyWidth = body.style.width || ""

        html.style.overflow = "hidden"
        html.style.height = "100dvh"
        body.style.overflow = "hidden"
        body.style.height = "100dvh"
        body.style.width = "100%"
        isLocked = true
      }
    }

    const unlockBodyScroll = () => {
      if (isLocked) {
        html.style.overflow = origHtmlOverflow
        html.style.height = origHtmlHeight
        body.style.overflow = origBodyOverflow
        body.style.height = origBodyHeight
        body.style.width = origBodyWidth
        isLocked = false
      }
    }

    lockBodyScroll()

    const handleViewportChange = () => {
      const header = document.querySelector("header") as HTMLElement | null
      if (!header) return
      
      const viewport = window.visualViewport
      if (!viewport) return

      if (window.innerWidth < 768) {
        // Ajusta a posição do header para acompanhar o topo da área visível (ignora o offset do teclado)
        const offsetTop = viewport.offsetTop
        header.style.transform = `translateY(${offsetTop}px)`
      } else {
        header.style.transform = ""
      }
    }

    const visualViewport = window.visualViewport
    if (visualViewport) {
      visualViewport.addEventListener("resize", handleViewportChange)
      visualViewport.addEventListener("scroll", handleViewportChange)
    }

    // Ouve focusin e focusout globais de forma instantânea para matar qualquer delay de renderização
    const handleFocusBlur = () => {
      requestAnimationFrame(handleViewportChange)
    }

    document.addEventListener("focusin", handleFocusBlur)
    document.addEventListener("focusout", handleFocusBlur)

    // Lida com resize de janela para ajustar a trava dinamicamente se necessário
    const handleResize = () => {
      if (window.innerWidth < 768) {
        lockBodyScroll()
      } else {
        unlockBodyScroll()
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener("resize", handleViewportChange)
        visualViewport.removeEventListener("scroll", handleViewportChange)
      }
      document.removeEventListener("focusin", handleFocusBlur)
      document.removeEventListener("focusout", handleFocusBlur)
      window.removeEventListener("resize", handleResize)
      unlockBodyScroll()
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    const handleFocus = () => setEditorFocused(true)
    const handleBlur = () => setEditorFocused(false)
    
    if (editor.isFocused) {
      setEditorFocused(true)
    }

    editor.on("focus", handleFocus)
    editor.on("blur", handleBlur)
    return () => {
      editor.off("focus", handleFocus)
      editor.off("blur", handleBlur)
    }
  }, [editor])
  const { provider, room } = useCollab()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true
    let channel: any = null

    const fetchProfileData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser || !active) return null

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", currentUser.id)
        .single()

      if (profile && active) {
        setCredits(profile.credits)
      }
      return currentUser
    }

    const setupRealtime = async () => {
      const currentUser = await fetchProfileData()
      if (!currentUser || !active) return

      channel = supabase
        .channel(`editor-layout-profile-realtime-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${currentUser.id}`
          },
          (payload: any) => {
            if (active) {
              setCredits(payload.new.credits)
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    const handleProfileUpdated = () => {
      fetchProfileData()
    }
    window.addEventListener('profile-updated', handleProfileUpdated)

    return () => {
      active = false
      window.removeEventListener('profile-updated', handleProfileUpdated)
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  const handleOpenPlans = () => {
    window.dispatchEvent(new Event("open-plans-modal"))
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Prevent copy, cut, paste events completely
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      toast.error("Colagem restrita. Redija o conteúdo diretamente no editor.")
    }

    // 2. Prevent key combinations for copying, pasting, and printing
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      if (isCtrlOrCmd && e.key?.toLowerCase() === "c") {
        e.preventDefault()
      }

      if (isCtrlOrCmd && e.key?.toLowerCase() === "v") {
        e.preventDefault()
        toast.error("Colagem bloqueada.")
      }

      if (isCtrlOrCmd && e.key?.toLowerCase() === "x") {
        e.preventDefault()
      }

      if (isCtrlOrCmd && e.key?.toLowerCase() === "p") {
        e.preventDefault()
        toast.error("Impressão bloqueada.")
      }

      if (e.shiftKey && e.metaKey && e.key?.toLowerCase() === "s") {
        e.preventDefault()
        setIsFocused(false)
        toast.error("Captura de tela detectada. Conteúdo ocultado.")
      }

      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault()
        setIsFocused(false)
        toast.error("Captura de tela detectada. Conteúdo ocultado.")
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.key === "PrtScn") {
        e.preventDefault()
        if (navigator.clipboard) {
          navigator.clipboard.writeText("Acesso não autorizado.")
        }
        toast.error("Captura de tela detectada.")
      }
    }

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    document.addEventListener("copy", handleCopy, true)
    document.addEventListener("cut", handleCut, true)
    document.addEventListener("paste", handlePaste, true)
    document.addEventListener("keydown", handleKeyDown, true)
    window.addEventListener("keyup", handleKeyUp, true)
    document.addEventListener("dragstart", handleDragStart, true)
    document.addEventListener("contextmenu", handleContextMenu, true)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("copy", handleCopy, true)
      document.removeEventListener("cut", handleCut, true)
      document.removeEventListener("paste", handlePaste, true)
      document.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("keyup", handleKeyUp, true)
      document.removeEventListener("dragstart", handleDragStart, true)
      document.removeEventListener("contextmenu", handleContextMenu, true)
    }
  }, [])

  const searchParams = useSearchParams()
  const readOnly = propReadOnly || searchParams?.get("mode") === "preview" || searchParams?.get("readOnly") === "true" || !editor
  const docType = searchParams?.get("tipo") || "contrato"

  const [signerEmail, setSignerEmail] = useState("")
  const [sealingCode, setSealingCode] = useState("")
  const [consentCheck, setConsentCheck] = useState(false)
  const [isSealing, setIsSealing] = useState(false)
  const [hasAudited, setHasAudited] = useState(false)

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const aiPromptOpen = true // Sempre visível

  const [isSaving, setIsSaving] = useState(false)
  const [fontSize, setFontSize] = useState<number>(14)
  const [fontFamily, setFontFamily] = useState<string>("Cambria")
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobileOrTablet = window.innerWidth < 1024
      if (isMobileOrTablet) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
        setFontSize(17) // Aumentado de 14 para 17 no mobile
      } else {
        setFontSize(14)
      }
    }
  }, [])

  const handleManualSave = async () => {
    if (!provider) {
      toast.error("Provedor não inicializado.")
      return
    }
    
    setIsSaving(true)
    const toastId = toast.loading("Salvando progresso...")
    
    try {
      const result = await provider.forceSave()
      toast.success(result.message, { id: toastId })
    } catch (e: any) {
      toast.error(`Erro ao salvar documento: ${e.message || e}`, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }
  const [searchQuery, setSearchQuery] = useState("")

  const text = editor?.getText() || ""
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }, [text])
  const charCount = useMemo(() => {
    return text.length
  }, [text])
  const readTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200))
  }, [wordCount])

  const auditScore = useMemo(() => {
    if (!hasAudited) return 0
    const unoptimizedRisks = auditResults.filter(r => !optimizedRisks.includes(r.id))
    if (unoptimizedRisks.length === 0) return 100
    const deductions = unoptimizedRisks.length * 5 // 5% por risco
    return Math.max(0, 100 - deductions)
  }, [auditResults, hasAudited, optimizedRisks]);

  const auditStatus = useMemo(() => {
    if (!hasAudited) return { label: "Inativa", color: "text-muted-foreground bg-muted border-border", barColor: "bg-muted", desc: "Sistema IA inativo. Inicie a auditoria para avaliar o documento." };
    if (auditScore >= 90) return { label: "Excelente ✨", color: "text-primary bg-primary/10 border-primary/20", barColor: "bg-primary", desc: "Este documento atingiu um nível de segurança elevado. As cláusulas estão tecnicamente precisas e em conformidade." };
    if (auditScore >= 70) return { label: "Seguro 👍", color: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400", barColor: "bg-emerald-600 dark:bg-emerald-500", desc: "O contrato possui boa estrutura de segurança. Alguns pontos de atenção foram identificados, mas a saúde técnica é satisfatória." };
    if (auditScore >= 50) return { label: "Vulnerável ⚠️", color: "text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400", barColor: "bg-amber-600 dark:bg-amber-500", desc: "Presença de ambiguidades e riscos moderados. Sugerimos aplicar os ajustes recomendados pela Inteligência Analítica." };
    return { label: "Risco Crítico 🔥", color: "text-red-700 bg-red-500/10 border-red-500/20 dark:text-red-400", barColor: "bg-red-600 dark:bg-red-500", desc: "Inconsistências críticas detectadas! O documento apresenta riscos jurídicos que demandam revisão imediata." };
  }, [hasAudited, auditScore]);

  const filteredContracts = useMemo(() => {
    return userContracts.filter(c => 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [userContracts, searchQuery])

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [templates, searchQuery])

  const runAudit = async () => {
    if (!editor) return

    const docText = editor.getText().trim();
    if (docText.length < 150) {
      toast.warning("O instrumento do contrato é muito curto. Insira pelo menos 150 caracteres.");
      return;
    }

    setIsAuditing(true);
    setAuditResults([]);
    setHasAudited(false);
    setOptimizedRisks([]);
    const toastId = toast.loading("Analisando conformidade e riscos...");
    
    try {
      const results = await (editor.commands as any).aiAuditRisk()
      const state = (editor.storage as any).ai.state
      if (state === "error") {
        setIsAuditing(false)
        setAuditResults([])
        setHasAudited(false)
        toast.dismiss(toastId)
        return
      }
      
      let filteredResults: any[] = []
      if (results && results.length > 0) {
        const clauses = getClauses()
        const assignedRiskIds = new Set<string>()

        // Para cada cláusula, associa no máximo 1 risco
        clauses.forEach((clause, idx, array) => {
          const nextClause = array[idx + 1]
          const start = clause.pos
          const end = nextClause?.pos ?? editor.state.doc.content.size
          const sectionText = editor.state.doc.textBetween(start, end).toLowerCase()

          // Acha o primeiro risco que pertence a esta cláusula e que ainda não foi associado
          const matchingRisk = results.find((risk: any) => {
            if (assignedRiskIds.has(risk.id)) return false
            const isMatch = sectionText.includes(risk.originalText.toLowerCase()) ||
                            risk.originalText.toLowerCase().includes(sectionText.substring(0, 30).toLowerCase())
            return isMatch
          })

          if (matchingRisk) {
            filteredResults.push(matchingRisk)
            assignedRiskIds.add(matchingRisk.id)
          }
        })
      }
      setAuditResults(filteredResults)
      setHasAudited(true)
      setIsAuditing(false)
      toast.success("Análise de conformidade concluída.", { id: toastId })
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || "O sistema falhou ao processar a auditoria.", { id: toastId })
      setIsAuditing(false)
    }
  }

  const getClauses = () => {
    if (!editor) return []
    const clauses: { id: string; title: string; pos: number }[] = []
    const isNotification = docType === "notificacao"
    let foundObject = isNotification ? true : false
    
    editor.state.doc.descendants((node: any, pos: number) => {
      const text = node.textContent.trim()
      const titleUpper = text.toUpperCase()

      // Define o que consideramos um "nó alvo" (cláusula)
      let isTargetNode = false

      if (isNotification) {
        isTargetNode = (node.type.name === "heading" && (node.attrs.level === 1 || node.attrs.level === 2)) ||
                       (node.type.name === "notificationNode" && node.attrs.level === 1)
      } else {
        // Para contratos, aceitamos Headings, LegalNodes nível 1, ou parágrafos curtos que pareçam títulos de cláusula
        isTargetNode = (node.type.name === "heading" && (node.attrs.level === 1 || node.attrs.level === 2)) ||
                       (node.type.name === "legalNode" && node.attrs.level === 1) ||
                       (node.type.name === "paragraph" && text.length > 5 && text.length < 80 && (titleUpper.includes("CLÁUSULA") || titleUpper.includes("DO OBJETO") || titleUpper.includes("DAS OBRIGAÇÕES") || titleUpper.includes("DO PREÇO") || titleUpper.includes("DO FORO")))
      }

      if (isTargetNode) {
        if (!isNotification) {
          // Critério de início: Ignora tudo antes da primeira menção a "OBJETO"
          if (!foundObject && (titleUpper.includes("OBJETO") || titleUpper.includes("DO OBJETO"))) {
            foundObject = true
          }

          // Critério de parada: Para de adicionar se chegar no "FORO" ou Assinaturas
          if (titleUpper.includes("FORO") || titleUpper.includes("DO FORO") || titleUpper.includes("ASSINATURA")) {
            return false
          }
        }

        // Só adiciona se já tiver passado pelas qualificações (ou se for notificação, que sempre é true)
        if (foundObject) {
          clauses.push({
            id: `clause-${pos}`,
            title: text,
            pos
          })
        }
      }
      return true
    })

    // Fallback de resiliência: se o documento tiver texto, mas não achou os padrões estritos acima (ex: colagem pura), 
    // tenta achar pelo menos os títulos em negrito (paragraphs curtos)
    if (clauses.length === 0 && editor.getText().length > 150) {
       editor.state.doc.descendants((node: any, pos: number) => {
         const text = node.textContent.trim()
         if (node.type.name === "paragraph" && text.length > 5 && text.length < 100 && /^[A-Z0-9]/.test(text)) {
           // Checa se o texto tem formatação bold ou se está em caixa alta
           const isUpperCase = text === text.toUpperCase()
           const hasBoldMark = node.marks && node.marks.some((m: any) => m.type.name === "bold")
           
           if (isUpperCase || hasBoldMark) {
             clauses.push({ id: `clause-fb-${pos}`, title: text, pos })
           }
         }
       })
    }

    return clauses
  }

  const getClauseSubItems = (clausePos: number, nextClausePos?: number) => {
    if (!editor) return []
    const subItems: { id: string; text: string; pos: number }[] = []
    const start = clausePos
    const end = nextClausePos ?? editor.state.doc.content.size
    const isNotification = docType === "notificacao"

    editor.state.doc.nodesBetween(start, end, (node: any, pos: number) => {
      if (pos === clausePos) return true

      const isSubNode = isNotification
        ? (node.type.name === "paragraph" || node.type.name === "notificationNode")
        : (node.type.name === "paragraph" || node.type.name === "legalNode")

      if (isSubNode) {
        const textContent = node.textContent.trim()
        // Ignora títulos e textos extremamente curtos
        if (textContent.length > 5 && node.attrs?.level !== 1) {
          subItems.push({
            id: `sub-${pos}`,
            text: textContent,
            pos
          })
        }
      }
      return true
    })
    return subItems
  }


  const getClauseRisks = (clausePos: number, nextClausePos?: number) => {
    if (!editor || auditResults.length === 0) return []
    const start = clausePos
    const end = nextClausePos ?? editor.state.doc.content.size
    const sectionText = editor.state.doc.textBetween(start, end).toLowerCase()
    
    const risks = auditResults.filter(risk => 
      sectionText.includes(risk.originalText.toLowerCase()) ||
      risk.originalText.toLowerCase().includes(sectionText.substring(0, 30).toLowerCase())
    )
    return risks.slice(0, 1)
  }

  const scrollToPosition = (pos: number) => {
    if (!editor) return

    // 1. Move o cursor para o início do nó sem forçar scroll automático do TipTap
    editor.chain().focus().setTextSelection(pos).run()

    // 2. Aguarda o próximo frame para o DOM refletir a seleção
    requestAnimationFrame(() => {
      try {
        // 3. Obtém o nó DOM real na posição ProseMirror
        const domInfo = editor.view.domAtPos(pos)
        let element: HTMLElement | null = domInfo.node.nodeType === Node.TEXT_NODE
          ? domInfo.node.parentElement
          : (domInfo.node as HTMLElement)

        // 4. Sobe na árvore até encontrar um bloco de nível de parágrafo/heading real
        while (element && element.nodeType === Node.ELEMENT_NODE) {
          const display = window.getComputedStyle(element).display
          if (display === 'block' || display === 'table' || element.tagName === 'P' || element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || element.dataset?.type === 'legal-node') {
            break
          }
          element = element.parentElement
        }

        if (!element) return

        // 5. Encontra o container de scroll principal
        const scrollContainer = document.querySelector('main') as HTMLElement | null
        if (!scrollContainer) return

        // 6. Altura do header fixo + margem de respiro visual
        const HEADER_OFFSET = 88

        // 7. Calcula a posição absoluta dentro do scrollContainer
        const elementRect = element.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()
        const absoluteTop = elementRect.top - containerRect.top + scrollContainer.scrollTop

        // 8. Desliza suavemente até o início exato do bloco
        scrollContainer.scrollTo({
          top: absoluteTop - HEADER_OFFSET,
          behavior: 'smooth',
        })
      } catch {
        // Fallback silencioso se o DOM ainda não estiver pronto
      }
    })
  }

  const handleOptimizeClause = (clausePos: number, nextClausePos?: number, riskId?: string, suggestionReason?: string) => {
    if (!editor) return
    const start = clausePos
    let end = nextClausePos ?? editor.state.doc.content.size
    const isNotification = docType === "notificacao"

    // Prevenção Crítica: Se não houver próxima cláusula (última seção), 
    // precisamos garantir que o 'end' não ultrapasse o início do FORO ou Assinaturas.
    if (!nextClausePos) {
      editor.state.doc.descendants((node: any, pos: number) => {
        if (pos <= start) return true
        
        const text = node.textContent.trim().toUpperCase()
        // Verifica se é um título ou um parágrafo que inicia a seção de encerramento
        const isLikelyEndSection = 
          (node.type.name === "heading") || 
          (node.type.name === "legalNode" && node.attrs.level === 1) ||
          (node.type.name === "notificationNode" && node.attrs.level === 1) ||
          (node.type.name === "paragraph" && text.length < 50 && (text.startsWith("FORO") || text.startsWith("DO FORO") || text.startsWith("ELEIÇÃO")))

        if (isLikelyEndSection && (text.includes("FORO") || text.includes("DO FORO") || text.includes("ASSINATURAS") || text.includes("DATA E ASSINATURA"))) {
          end = pos
          return false // Para o escaneamento aqui
        }
        return true
      })
    }
    
    // Limpa highlights anteriores
    ;(editor.commands as any).clearAiHighlights()

    // Seleciona a cláusula de referência
    editor.chain().focus().setTextSelection({ from: start, to: end }).run()
    
    // Prompt automático que REESCREVE a cláusula atual com as melhorias sugeridas
    const nodeType = isNotification ? "NotificationNodes" : "LegalNodes"
    const nodeTag = isNotification ? "notification-node" : "legal-node"
    const sectionLabel = isNotification ? "seção da notificação" : "cláusula"

    const addPrompt = `Reescreva a ${sectionLabel} selecionada para aprimorar sua segurança jurídica e abrangência técnica, incorporando a seguinte otimização: "${suggestionReason || 'aperfeiçoamento de redação técnica'}".

DIRETRIZES DE REDAÇÃO JURÍDICA:
1. REESCREVA integralmente o conteúdo atual para assegurar coesão, sem criar novas seções adjacentes.
2. Utilize exclusivamente a estrutura de ${nodeType}:
   - Epígrafe/Título: <div data-type="${nodeTag}" data-level="1">TÍTULO</div>
   - Caput/Conteúdo: <div data-type="${nodeTag}" data-level="2">Texto...</div>
   - Incisos/Parágrafos/Subitens: <div data-type="${nodeTag}" data-level="3">Texto do item...</div>
3. CONCISÃO OBRIGATÓRIA: Evite parágrafos extensos. Se a matéria exigir detalhamento, fracione-a OBRIGATORIAMENTE em subitens (nível 3).
4. É terminantemente PROIBIDO o uso de <p>, ul, ol ou numeração manual (o sistema gerencia a indexação).
5. Empregue linguagem solene, técnica e erudita, priorizando a mitigação de riscos e a máxima preservação dos direitos da parte representada.`

    // Dispara a geração da IA SUBSTITUINDO a seleção atual
    ;(editor.chain() as any).aiTextPrompt({
      text: addPrompt,
      insert: false, // Alterado para false para substituir a cláusula selecionada
      stream: true,
      format: "rich-text",
    }).run()
    
    if (riskId) {
      setPendingOptimization(riskId)
    }
  }

  const handleConfirmSignature = async () => {
    if (isPublic) {
      window.dispatchEvent(new Event("open-plans-modal"))
      return
    }

    if (!signerEmail) {
      toast.error("Informe seu e-mail.")
      return
    }
    if (!sealingCode || sealingCode.length !== 6) {
      toast.error("Informe o código de 6 dígitos.")
      return
    }
    if (!consentCheck) {
      toast.error("Você precisa aceitar o consentimento digital.")
      return
    }

    setIsSealing(true)
    const toastId = toast.loading("Registrando assinatura digital...")

    try {
      const response = await fetch("/api/sign/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: room,
          sealingCode,
          email: signerEmail
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      toast.success("Assinatura registrada com sucesso.", { id: toastId })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar assinatura.", { id: toastId })
    } finally {
      setIsSealing(false)
    }
  }

  useEffect(() => {
    const fetchArsenal = async () => {
      const { data: currentContract } = await supabase.from('contracts').select('title, status').eq('id', room).single()
      if (currentContract?.title) setFileName(currentContract.title)
      if (currentContract?.status) setContractStatus(currentContract.status)

      const { data: contracts } = await supabase.from('contracts').select('id, title, status').order('updated_at', { ascending: false }).limit(10)
      if (contracts) setUserContracts(contracts)

      const { data: tmpls } = await supabase.from('templates').select('id, title, slug').limit(10)
      if (tmpls) setTemplates(tmpls)

      const { data: logs } = await supabase.from('yjs_updates').select('created_at').eq('contract_id', room).order('created_at', { ascending: false }).limit(10)
      if (logs) {
        setHistoryLogs(logs.map((log, i) => ({
          id: i, user: "Sistema", action: "Sincronização de Dados", time: new Date(log.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }), version: `v${logs.length - i}.0`
        })))
      }
    }
    fetchArsenal()

    // Inscrição em tempo real na tabela de contratos para sincronização reativa global
    const channel = supabase
      .channel('realtime-contracts-library')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDoc = payload.new
            setUserContracts((prev) => {
              if (prev.some(c => c.id === newDoc.id)) return prev
              return [newDoc, ...prev].slice(0, 10)
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedDoc = payload.new
            setUserContracts((prev) =>
              prev.map((c) => (c.id === updatedDoc.id ? { ...c, title: updatedDoc.title, status: updatedDoc.status } : c))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedDoc = payload.old
            setUserContracts((prev) => prev.filter((c) => c.id !== deletedDoc.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room, supabase])

  // Atualização instantânea local (latência zero) do contrato ativo na listagem da barra lateral
  useEffect(() => {
    if (!room || fileName === "MINUTA-DE-CONTRATO") return
    setUserContracts((prev) =>
      prev.map((c) => (c.id === room ? { ...c, title: fileName } : c))
    )
  }, [fileName, room])

  useEffect(() => {
    if (!room || readOnly || fileName === "MINUTA-DE-CONTRATO") return
    const delayDebounceFn = setTimeout(async () => {
      await supabase.from('contracts').update({ title: fileName }).eq('id', room)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [fileName, room, readOnly, supabase])

  // Sincroniza dinamicamente o título do documento (fileName) com o primeiro <h1> inserido no editor (especialmente por geração da IA)
  useEffect(() => {
    if (!editor || readOnly) return

    const handleUpdate = () => {
      let firstH1 = ""
      editor.state.doc.descendants((node: any) => {
        if (node.type.name === "heading" && node.attrs.level === 1) {
          firstH1 = node.textContent.trim()
          return false // Stop traversal
        }
        return true
      })

      if (firstH1 && firstH1.length > 2) {
        // Limpa possíveis colchetes ou espaços sobressalentes
        const cleanTitle = firstH1
          .replace(/[\[\]]/g, "")
          .trim()
        
        if (cleanTitle) {
          if (cleanTitle !== fileName) {
            setFileName(cleanTitle)
          }

          // Sincroniza RIGOROSAMENTE o estado global da IA com o título do documento.
          // Isso garante que após a primeira edição, ou se o usuário alterar o H1,
          // o prompt da IA (que usa o selectedContractType) não perca o nome do contrato.
          if (state.selectedContractType !== cleanTitle) {
            updateState({ selectedContractType: cleanTitle })
          }
        }
      }
    }

    editor.on("update", handleUpdate)
    return () => {
      editor.off("update", handleUpdate)
    }
  }, [editor, fileName, readOnly])

  return (
    <div 
      className="flex flex-col bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30"
      style={{ height: 'var(--vh, 100dvh)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --vh: 100dvh;
        }
        .font-heading, :is(aside, header, [role="dialog"], .ai-prompt-wrapper) {
          --font-heading: var(--font-sans) !important;
          font-family: var(--font-sans) !important;
        }
        .tiptap.ProseMirror {
          font-family: ${fontFamily === "Cambria" ? '"Cambria", "Georgia", serif' : fontFamily === "Inter" ? '"Inter", sans-serif' : fontFamily === "Times New Roman" ? '"Times New Roman", serif' : '"JetBrains Mono", monospace'} !important;
          font-size: clamp(${(fontSize - 1) / 16}rem, calc(${(fontSize - 2) / 16}rem + 0.8vw), ${(fontSize + 2) / 16}rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[14\\.5px\\] {
          font-size: clamp(0.85rem, calc(0.7rem + 0.4vw), 1rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-xs, :is(aside, header, .ai-prompt-wrapper) .text-\\[12px\\], :is(aside, header, .ai-prompt-wrapper) .text-\\[13px\\] {
          font-size: clamp(0.8125rem, calc(0.65rem + 0.35vw), 0.9rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[11px\\] {
          font-size: clamp(0.75rem, calc(0.6rem + 0.35vw), 0.8rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[10px\\] {
          font-size: clamp(0.7rem, calc(0.55rem + 0.3vw), 0.75rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[9\\.5px\\], :is(aside, header, .ai-prompt-wrapper) .text-\\[9px\\] {
          font-size: clamp(0.65rem, calc(0.5rem + 0.3vw), 0.7rem) !important;
        }
        .scrollbar-minimalist::-webkit-scrollbar {
          width: 3px !important;
          height: 3px !important;
        }
        .scrollbar-minimalist::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .scrollbar-minimalist::-webkit-scrollbar-thumb {
          background: var(--border) !important;
          border-radius: 99px !important;
        }
        .scrollbar-minimalist::-webkit-scrollbar-thumb:hover {
          background: var(--primary) !important;
        }
        @keyframes border-spin {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse-shadow {
          0%, 100% {
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 0 20px -3px hsl(var(--primary)/0.12);
          }
          50% {
            box-shadow: 0 20px 45px -8px rgba(0, 0, 0, 0.28), 0 0 35px 2px hsl(var(--primary)/0.24);
          }
        }
        div.editor-glow-container {
          position: relative;
          padding: 2.5px;
          border-radius: 32px;
          overflow: hidden;
          background: hsl(var(--border)/0.4);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation: pulse-shadow 4.5s ease-in-out infinite; /* Sempre ativo */
        }
        @media screen and (max-width: 768px) {
          div.editor-glow-container {
            padding: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            animation: none !important;
          }
          div.editor-glow-container::before {
            display: none !important;
          }
        }
        .editor-glow-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            transparent,
            hsl(var(--primary)/0.1),
            hsl(var(--primary)/0.9),
            hsl(var(--primary)/0.4),
            transparent 50%
          );
          animation: border-spin 6s linear infinite;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editor-glow-container.glowing::before {
          opacity: 1;
        }
        .editor-glow-container.glowing {
          background: transparent;
        }
        .editor-glow-content {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100%;
          border-radius: 30px;
        }
        @media screen and (max-width: 768px) {
          .editor-glow-content {
             border-radius: 0 !important;
          }
        }
        @keyframes placeholder-text-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes placeholder-bars-shimmer {
          0% {
            background-position: -200% 0, 0 0;
          }
          100% {
            background-position: 200% 0, 0 0;
          }
        }
        @keyframes skeleton-breath {
          0%, 100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.65;
          }
        }
        .tiptap.is-editor-empty p::before {
          content: attr(data-placeholder);
          background: linear-gradient(
            90deg,
            var(--placeholder-color, rgba(120,120,120,0.4)) 20%,
            hsl(var(--primary)/0.65) 40%,
            hsl(var(--primary)/0.95) 50%,
            hsl(var(--primary)/0.65) 60%,
            var(--placeholder-color, rgba(120,120,120,0.4)) 80%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          animation: placeholder-text-shimmer 3.5s infinite linear;
          font-weight: 800;
          font-style: normal;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          opacity: 0.6;
          transition: all 0.3s ease;
          display: block;
          text-align: center;
          margin-bottom: 2rem;
        }
        .tiptap.is-editor-empty p::after {
          content: '';
          display: block;
          margin-top: 1rem;
          height: 400px;
          width: 100%;
          background: 
            /* Título centralizado */
            linear-gradient(to right, hsl(var(--muted)/0.2) 0%, hsl(var(--muted)/0.2) 100%) no-repeat center 0 / 40% 12px,
            
            /* Qualificação das partes */
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 45px / 95% 8px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 65px / 90% 8px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 85px / 40% 8px,

            /* Cláusula 1 */
            linear-gradient(to right, hsl(var(--muted)/0.15) 0%, hsl(var(--muted)/0.15) 100%) no-repeat 0 130px / 30% 10px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 155px / 100% 8px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 175px / 95% 8px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 195px / 85% 8px,

            /* Cláusula 2 */
            linear-gradient(to right, hsl(var(--muted)/0.15) 0%, hsl(var(--muted)/0.15) 100%) no-repeat 0 240px / 35% 10px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 265px / 98% 8px,
            linear-gradient(to right, hsl(var(--muted)/0.1) 0%, hsl(var(--muted)/0.1) 100%) no-repeat 0 285px / 92% 8px,
            
            /* Assinaturas no fim */
            linear-gradient(to right, hsl(var(--muted)/0.2) 0%, hsl(var(--muted)/0.2) 100%) no-repeat 10% 360px / 30% 1.5px,
            linear-gradient(to right, hsl(var(--muted)/0.2) 0%, hsl(var(--muted)/0.2) 100%) no-repeat 60% 360px / 30% 1.5px;
          
          mask-image: linear-gradient(to bottom, black 70%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent);
          animation: skeleton-breath 3.5s ease-in-out infinite;
          pointer-events: none;
        }
      ` }} />
      
      <header className="relative w-full h-16 sm:h-[clamp(2.5rem,4vh,3.25rem)] border-b border-border bg-background/60 backdrop-blur-2xl flex items-center justify-between px-3 z-[1000] transition-all duration-500 group shrink-0">
        <div className="flex items-center gap-1.5 max-sm:gap-2">
          {!readOnly && !isPublic && (
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300 group/back flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          )}

          {/* ThemeToggle no início apenas no mobile */}
          <div className="sm:hidden flex items-center">
            <ThemeToggle />
          </div>

          {!readOnly && (
            <div className="flex items-center gap-0.5 h-9">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                className="h-9 w-9 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all flex items-center justify-center p-0 border border-transparent hover:border-border/40"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-1 justify-center select-none min-w-[24px]">
                <span className="text-[12px] font-black text-foreground/80">{fontSize}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="h-9 w-9 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all flex items-center justify-center p-0 border border-transparent hover:border-border/40"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          {readOnly && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase">Somente Leitura</Badge>
          )}
        </div>

        {/* Persistent Centralized Branding - The Heart of ExtraJus */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none whitespace-nowrap z-[110]">
          <Logo showText={true} iconSize={typeof window !== 'undefined' && window.innerWidth < 1024 ? 28 : 24} variant="chrome" />
        </div>

        {!readOnly && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center h-full gap-2 z-[111] max-sm:hidden pointer-events-none">
            <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity duration-500 pointer-events-auto">
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <span className="h-3 w-[1px] bg-border mx-1" />
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />
            </div>
            {/* Logo gap - maintains toolbar spacing while allowing the persistent logo layer below to show through */}
            <div className="w-32 h-full border-x border-zinc-500/10 shrink-0" />
            <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity duration-500 max-md:hidden pointer-events-auto">
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />
              <ColorTextPopover orientation="horizontal" />
            </div>
          </div>
        )}

        <div className="flex-none flex items-center gap-1.5 max-sm:gap-1">


          {!readOnly && !isPublic && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenPlans}
              className="h-6 gap-1 px-2 rounded-md text-primary hover:bg-primary/10 transition-all font-bold text-[8px] uppercase tracking-widest flex items-center border border-primary/20 bg-primary/5 hover:border-primary/45 shadow-sm shadow-primary/5 group max-sm:hidden"
            >
              <Brain className="w-3 h-3 text-primary animate-pulse shrink-0 group-hover:scale-110 transition-transform" />
              <span>{credits !== null ? `${credits} Sinapses` : "..."}</span>
            </Button>
          )}

          {!readOnly && editor && !editor.isEmpty && !aiGenerationIsLoading && (
            <>
              <div>
                <ExportButton isPublic={isPublic} docType={docType} title={fileName} content={editor?.getHTML() || ""} />
              </div>
              {!isPublic && (
                <div className="flex items-center gap-1 pr-1.5 border-r border-border/50 max-sm:hidden">
                  <SignModal title={fileName} />
                </div>
              )}
            </>
          )}

          <div className="flex items-center sm:hidden">
            {/* ThemeToggle removido daqui pois agora está no início do header no mobile */}
          </div>
          <div className="max-sm:hidden flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>



      <div className={cn("flex-1 flex relative overflow-hidden min-h-0")}>
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent max-sm:p-0 sm:p-4 sm:pb-32 relative z-10">
            {/* Subtle occult background glow behind the sheet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6000ms] max-sm:hidden" />


            <div className={cn(
              "w-full max-w-full lg:max-w-[clamp(37.5rem,45vw,56.25rem)] mx-auto editor-glow-container max-sm:!p-0 max-sm:!rounded-none transition-all duration-700 shadow-2xl max-sm:shadow-none",
              (showEntranceGlow || editorFocused) && "glowing"
            )}>
              <div className="w-full h-full sm:bg-card/90 sm:dark:bg-card/75 sm:backdrop-blur-xl sm:rounded-[30px] max-sm:rounded-none px-4 max-sm:px-0 py-8 max-sm:pt-4 max-sm:pb-48 sm:px-14 sm:py-12 relative min-h-[50rem] md:min-h-[74.25rem] editor-glow-content max-sm:bg-transparent max-sm:backdrop-blur-none max-sm:shadow-none">
                {/* Grain overlay for paper feel */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-[30px] max-sm:hidden" />

                <div className="relative z-10">
                  {!readOnly && (
                    <div className="max-sm:hidden">
                      <BubbleMenu editor={editor} />
                    </div>
                  )}
                  <EditorContentArea />
                </div>
              </div>
            </div>
          </main>
          
          {!readOnly && aiPromptOpen && (
            <div className="absolute sm:bottom-12 max-sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[30rem] z-[100] px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 ai-prompt-wrapper flex justify-center">
               <AiMenu plain={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = "Modelo de Contrato", geminiKey, templateSlug, readOnly, isPublic } = props
  const { user } = useUser()
  const { setTocContent } = useToc()
  const { room } = useCollab()

  const [isSynced, setIsSynced] = useState(provider?.isSynced ?? false)

  useEffect(() => {
    if (!provider) return
    setIsSynced(provider.isSynced)
    const handleStatus = (event: any) => {
      if (event?.status === "connected" || event[0]?.status === "connected") setIsSynced(true)
    }
    provider.on("status", handleStatus)
    return () => provider.off("status", handleStatus)
  }, [provider])

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: { attributes: { class: "notion-like-editor" }, scrollThreshold: 0, scrollMargin: 0 },
    extensions: [
      StarterKit.configure({ undoRedo: false, horizontalRule: false, dropcursor: { width: 2 } }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph", "legalNode", "notificationNode"] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({ provider, user: { id: user.id, name: user.name, color: user.color } }),
      Placeholder.configure({ 
        placeholder, 
        emptyNodeClass: "is-empty with-slash",
        showOnlyWhenEditable: false,
      }),
      TableKit.configure({ table: { resizable: true, cellMinWidth: 120 } }),
      NodeBackground.configure({ types: ["paragraph", "heading", "blockquote", "tableCell", "tableHeader", "tocNode", "legalNode", "notificationNode"] }),
      NodeAlignment, Superscript, Subscript, Indent, TextStyle, Color, Highlight.configure({ multicolor: true }), Selection, Image,
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {
          setTocContent((prev: any) => {
            if (!prev || prev.length !== content.length) return content
            for (let i = 0; i < prev.length; i++) {
              if (prev[i].id !== content[i].id || prev[i].textContent !== content[i].textContent || prev[i].level !== content[i].level || prev[i].isActive !== content[i].isActive) return content
            }
            return prev
          })
        },
      }),
      TableHandleExtension, ListNormalizationExtension, LegalNode, NotificationNode, VariableNode,
      ImageUploadNode.configure({ accept: "image/*", maxSize: MAX_FILE_SIZE, limit: 3, upload: handleImageUpload, onError: (error) => console.error("Upload failed:", error) }),
      UniqueID.configure({ types: ["table", "paragraph", "bulletList", "orderedList", "heading", "blockquote", "codeBlock", "tocNode", "legalNode", "notificationNode"], filterTransaction: (transaction) => !isChangeOrigin(transaction) }),
      Typography, UiState, TocNode.configure({ topOffset: 48 }), Gemini.configure({ apiKey: geminiKey || "" }), Spacer, BubbleMenuExtension, AiHighlightManager,
    ],
    onUpdate({ transaction }) {
      if (transaction.docChanged && !isChangeOrigin(transaction)) {
        window.dispatchEvent(new CustomEvent("user-manual-edit"))
      }
    },
  })

  useEffect(() => {
    if (!editor || !templateSlug) return
    const checkAndFill = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      if (editor.isEmpty) {
        const { data } = await createClient().from("templates").select("content").eq("slug", templateSlug).single()
        if (data?.content) {
          editor.commands.setContent(data.content)
          toast.success("Modelo carregado.")
        }
      }
    }
    checkAndFill()
  }, [editor, templateSlug])

  // Load saved content if this is a newly purchased/created contract with no Yjs updates yet
  useEffect(() => {
    if (!editor || !room) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room)
    if (!isUuid) return

    const loadPurchasedContent = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for Yjs provider to sync/initialize
      if (editor.isEmpty) {
        const client = createClient()
        // 1. Verify if we have any Yjs updates in the database for this contract
        const { data: logs } = await client.from('yjs_updates').select('id').eq('contract_id', room).limit(1)
        
        // 2. If there are no Yjs updates, load the content from the 'documents' table
        if (!logs || logs.length === 0) {
          console.log("[NotionEditor] Newly purchased contract detected. Loading content fallback...")
          const { data: docData } = await client.from("documents").select("content, title").eq("id", room).single()
          if (docData?.content) {
            editor.commands.setContent(docData.content)
            toast.success("Documento carregado da sua conta.")
          }
        }
      }
    }
    loadPurchasedContent()
  }, [editor, room])

  const contextValue = useMemo(() => (editor ? { editor } : null), [editor])
  if (!editor || !contextValue || !isSynced) return <LoadingSpinner text="Sincronizando ambiente da inteligência artificial..." />

  return (
    <EditorContext.Provider value={contextValue}>
      <EditorLayout isPublic={isPublic} readOnly={readOnly} templateSlug={templateSlug} />
    </EditorContext.Provider>
  )
}

export function NotionEditor({ room, placeholder = "Modelo de Contrato", templateSlug, readOnly, isPublic }: NotionEditorProps) {
  return (
    <UserProvider>
      <CollabProvider room={room} key={room}>
        <AiProvider>
          <TocProvider>
            <AiMenuStateProvider>
              <NotionEditorContent placeholder={placeholder} templateSlug={templateSlug} readOnly={readOnly} isPublic={isPublic} />
            </AiMenuStateProvider>
          </TocProvider>
        </AiProvider>
      </CollabProvider>
    </UserProvider>
  )
}

export function NotionEditorContent({ placeholder = "Modelo de Contrato", templateSlug, readOnly: propReadOnly, isPublic }: { placeholder?: string, templateSlug?: string | null, readOnly?: boolean, isPublic?: boolean }) {
  const { provider, ydoc, setupError: collabSetupError, room } = useCollab()
  const { geminiKey, setupError: aiSetupError } = useAi()
  const [contractStatus, setContractStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!room) return
    const fetchStatus = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('contracts').select('status').eq('id', room).single()
      if (data?.status) {
        setContractStatus(data.status)
      }
    }
    fetchStatus()
  }, [room])

  const readOnly = propReadOnly || (contractStatus !== null && contractStatus !== 'draft')

  if (collabSetupError || aiSetupError) return <SetupErrorMessage aiSetupError={aiSetupError} collabSetupError={collabSetupError} />
  if (!provider || !geminiKey) return <LoadingSpinner />

  return <EditorProvider provider={provider} ydoc={ydoc} placeholder={placeholder} geminiKey={geminiKey} templateSlug={templateSlug} readOnly={readOnly} isPublic={isPublic} />
}

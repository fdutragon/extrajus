"use client"

import { useContext, useEffect, useMemo } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import type { Doc as YDoc } from "yjs"
import { createPortal } from "react-dom"
import { SupabaseYjsProvider } from "../../../lib/supabase-yjs-provider"
import { Gemini } from "../../../components/tiptap-extension/gemini-ai-extension"
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
        types: ['paragraph', 'heading', 'blockquote', 'legalNode'],
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
  Plus
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
import { ThemeToggle } from "@/components/theme-toggle"
import { useSearchParams } from "next/navigation"
import { CollaborationUsers } from "../../../components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"
import { OnboardingModal } from "../../../components/tiptap-ui/onboarding-modal/onboarding-modal"
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

        {/* Loading Text and IA Status */}
        <div className="flex flex-col items-center gap-2 max-w-xs text-center px-4 relative z-10">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-black text-primary/95">
              Conexão Segura • IA Ativa
            </span>
          </div>

          <h3 className="text-[13px] font-bold text-zinc-100 tracking-wide font-sans animate-pulse">
            {text}
          </h3>

          <p className="text-[9.5px] text-zinc-500 font-mono tracking-wider uppercase italic select-none">
            Iniciando Editor Supremo
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
export function EditorLayout({ isPublic = false }: { isPublic?: boolean } = {}) {
  const [oracleTab, setOracleTab] = useState("insights")
  const [fileName, setFileName] = useState("Documento_ExtraJus")
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
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleSelectTemplate = (prompt: string) => {
    setShowOnboarding(false)
    if (editor) {
      editor.commands.clearContent()
      setTimeout(() => {
        ;(editor.chain() as any).aiTextPrompt({
          text: prompt,
          insert: true,
          stream: true,
          format: "rich-text",
        }).run()
      }, 300)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceGlow(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  const { state, updateState } = useAiMenuState()
  const { editor } = useContext(EditorContext)!

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
  const readOnly = searchParams?.get("mode") === "preview" || searchParams?.get("readOnly") === "true" || !editor || !editor.isEditable
  const docType = searchParams?.get("tipo") || "contrato"

  const [signerEmail, setSignerEmail] = useState("")
  const [sealingCode, setSealingCode] = useState("")
  const [consentCheck, setConsentCheck] = useState(false)
  const [isSealing, setIsSealing] = useState(false)
  const [hasAudited, setHasAudited] = useState(false)

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [aiPromptOpen, setAiPromptOpen] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobileOrTablet = window.innerWidth < 1024
      if (isMobileOrTablet) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }
  }, [])
  const [isSaving, setIsSaving] = useState(false)
  const [fontSize, setFontSize] = useState<number>(13)
  const [fontFamily, setFontFamily] = useState<string>("Cambria")
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)

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
    let foundObject = false
    
    editor.state.doc.descendants((node: any, pos: number) => {
      if (
        (node.type.name === "heading" && (node.attrs.level === 1 || node.attrs.level === 2)) ||
        (node.type.name === "legalNode" && node.attrs.level === 1)
      ) {
        const title = node.textContent.trim().toUpperCase()
        
        // Critério de início: Ignora tudo antes da primeira menção a "OBJETO" ou se for puramente nomes de partes
        if (!foundObject && (title.includes("OBJETO") || title.includes("DO OBJETO"))) {
          foundObject = true
        }

        // Critério de parada: Para de adicionar se chegar no "FORO"
        if (title.includes("FORO") || title.includes("DO FORO")) {
          return false
        }

        // Só adiciona se já tiver passado pelas qualificações (encontrou Objeto)
        if (foundObject) {
          clauses.push({
            id: `clause-${pos}`,
            title: node.textContent.trim(),
            pos
          })
        }
      }
      return true
    })
    return clauses
  }

  const getClauseSubItems = (clausePos: number, nextClausePos?: number) => {
    if (!editor) return []
    const subItems: { id: string; text: string; pos: number }[] = []
    const start = clausePos
    const end = nextClausePos ?? editor.state.doc.content.size

    editor.state.doc.nodesBetween(start, end, (node: any, pos: number) => {
      if (pos === clausePos) return true

      if (node.type.name === "paragraph" || node.type.name === "legalNode") {
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
    const addPrompt = `Reescreva a cláusula selecionada para aprimorar sua segurança jurídica e abrangência técnica, incorporando a seguinte otimização: "${suggestionReason || 'aperfeiçoamento de redação técnica'}".

DIRETRIZES DE REDAÇÃO JURÍDICA:
1. REESCREVA integralmente o conteúdo atual para assegurar coesão, sem criar novas cláusulas adjacentes.
2. Utilize exclusivamente a estrutura de LegalNodes:
   - Epígrafe/Título: <div data-type="legal-node" data-level="1">TÍTULO</div>
   - Caput: <div data-type="legal-node" data-level="2">Texto...</div>
   - Incisos/Parágrafos: <div data-type="legal-node" data-level="3">Texto do item...</div>
3. CONCISÃO OBRIGATÓRIA: Evite parágrafos extensos. Se a matéria exigir detalhamento, fracione-a OBRIGATORIAMENTE em INCISOS (nível 3).
4. É terminantemente PROIBIDO o uso de <p>, ul, ol ou numeração manual (o sistema gerencia a indexação).
5. Empregue linguagem solene, técnica e erudita, priorizando a mitigação de riscos e a máxima preservação dos direitos da parte representada.`

    // Dispara a geração da IA SUBSTITUINDO a seleção atual
    ;(editor.chain() as any).aiTextPrompt({
      text: addPrompt,
      insert: false, // Alterado para false para substituir a cláusula selecionada
      stream: true,
      format: "rich-text",
    }).run()
    
    // Abre o menu da IA para exibir os controles de carregamento e aceite
    setAiPromptOpen(true)
    
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
    if (!room || fileName === "Documento_ExtraJus") return
    setUserContracts((prev) =>
      prev.map((c) => (c.id === room ? { ...c, title: fileName } : c))
    )
  }, [fileName, room])

  useEffect(() => {
    if (!room || readOnly || fileName === "Documento_ExtraJus") return
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

      if (firstH1 && firstH1 !== fileName && firstH1.length > 2) {
        // Limpa possíveis colchetes ou espaços sobressalentes
        const cleanTitle = firstH1
          .replace(/[\[\]]/g, "")
          .trim()
        
        if (cleanTitle) {
          setFileName(cleanTitle)
        }
      }
    }

    editor.on("update", handleUpdate)
    return () => {
      editor.off("update", handleUpdate)
    }
  }, [editor, fileName, readOnly])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .font-heading, :is(aside, header, [role="dialog"], .ai-prompt-wrapper) {
          --font-heading: var(--font-sans) !important;
          font-family: var(--font-sans) !important;
        }
        .tiptap.ProseMirror {
          font-family: ${fontFamily === "Cambria" ? '"Cambria", "Georgia", serif' : fontFamily === "Inter" ? '"Inter", sans-serif' : fontFamily === "Times New Roman" ? '"Times New Roman", serif' : '"JetBrains Mono", monospace'} !important;
          font-size: clamp(${(fontSize - 5) / 16}rem, calc(${(fontSize - 4.5) / 16}rem + 0.35vw), ${(fontSize + 4) / 16}rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[14\\.5px\\] {
          font-size: clamp(0.656rem, calc(0.46875rem + 0.4vw), 1rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-xs, :is(aside, header, .ai-prompt-wrapper) .text-\\[12px\\], :is(aside, header, .ai-prompt-wrapper) .text-\\[13px\\] {
          font-size: clamp(0.625rem, calc(0.5rem + 0.35vw), 0.8125rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[11px\\] {
          font-size: clamp(0.59375rem, calc(0.46875rem + 0.35vw), 0.75rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[10px\\] {
          font-size: clamp(0.53125rem, calc(0.40625rem + 0.3vw), 0.6875rem) !important;
        }
        :is(aside, header, .ai-prompt-wrapper) .text-\\[9\\.5px\\], :is(aside, header, .ai-prompt-wrapper) .text-\\[9px\\] {
          font-size: clamp(0.5rem, calc(0.375rem + 0.3vw), 0.625rem) !important;
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
        .tiptap.ProseMirror p.is-empty.with-slash::before {
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
          font-weight: 700;
          font-style: italic;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
        .tiptap.ProseMirror p.is-empty.with-slash::after {
          content: '';
          display: block;
          margin-top: 24px;
          height: 52px;
          width: 90%;
          background: 
            linear-gradient(90deg, transparent, hsl(var(--primary)/0.25), transparent) no-repeat,
            linear-gradient(to bottom, 
              hsl(var(--muted)/0.35) 0px, hsl(var(--muted)/0.35) 10px, 
              transparent 10px, transparent 20px,
              hsl(var(--muted)/0.25) 20px, hsl(var(--muted)/0.25) 30px, 
              transparent 30px, transparent 40px,
              hsl(var(--muted)/0.15) 40px, hsl(var(--muted)/0.15) 50px
            );
          background-size: 200% 100%, auto;
          background-position: -200% 0, 0 0;
          mask-image: linear-gradient(to right, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent);
          animation: placeholder-bars-shimmer 2.5s infinite linear, skeleton-breath 3.5s ease-in-out infinite;
          pointer-events: none;
          border-radius: 6px;
        }
      ` }} />
      
      <header className="fixed top-0 left-0 w-full h-20 sm:h-[clamp(2.5rem,4vh,3.25rem)] border-b border-border bg-background/60 backdrop-blur-2xl flex items-center justify-between px-3 z-[100] transition-all duration-500 hover:bg-background/80 group">
        <div className="flex items-center gap-1.5 max-sm:gap-1">
          {!readOnly && !isPublic && (
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8 max-sm:h-10 max-sm:w-10 hover:bg-primary/10 hover:text-primary rounded-lg max-sm:rounded-xl transition-all duration-300 group/back flex items-center justify-center">
                  <ChevronLeft size={22} className="group-hover/back:-translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          )}

          {!readOnly && (
            <div className="flex items-center gap-0.5 sm:hidden h-8">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg flex items-center justify-center p-0"
              >
                <Minus size={9} />
              </Button>
              <div className="flex items-center px-1 min-w-[1.4rem] justify-center select-none">
                <span className="text-[10px] font-black text-foreground">{fontSize}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg flex items-center justify-center p-0"
              >
                <Plus size={9} />
              </Button>
            </div>
          )}
          {readOnly && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase">Somente Leitura</Badge>
          )}
          <div className="flex items-center gap-2 max-sm:hidden">
            {!readOnly ? (
              <div className="flex items-center group/title relative">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nome..."
                  style={{ width: `${Math.min(28, Math.max(8, fileName.length + 1))}ch` }}
                  className="bg-transparent border-0 border-b border-transparent hover:border-border/60 focus:border-primary text-[9px] font-black uppercase tracking-widest text-foreground outline-none px-0.5 py-0.5 transition-all max-w-[220px] max-lg:max-w-[120px] max-sm:max-w-[80px] truncate"
                />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none select-none -ml-1">.docx</span>
              </div>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[220px] max-lg:max-w-[120px] max-sm:max-w-[80px]">{fileName}.docx</span>
            )}
            {/* Version, word count and reading time removed for clean workspace layout */}
          </div>
        </div>

        {!readOnly && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 flex items-center h-full gap-2 z-[110] max-lg:hidden">
            <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <span className="h-3 w-[1px] bg-border mx-1" />
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />
            </div>
            <Button
              variant="ghost"
              onClick={() => setAiPromptOpen(prev => !prev)}
              className={cn(
                "relative flex items-center justify-center px-2.5 h-full rounded-none border-x border-primary/10 gap-1.5 overflow-hidden hover:bg-primary/5 transition-all select-none group/ai-toggle",
                aiPromptOpen && "bg-primary/[0.04]"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 group-hover/ai-toggle:from-primary/5 group-hover/ai-toggle:to-primary/10 transition-all" />
              <BrainCircuit 
                size={14} 
                className={cn(
                  "text-primary/60 relative z-10 transition-transform group-hover/ai-toggle:scale-110", 
                  (isAuditing || aiPromptOpen) && "animate-pulse text-primary"
                )} 
              />
              <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors", aiPromptOpen ? "text-primary" : "text-muted-foreground/60 group-hover/ai-toggle:text-primary/80")}>IA</span>
            </Button>
            <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />
              <ColorTextPopover orientation="horizontal" />
            </div>
          </div>
        )}

        {/* Centralized AI Icon only for mobile screen */}
        {!readOnly && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden z-[110]">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setAiPromptOpen(prev => !prev)}
              className={cn(
                "h-8 w-8 text-primary hover:bg-transparent transition-all flex items-center justify-center relative group/ai-mob",
                aiPromptOpen ? "text-primary scale-110" : "text-muted-foreground/60"
              )}
            >
              <BrainCircuit size={16} className={cn("relative z-10", (isAuditing || aiPromptOpen) && "animate-pulse text-primary")} />
            </Button>
          </div>
        )}

        <div className="flex-none flex items-center gap-1.5 max-sm:gap-0.5">
          {!readOnly && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setAiPromptOpen(prev => !prev)}
              className={cn(
                "h-6 w-6 hover:bg-primary/10 hover:text-primary rounded-lg transition-all lg:hidden max-sm:hidden",
                aiPromptOpen && "bg-primary/10 text-primary"
              )}
            >
              <BrainCircuit size={14} className={cn(isAuditing && "animate-pulse")} />
            </Button>
          )}

          {!readOnly && !isPublic && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenPlans}
              className="h-6 gap-1 px-2 rounded-md text-primary hover:bg-primary/10 transition-all font-bold text-[8px] uppercase tracking-widest flex items-center border border-primary/20 bg-primary/5 hover:border-primary/45 shadow-sm shadow-primary/5 group max-sm:hidden"
            >
              <Brain size={12} className="text-primary animate-pulse shrink-0 group-hover:scale-110 transition-transform" />
              <span>{credits !== null ? `${credits} Sinapses` : "..."}</span>
            </Button>
          )}

          {!readOnly && (
            <>
              <ExportButton isPublic={isPublic} docType={docType} title={fileName} content={editor?.getHTML() || ""} />
              {!isPublic && (
                <div className="flex items-center gap-1 pr-1.5 border-r border-border/50 max-sm:hidden">
                  <SignModal title={fileName} />
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-1.5 pl-2 max-sm:pl-0">
            <ThemeToggle />
          </div>
        </div>
      </header>



      <div className={cn("flex-1 flex pt-20 sm:pt-[clamp(2.5rem,4vh,3.25rem)] relative overflow-hidden h-full transition-all duration-700")}>
        {!readOnly && (
          <>
            {leftSidebarOpen && (
              <div 
                onClick={() => setLeftSidebarOpen(false)} 
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden pt-[clamp(2.5rem,4vh,3.25rem)]"
              />
            )}
            <aside className={cn(
              "h-full border-r border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30 max-lg:fixed max-lg:top-[clamp(2.5rem,4vh,3.25rem)] max-lg:bottom-0 max-lg:left-0 max-lg:z-50 max-lg:bg-background/95 max-lg:backdrop-blur-3xl max-lg:border-r max-lg:border-border max-lg:shadow-2xl",
              leftSidebarOpen ? "w-[21vw] min-w-[16rem] max-w-[24.5rem] max-lg:w-[75vw] max-lg:max-w-[20rem]" : "w-0 opacity-0 pointer-events-none overflow-hidden max-lg:hidden"
            )}>
            <div className="px-4 py-6 flex flex-col h-full overflow-hidden w-full">
              <div className="space-y-5 mb-8 shrink-0">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                   <div className="flex items-center gap-2">
                     <Zap size={12} className="text-primary" />
                     <h3 className="text-[11px] font-medium tracking-[0.2em] text-foreground">Tipografia</h3>
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">Fonte</label>
                  <div className="relative group/select">
                    <button 
                      onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                      className="w-full bg-muted/30 border border-border/60 text-foreground text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/20 text-left"
                    >
                      <span className="font-heading font-medium">
                        {fontFamily === "Cambria" && "Cambria (Serifa)"}
                        {fontFamily === "Inter" && "Inter (Sans)"}
                        {fontFamily === "Times New Roman" && "Times (Formal)"}
                        {fontFamily === "JetBrains Mono" && "JetBrains (Mono)"}
                      </span>
                      <ChevronDown size={12} className={cn("text-muted-foreground/60 transition-transform duration-200", isFontDropdownOpen && "rotate-180")} />
                    </button>

                    {isFontDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsFontDropdownOpen(false)} 
                        />
                        <div className="absolute left-0 mt-1.5 w-full bg-card border border-border rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          {[
                            { value: "Cambria", label: "Cambria (Serifa)" },
                            { value: "Inter", label: "Inter (Sans)" },
                            { value: "Times New Roman", label: "Times (Formal)" },
                            { value: "JetBrains Mono", label: "JetBrains (Mono)" }
                          ].map((font) => (
                            <button
                              key={font.value}
                              onClick={() => {
                                setFontFamily(font.value)
                                setIsFontDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full text-left text-[11px] py-2 px-2.5 rounded-lg flex items-center justify-between font-bold transition-all",
                                fontFamily === font.value
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              <span className="font-heading font-medium">{font.label}</span>
                              {fontFamily === font.value && <Check size={12} className="shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="font-heading text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">Tamanho</label>
                    <span className="font-heading text-[10px] font-medium text-primary bg-primary/10 px-2 rounded-full border border-primary/10">{fontSize}px</span>
                  </div>
                  <Slider value={[fontSize]} onValueChange={(val) => setFontSize(Array.isArray(val) ? val[0] : val)} min={12} max={26} step={1} />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6 shrink-0 pt-10 border-t border-border/40">
                <Library size={16} className="text-primary" />
                <h3 className="text-[11px] font-medium tracking-[0.2em] text-foreground">Biblioteca</h3>
              </div>
              <div className="relative mb-6 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={14} />
                <input type="text" placeholder="Filtrar documentos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-muted/30 border border-border/60 rounded-xl pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground/40 font-semibold" />
              </div>
              <ScrollArea className="flex-1 w-full">
                <div className="space-y-6 pb-6">
                  <div className="space-y-3">
                    <p className="font-heading text-[10px] font-medium text-muted-foreground tracking-[0.25em] border-b border-border pb-1">Seus Documentos</p>
                    <div className="space-y-0.5">
                      {isPublic ? (
                        <>
                          <button onClick={() => window.dispatchEvent(new Event("open-plans-modal"))} className="w-full min-w-0 text-left text-xs py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center justify-between font-normal text-foreground/70 transition-all gap-2">
                            <span className="font-heading font-medium truncate flex-1 min-w-0">Contrato de Prestação de Serviços</span>
                            <Zap size={12} className="shrink-0 opacity-0 group-hover:opacity-100 text-primary" />
                          </button>
                          <button onClick={() => window.dispatchEvent(new Event("open-plans-modal"))} className="w-full min-w-0 text-left text-xs py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center justify-between font-normal text-foreground/70 transition-all gap-2">
                            <span className="font-heading font-medium truncate flex-1 min-w-0">Contrato de Locação</span>
                            <Zap size={12} className="shrink-0 opacity-0 group-hover:opacity-100 text-primary" />
                          </button>
                          <button onClick={() => window.dispatchEvent(new Event("open-plans-modal"))} className="w-full min-w-0 text-left text-xs py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center justify-between font-normal text-foreground/70 transition-all gap-2">
                            <span className="font-heading font-medium truncate flex-1 min-w-0">Acordo de Confidencialidade (NDA)</span>
                            <Zap size={12} className="shrink-0 opacity-0 group-hover:opacity-100 text-primary" />
                          </button>
                        </>
                      ) : (
                        filteredContracts.map(c => (
                          <Link key={c.id} href={`/editor?room=${c.id}`} className="w-full min-w-0 text-left text-xs py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center justify-between font-normal text-foreground/70 transition-all gap-2">
                            <span className="font-heading font-medium truncate flex-1 min-w-0">{c.title || "Documento"}</span>
                            <Zap size={12} className={cn("shrink-0 opacity-0 group-hover:opacity-100", c.status === 'signed' ? "text-emerald-500" : "text-primary")} />
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </aside>
        </>)}

        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent p-2 max-sm:p-2 sm:p-[clamp(1rem,2vw,2rem)] relative z-10">
            {/* Subtle occult background glow behind the sheet */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />


            <div className={cn(
              "w-full max-w-full lg:max-w-[clamp(37.5rem,45vw,56.25rem)] mx-auto editor-glow-container transition-all duration-700 shadow-2xl",
              (showEntranceGlow || editorFocused) && "glowing"
            )}>
              <div className="w-full h-full bg-card/90 dark:bg-card/75 backdrop-blur-xl rounded-[30px] px-4 max-sm:px-2.5 py-8 max-sm:py-4 sm:px-[clamp(2rem,4.5vw,4.5rem)] sm:py-[clamp(2.5rem,4.5vw,5.5rem)] relative min-h-[50rem] md:min-h-[74.25rem] editor-glow-content">
                {/* Grain overlay for paper feel */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-[30px]" />

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
            <div className="absolute sm:bottom-12 fixed max-sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[30rem] z-[100] px-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 ai-prompt-wrapper">
               <AiMenu plain={true} />
            </div>
          )}
        </div>

        <>
          {rightSidebarOpen && (
            <div 
              onClick={() => setRightSidebarOpen(false)} 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden pt-[clamp(2.5rem,4vh,3.25rem)]"
            />
          )}
          <aside className={cn(
            "sidebar-right h-full border-l border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30 max-lg:fixed max-lg:top-[clamp(2.5rem,4vh,3.25rem)] max-lg:bottom-0 max-lg:right-0 max-lg:z-50 max-lg:bg-background/95 max-lg:backdrop-blur-3xl max-lg:border-l max-lg:border-border max-lg:shadow-2xl",
            rightSidebarOpen ? "w-[22vw] min-w-[17rem] max-w-[26rem] max-lg:w-[75vw] max-lg:max-w-[20rem]" : "w-0 opacity-0 pointer-events-none overflow-hidden max-lg:hidden"
          )}>
          {readOnly ? (
            <div className="p-6 flex flex-col h-full justify-between">
              {contractStatus === 'signed' ? (
                <div className="space-y-6 flex flex-col h-full justify-center items-center text-center">
                  <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 animate-pulse mb-2">
                    <ShieldCheck size={48} className="text-emerald-400" />
                  </div>
                  <h3 className="font-heading font-medium text-xs uppercase tracking-[0.2em] text-emerald-400">Contrato Selado</h3>
                  <div className="space-y-4 max-w-xs">
                    <p className="font-heading font-medium text-[10px] leading-relaxed text-muted-foreground">
                      Este instrumento jurídico foi totalmente assinado e selado digitalmente.
                    </p>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="font-heading font-medium text-[8px] text-emerald-400 uppercase tracking-widest block mb-1">Status da Assinatura</span>
                      <span className="font-heading font-medium text-[11px] text-white">IMUTÁVEL & REGISTRADO</span>
                    </div>
                    <p className="font-heading font-medium text-[10px] text-muted-foreground/60 italic leading-normal">
                      Qualquer tentativa de edição foi bloqueada para preservar a integridade jurídica das assinaturas.
                    </p>
                  </div>
                  <div className="h-10" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={24} className="text-primary animate-pulse" />
                    <h3 className="font-heading font-medium text-[11px] uppercase tracking-[0.2em]">Assinatura Digital</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="font-heading font-medium text-[10px] leading-relaxed text-muted-foreground">Revise o documento e preencha as credenciais para assinar.</p>
                    <div className="space-y-3">
                      <label className="font-heading font-medium text-[9px] text-muted-foreground uppercase">E-mail</label>
                      <input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="Seu e-mail..." className="font-heading font-medium w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-[11px] font-semibold" />
                    </div>
                    <div className="space-y-3">
                      <label className="font-heading font-medium text-[9px] text-muted-foreground uppercase">Código (6 dígitos)</label>
                      <input type="text" maxLength={6} value={sealingCode} onChange={(e) => setSealingCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="font-heading font-medium w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-center text-lg font-bold tracking-[0.5em]" />
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                      <input type="checkbox" id="consent" checked={consentCheck} onChange={(e) => setConsentCheck(e.target.checked)} className="mt-0.5 rounded text-primary focus:ring-0" />
                      <label htmlFor="consent" className="font-heading font-medium text-[10px] text-muted-foreground leading-normal cursor-pointer">Declaro que li e concordo com os termos.</label>
                    </div>
                  </div>
                </div>
              )}
              {contractStatus !== 'signed' && (
                <Button onClick={handleConfirmSignature} disabled={isSealing || !consentCheck} className="font-heading font-medium w-full bg-primary py-5 rounded-2xl font-bold text-[11px] uppercase">Assinar Instrumento</Button>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 flex flex-col h-full overflow-hidden min-h-0 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={12} className={cn("text-primary", isAuditing && "animate-pulse")} />
                  <h3 className="font-heading font-medium text-[11px] tracking-[0.2em] text-foreground">Sugestões de Cláusulas</h3>
                </div>
              </div>
              {/* Seção 1: Score ou Iniciar Auditoria (Fixado no topo) */}
              <div className="shrink-0">
                {!hasAudited ? (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    <p className="font-heading font-medium text-xs text-muted-foreground leading-relaxed">
                      Rode a análise inteligente para escanear o documento e sugerir cláusulas protetoras complementares sob demanda.
                    </p>
                    <Button 
                      onClick={runAudit} 
                      disabled={isAuditing} 
                      className="font-heading font-medium w-full bg-transparent border border-primary/50 text-primary hover:bg-primary hover:border-primary hover:text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] h-8 rounded-xl transition-all shadow-[0_0_10px_rgba(var(--primary),0.05)] hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                    >
                      Analisar Cláusulas
                    </Button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-muted/30 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-medium text-[11px] text-muted-foreground uppercase tracking-wider">Proteção Estimada</span>
                      <span className={cn("font-heading font-medium text-[9.5px] uppercase px-2 py-0.5 rounded-full", auditStatus.color)}>{auditStatus.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-medium text-2xl">{auditScore}</span>
                      <span className="font-heading font-medium text-[11px] text-primary">%</span>
                    </div>
                    <p className="font-heading font-medium text-xs text-muted-foreground leading-relaxed italic">{auditStatus.desc}</p>
                  </div>
                )}
              </div>

              {/* Seção 2: Árvore Interativa de Cláusulas (Mapa do Instrumento) */}
              <div className="flex flex-col flex-1 min-h-0 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2 shrink-0">
                  <span className="font-heading font-medium text-xs text-muted-foreground tracking-widest">Estrutura do Contrato</span>
                </div>
                
                <ScrollArea className="flex-1 pr-3 scrollbar-minimalist min-h-0">
                  {getClauses().length === 0 ? (
                    <div className="text-center py-6">
                      <span className="text-xs text-muted-foreground font-semibold">Nenhuma cláusula identificada ainda.</span>
                    </div>
                  ) : (
                    <div className="relative pl-[30px] pr-3 py-1 space-y-3.5 before:absolute before:left-[12.25px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/60">
                      {getClauses().map((clause, idx, array) => {
                        const nextClause = array[idx + 1]
                        const clauseRisks = getClauseRisks(clause.pos, nextClause?.pos)
                        const hasUnoptimizedRisk = clauseRisks.some(risk => !optimizedRisks.includes(risk.id))
                        const hasRisk = clauseRisks.length > 0 && hasUnoptimizedRisk
                        const subItems = getClauseSubItems(clause.pos, nextClause?.pos)
                        const visibleSubItems = subItems.slice(0, 4)
                        const hasMore = subItems.length > 4
 
                        return (
                          <div key={clause.id} className="relative group/clause">
                            {/* Indicador de Status na Árvore */}
                            <div className={cn(
                              "absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300 z-10",
                              !hasAudited 
                                ? "border-muted-foreground/30" 
                                : hasRisk 
                                  ? "border-amber-500 bg-amber-950/20" 
                                  : "border-emerald-500 bg-emerald-950/20"
                            )}>
                              {hasAudited && (
                                hasRisk 
                                  ? <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  : <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              )}
                            </div>
 
                            <div className="space-y-2">
                              <button
                                onClick={() => editor.chain().focus().setTextSelection(clause.pos).run()}
                                className="flex items-center justify-between w-full text-left group-hover/clause:text-primary transition-all"
                              >
                                <span className="font-heading font-medium text-xs uppercase tracking-wider truncate max-w-[220px] text-foreground/80 group-hover/clause:text-primary">
                                  {clause.title}
                                </span>
                                {hasAudited && (
                                  hasRisk 
                                    ? <Badge variant="outline" className="font-heading font-medium text-[10px] h-4 px-1.5 uppercase bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">Sugestão</Badge>
                                    : <Badge variant="outline" className="font-heading font-medium text-[10px] h-4 px-1.5 uppercase bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">OK</Badge>
                                )}
                              </button>
 
                              {/* Sub-itens (Parágrafos da Cláusula) */}
                              {visibleSubItems.length > 0 && (
                                <div className="pl-2.5 space-y-1 py-0.5 border-l border-border/20 ml-1">
                                  {visibleSubItems.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => editor.chain().focus().setTextSelection(sub.pos).run()}
                                      className="flex items-center gap-1.5 text-left text-[11px] text-muted-foreground/60 hover:text-primary transition-all w-full min-w-0 group/sub"
                                    >
                                      <div className="h-0.5 w-1 bg-muted-foreground/20 group-hover/sub:bg-primary shrink-0 transition-colors" />
                                      <span className="font-heading font-medium truncate flex-1 min-w-0 italic">
                                        {sub.text}
                                      </span>
                                    </button>
                                  ))}
                                  {hasMore && (
                                    <span className="font-heading font-medium text-xs text-muted-foreground/40 pl-2.5 tracking-widest block leading-none">...</span>
                                  )}
                                </div>
                              )}

                              {/* Se de fato houver risco correspondente a esta cláusula, renderiza abaixo dela de forma integrada */}
                              {hasAudited && hasRisk && (
                                <div className="pl-3 space-y-2.5 border-l border-amber-500/40 mt-1.5">
                                  {clauseRisks.map((risk) => {
                                    const isOptimized = optimizedRisks.includes(risk.id)
                                    const isPending = pendingOptimization === risk.id
                                    
                                    if (isOptimized) {
                                      return (
                                        <div key={risk.id} className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-500/20 space-y-2">
                                          <span className="font-heading font-medium text-[11px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                                            <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-500" />
                                            Cláusula Adicionada
                                          </span>
                                          <Button 
                                            size="sm" 
                                            disabled
                                            className="font-heading font-medium w-full text-[10.5px] font-bold uppercase tracking-widest h-7 rounded-lg transition-all bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-500/30 opacity-70"
                                          >
                                            Cláusula Inserida
                                          </Button>
                                        </div>
                                      )
                                    }
                                    
                                    return (
                                      <div key={risk.id} className="p-3.5 rounded-xl border bg-amber-500/5 dark:bg-amber-500/5 border-amber-500/20 space-y-2 shadow-md shadow-amber-950/5">
                                        {risk.tipo && (
                                          <span className="font-heading font-medium text-[9px] text-amber-600/70 dark:text-amber-400/60 uppercase tracking-widest block mb-0.5">
                                            {risk.tipo}
                                          </span>
                                        )}
                                        <p className="font-heading font-medium text-[11px] leading-relaxed text-foreground/85 text-left">
                                          {renderBoldText(risk.reason)}
                                        </p>
                                        <Button 
                                          size="sm" 
                                          disabled={!!pendingOptimization}
                                          onClick={() => handleOptimizeClause(clause.pos, nextClause?.pos, risk.id, risk.reason)}
                                          className={cn(
                                            "font-heading font-medium w-full text-[10.5px] font-bold uppercase tracking-widest h-8 rounded-xl transition-all",
                                            isPending
                                              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-400"
                                              : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400",
                                            !!pendingOptimization && !isPending && "opacity-50 cursor-not-allowed grayscale"
                                          )}
                                        >
                                          {isPending ? "Adicionando..." : "Adicionar Cláusula"}
                                        </Button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </aside>
      </>
        
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onSelectTemplate={handleSelectTemplate} />
      </div>
    </div>
  )
}

export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = "Comece a redigir...", geminiKey, templateSlug, readOnly, isPublic } = props
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
      StarterKit.configure({ horizontalRule: false, dropcursor: { width: 2 } }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph", "legalNode"] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({ provider, user: { id: user.id, name: user.name, color: user.color } }),
      Placeholder.configure({ placeholder, emptyNodeClass: "is-empty with-slash" }),
      TableKit.configure({ table: { resizable: true, cellMinWidth: 120 } }),
      NodeBackground.configure({ types: ["paragraph", "heading", "blockquote", "tableCell", "tableHeader", "tocNode", "legalNode"] }),
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
      TableHandleExtension, ListNormalizationExtension, LegalNode, VariableNode,
      ImageUploadNode.configure({ accept: "image/*", maxSize: MAX_FILE_SIZE, limit: 3, upload: handleImageUpload, onError: (error) => console.error("Upload failed:", error) }),
      UniqueID.configure({ types: ["table", "paragraph", "bulletList", "orderedList", "heading", "blockquote", "codeBlock", "tocNode", "legalNode"], filterTransaction: (transaction) => !isChangeOrigin(transaction) }),
      Typography, UiState, TocNode.configure({ topOffset: 48 }), Gemini.configure({ apiKey: geminiKey || "" }), BubbleMenuExtension, AiHighlightManager,
    ],
  })

  useEffect(() => { if (editor) editor.setEditable(!readOnly) }, [editor, readOnly])

  useEffect(() => {
    if (!editor || !templateSlug) return
    const checkAndFill = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
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
      await new Promise(resolve => setTimeout(resolve, 800)) // Wait for Yjs provider to sync/initialize
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
      <EditorLayout isPublic={isPublic} />
    </EditorContext.Provider>
  )
}

export function NotionEditor({ room, placeholder = "Comece a redigir...", templateSlug, readOnly, isPublic }: NotionEditorProps) {
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

export function NotionEditorContent({ placeholder, templateSlug, readOnly: propReadOnly, isPublic }: { placeholder?: string, templateSlug?: string | null, readOnly?: boolean, isPublic?: boolean }) {
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

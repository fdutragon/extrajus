"use client"

import { useContext, useEffect, useMemo, useState } from "react"
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
  X,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { ThemeToggle } from "./notion-like-editor-theme-toggle"
import { useSearchParams } from "next/navigation"
import { SignModal } from "../../../components/tiptap-ui/sign-modal/sign-modal"
import { cn } from "@/lib/utils"
import { MarkButton } from "../../../components/tiptap-ui/mark-button"
import { TextAlignButton } from "../../../components/tiptap-ui/text-align-button"
import { ColorTextPopover } from "../../../components/tiptap-ui/color-text-popover"
import { UndoRedoButton } from "../../../components/tiptap-ui/undo-redo-button"
import {
  AiMenu,
  AiMenuStateProvider,
} from "../../../components/tiptap-ui/ai-menu/ai-menu"
import { useAiMenuState } from "../../../components/tiptap-ui/ai-menu/ai-menu-hooks"
import { SetupErrorMessage } from "./setup-error-message"
import { ExportButton } from "../../../components/tiptap-ui/export-button/export-button"
import { BubbleMenu } from "../../../components/tiptap-ui/bubble-menu/bubble-menu"
import {
  TocProvider,
  useToc,
} from "../../../components/tiptap-node/toc-node/context/toc-context"
import { ListNormalizationExtension } from "../../../components/tiptap-extension/list-normalization-extension"
import { Indent } from "../../../components/tiptap-extension/indent-extension"

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
    <div className="fixed inset-0 z-[1000] bg-zinc-950 overflow-hidden select-none">
      {/* Background Dark Occult Luxury Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,176,59,0.06),transparent_65%)] animate-pulse duration-[4000ms]" />
      
      {/* Subtle background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Absolute Centering to prevent dynamic layout shift / PWA chrome jumps */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-1000 w-full max-w-xs">
        
        {/* Glowing Logo Container with Ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Outer Glow */}
          <div className="absolute w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse duration-[2000ms]" />
          
          {/* Animated Spinner Ring */}
          <div className="absolute w-18 h-18 rounded-full border-2 border-primary/10 border-t-primary/70 animate-spin duration-[1500ms]" />
          
          {/* Logo with premium style */}
          <div className="relative p-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            <Logo iconSize={32} showText={false} className="flex-col text-center" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2 max-w-xs text-center px-4 relative z-10">
          <span className="font-sans font-black tracking-[0.25em] text-zinc-100 uppercase text-xs select-none">
            Smart<span className="text-primary drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">Doc</span>
          </span>
          <p className="text-[8px] text-zinc-500 font-mono tracking-[0.3em] uppercase italic animate-pulse select-none mt-0.5">
            {text}
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
    </EditorContent>
  )
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorLayout({ isPublic = false, readOnly: propReadOnly, templateSlug }: { isPublic?: boolean; readOnly?: boolean; templateSlug?: string | null } = {}) {
  const [fileName, setFileName] = useState("MINUTA-DE-CONTRATO")
  const [credits, setCredits] = useState<number | null>(null)
  const [contractStatus, setContractStatus] = useState<string | null>(null)
  const [showEntranceGlow, setShowEntranceGlow] = useState(true)
  const [editorFocused, setEditorFocused] = useState(false)
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

  // Mapeamento inicial de Template Slug ou Keyword do Google Ads para Tipo de Contrato
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const keyword = urlParams.get("keyword") || urlParams.get("kw");
      
      if (keyword && !state.selectedContractType) {
        // Formata a palavra-chave (ex: "contrato de aluguel" -> "Contrato De Aluguel")
        const formattedKeyword = keyword
          .split(/[\s+_\-]+/)
          .filter(Boolean)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        if (formattedKeyword) {
          updateState({ selectedContractType: formattedKeyword });
        }
      } else if (templateSlug && !state.selectedContractType) {
        const formattedName = templateSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        updateState({ selectedContractType: formattedName });
      }
    }
  }, [templateSlug, state.selectedContractType, updateState])

  // Fix simplificado para mobile: Garante que o layout se ajuste ao viewport dinâmico sem "trancos"
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return

    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    handleResize()

    return () => window.visualViewport?.removeEventListener('resize', handleResize)
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

  const handleDiscard = () => {
    if (confirm("Tem certeza que deseja descartar este contrato e começar do zero?")) {
      localStorage.removeItem("smartdoc_last_room")
      document.cookie = "smartdoc_last_room=; path=/; max-age=0;"
      window.location.href = "/editor"
    }
  }

  const { room } = useCollab()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true

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

    fetchProfileData()

    const handleProfileUpdated = () => {
      fetchProfileData()
    }
    window.addEventListener('profile-updated', handleProfileUpdated)

    return () => {
      active = false
      window.removeEventListener('profile-updated', handleProfileUpdated)
    }
  }, [supabase])

  const handleOpenPlans = () => {
    window.dispatchEvent(new Event("open-plans-modal"))
  }

  const searchParams = useSearchParams()
  const readOnly = propReadOnly || searchParams?.get("mode") === "preview" || searchParams?.get("readOnly") === "true" || !editor
  const docType = searchParams?.get("tipo") || "contrato"

  const aiPromptOpen = true // Sempre visível
  const [fontSize, setFontSize] = useState<number>(14)
  const [fontFamily, setFontFamily] = useState<string>("Cambria")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobileOrTablet = window.innerWidth < 1024
      if (isMobileOrTablet) {
        setFontSize(15)
      } else {
        setFontSize(14)
      }
    }
  }, [])

  useEffect(() => {
    if (!room || readOnly || fileName === "MINUTA-DE-CONTRATO") return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room)
    if (!isUuid) return

    const delayDebounceFn = setTimeout(async () => {
      await supabase.from('contracts').update({ title: fileName }).eq('id', room)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [fileName, room, readOnly, supabase])

  // Sincroniza dinamicamente o título do documento (fileName) com o primeiro <h1> inserido no editor
  useEffect(() => {
    if (!editor || readOnly) return

    let timeoutId: NodeJS.Timeout

    const handleUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        let firstH1 = ""
        editor.state.doc.descendants((node: any) => {
          if (node.type.name === "heading" && node.attrs.level === 1) {
            firstH1 = node.textContent.trim()
            return false
          }
          return true
        })

        if (firstH1 && firstH1.length > 2) {
          const cleanTitle = firstH1.replace(/[\[\]]/g, "").trim()
          if (cleanTitle && cleanTitle !== fileName) {
            setFileName(cleanTitle)
            if (state.selectedContractType !== cleanTitle) {
              updateState({ selectedContractType: cleanTitle })
            }
          }
        }
      }, 800) // Debounce agressivo para proteger a CPU
    }

    editor.on("update", handleUpdate)
    return () => {
      clearTimeout(timeoutId)
      editor.off("update", handleUpdate)
    }
  }, [editor, fileName, readOnly, state.selectedContractType, updateState])

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
          animation: pulse-shadow 4.5s ease-in-out infinite;
        }
        @media screen and (max-width: 768px) {
          div.editor-glow-container {
            padding: 0 !important;
            border-radius: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            animation: none !important;
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
          display: block;
          text-align: center;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
      ` }} />
      
      <header 
        className="sticky top-0 w-full h-16 sm:h-[clamp(2.5rem,4vh,3.25rem)] border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-3 z-[1000] shrink-0 app-region-drag"
        style={{ paddingLeft: 'calc(env(titlebar-area-x, 0px) + 0.75rem)', paddingRight: 'calc(env(titlebar-area-width, 0px) + 0.75rem)' }}
      >
        <div className="flex items-center gap-1.5 max-sm:gap-2 app-region-no-drag">
          {!readOnly && !isPublic && (
            <div className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300 group/back flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          )}

          <div className="sm:hidden flex items-center">
            <ThemeToggle />
          </div>

          {!readOnly && (
            <div className="flex items-center gap-0.5 md:gap-0 max-sm:gap-0 h-9">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                className="h-9 w-9 max-sm:h-7 max-sm:w-7 text-muted-foreground hover:text-foreground rounded-full transition-all flex items-center justify-center p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-1 md:px-0.5 max-sm:px-0.5 justify-center select-none min-w-[24px] md:min-w-[18px] max-sm:min-w-[16px]">
                <span className="text-[12px] font-black text-foreground/80">{fontSize}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="h-9 w-9 max-sm:h-7 max-sm:w-7 text-muted-foreground hover:text-foreground rounded-full transition-all flex items-center justify-center p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
          {readOnly && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase">Somente Leitura</Badge>
          )}
        </div>

        {/* Persistent Centralized Branding (Restaurada e livre de colisão de ID SVG) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-[110]">
          <div className="max-sm:hidden">
            <Logo showText={true} iconSize={34} variant="chrome" />
          </div>
          <div className="sm:hidden">
            <Logo showText={true} iconSize={26} variant="chrome" />
          </div>
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

        <div className="flex-none flex items-center gap-1.5 max-sm:gap-1 app-region-no-drag">
          {!readOnly && !isPublic && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenPlans}
              className="h-6 gap-1 px-2 rounded-md text-primary hover:bg-primary/10 transition-all font-bold text-[8px] uppercase tracking-widest flex items-center border border-primary/20 bg-primary/5 group max-sm:hidden"
            >
              <Brain className="w-3 h-3 text-primary animate-pulse shrink-0 group-hover:scale-110 transition-transform" />
              <span>{credits !== null ? `${credits} Sinapses` : "..."}</span>
            </Button>
          )}

          {!readOnly && editor && !editor.isEmpty && !aiGenerationIsLoading && (
            <>
              <div>
                <ExportButton isPublic={isPublic} docType={docType} title={fileName} />
              </div>
              {!isPublic && (
                <div className="flex items-center gap-1 pr-1.5 border-r border-border/50 max-sm:hidden">
                  <SignModal title={fileName} />
                </div>
              )}
            </>
          )}
          <div className="max-sm:hidden flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden min-h-0">
        <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent max-sm:p-0 sm:p-4 sm:pb-32 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6000ms] max-sm:hidden" />

            <div className={cn(
              "w-full max-w-full lg:max-w-[clamp(37.5rem,45vw,56.25rem)] mx-auto editor-glow-container max-sm:!p-0 max-sm:!rounded-none transition-all duration-700 shadow-2xl max-sm:shadow-none",
              (showEntranceGlow || editorFocused) && "glowing"
            )}>
              <div className="w-full h-full sm:bg-card/90 sm:dark:bg-card/75 sm:backdrop-blur-xl sm:rounded-[30px] max-sm:rounded-none px-4 max-sm:px-0 py-8 max-sm:pt-16 max-sm:pb-48 sm:px-14 sm:pt-16 sm:pb-12 relative min-h-[50rem] md:min-h-[74.25rem] editor-glow-content max-sm:bg-transparent max-sm:backdrop-blur-none max-sm:shadow-none">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]  mix-blend-overlay rounded-[30px] max-sm:hidden" />

                {!readOnly && editor && !editor.isEmpty && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDiscard}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 h-8 w-8 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full z-50 flex items-center justify-center bg-background/30 backdrop-blur-md border border-red-500/10 hover:border-red-500/30 shadow-sm"
                    title="Descartar Contrato"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}

                <div className="relative z-10">
                  {!readOnly && (
                    <div className="max-sm:hidden">
                      {/* <BubbleMenu editor={editor} /> */}
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
  const { provider, ydoc, placeholder = "Pressione '/' para adicionar cláusulas...", geminiKey, templateSlug, readOnly, isPublic } = props
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
    editorProps: { 
      attributes: { 
        class: "notion-like-editor",
        style: "-webkit-touch-callout: none;"
      }, 
      scrollThreshold: { top: 80, bottom: 160, left: 0, right: 0 }, 
      scrollMargin: { top: 80, bottom: 160, left: 0, right: 0 },
      handleDOMEvents: {
        copy: (view, event) => {
          event.preventDefault()
          return true
        },
        cut: (view, event) => {
          event.preventDefault()
          return true
        },
        paste: (view, event) => {
          // Allow paste normally on desktop, keep it blocked on mobile if it was
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            // event.preventDefault() 
            // return true
          }
          return false
        },
        contextmenu: (view, event) => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            event.preventDefault()
            return true
          }
          return false
        }
      }
    },
    extensions: [
      StarterKit.configure({ undoRedo: false, horizontalRule: false, dropcursor: { width: 2 } }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph", "legalNode", "notificationNode"] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({ provider, user: { id: user.id, name: user.name, color: user.color } }),
      Placeholder.configure({ placeholder, emptyNodeClass: "is-empty with-slash", showOnlyWhenEditable: false }),
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

  useEffect(() => {
    if (!editor || !room) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room)
    if (!isUuid) return

    const loadPurchasedContent = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (editor.isEmpty) {
        const client = createClient()
        const { data: logs } = await client.from('yjs_updates').select('id').eq('contract_id', room).limit(1)
        if (!logs || logs.length === 0) {
          const { data: docData } = await client.from("documents").select("content").eq("id", room).single()
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

export function NotionEditor({ room, placeholder = "Pressione '/' para adicionar cláusulas...", templateSlug, readOnly, isPublic }: NotionEditorProps) {
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

export function NotionEditorContent({ placeholder = "Pressione '/' para adicionar cláusulas...", templateSlug, readOnly: propReadOnly, isPublic }: { placeholder?: string, templateSlug?: string | null, readOnly?: boolean, isPublic?: boolean }) {
  const { provider, ydoc, setupError: collabSetupError, room } = useCollab()
  const { geminiKey, setupError: aiSetupError } = useAi()
  const [contractStatus, setContractStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!room) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(room)
    if (!isUuid) return
    
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

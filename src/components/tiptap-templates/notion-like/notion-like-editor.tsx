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
  Eye
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
import { cn } from "@/lib/utils"
import { TurnIntoDropdown } from "../../../components/tiptap-ui/turn-into-dropdown"
import { MarkButton } from "../../../components/tiptap-ui/mark-button"
import { ResetAllFormattingButton } from "../../../components/tiptap-ui/reset-all-formatting-button"
import { ListButton } from "../../../components/tiptap-ui/list-button"
import { TextAlignButton } from "../../../components/tiptap-ui/text-align-button"
import { LinkPopover } from "../../../components/tiptap-ui/link-popover"
import { ColorTextPopover } from "../../../components/tiptap-ui/color-text-popover"
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
}

export interface EditorProviderProps {
  provider: SupabaseYjsProvider
  ydoc: YDoc
  placeholder?: string
  geminiKey: string | null
  templateSlug?: string | null
  readOnly?: boolean
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Estabelecendo Conexão..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)] animate-pulse duration-[4000ms]" />
      
      <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
        {/* Logo area */}
        <div className="relative group">
          <div className="absolute -inset-10 bg-primary/10 blur-[60px] rounded-full animate-pulse transition-all duration-700" />
          <div className="relative flex flex-col items-center">
            <Logo iconSize={64} className="flex-col text-center gap-4" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            {text}
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1 h-1 rounded-full bg-primary/40 animate-bounce" 
                style={{ animationDelay: `${i * 150}ms`, animationDuration: '1000ms' }}
              />
            ))}
          </div>
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
      {createPortal(<MobileToolbar />, document.body)}
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
export function EditorLayout() {
  const [oracleTab, setOracleTab] = useState("insights")
  const [fileName, setFileName] = useState("Documento_ExtraJus")
  const [userContracts, setUserContracts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [auditResults, setAuditResults] = useState<any[]>([])
  const [isAuditing, setIsAuditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFocused, setIsFocused] = useState(true)
  const { user } = useUser()

  const { state, updateState } = useAiMenuState()
  const { editor } = useContext(EditorContext)!
  const { provider, room } = useCollab()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Prevent copy, cut, paste events completely
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      toast.error("Cópia restrita por diretiva de segurança.")
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      toast.error("Remoção restrita por diretiva de segurança.")
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
        toast.error("Cópia bloqueada.")
      }

      if (isCtrlOrCmd && e.key?.toLowerCase() === "v") {
        e.preventDefault()
        toast.error("Colagem bloqueada.")
      }

      if (isCtrlOrCmd && e.key?.toLowerCase() === "x") {
        e.preventDefault()
        toast.error("Corte bloqueado.")
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
      toast.error("Movimentação de texto desativada.")
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      toast.error("Menu de contexto restrito por confidencialidade.")
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
  const readOnly = searchParams?.get("mode") === "preview" || searchParams?.get("readOnly") === "true"

  const [signerEmail, setSignerEmail] = useState("")
  const [sealingCode, setSealingCode] = useState("")
  const [consentCheck, setConsentCheck] = useState(false)
  const [isSealing, setIsSealing] = useState(false)
  const [hasAudited, setHasAudited] = useState(false)

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fontSize, setFontSize] = useState<number>(18)
  const [fontFamily, setFontFamily] = useState<string>("Lora")
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
    if (!hasAudited) return 0;
    return Math.max(0, 100 - (auditResults.length * 15));
  }, [hasAudited, auditResults]);

  const auditStatus = useMemo(() => {
    if (!hasAudited) return { label: "Inativa", color: "text-muted-foreground bg-muted border-border", barColor: "bg-muted", desc: "Sistema IA inativo. Inicie a auditoria para avaliar o documento." };
    if (auditScore >= 90) return { label: "Excelente ✨", color: "text-[#c0ff00] bg-[#c0ff00]/10 border-[#c0ff00]/20", barColor: "bg-[#c0ff00]", desc: "Este documento atingiu um nível de segurança elevado. As cláusulas estão tecnicamente precisas e em conformidade." };
    if (auditScore >= 70) return { label: "Seguro 👍", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", barColor: "bg-emerald-500", desc: "O contrato possui boa estrutura de segurança. Alguns pontos de atenção foram identificados, mas a saúde técnica é satisfatória." };
    if (auditScore >= 50) return { label: "Vulnerável ⚠️", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", barColor: "bg-amber-500", desc: "Presença de ambiguidades e riscos moderados. Sugerimos aplicar os ajustes recomendados pela Inteligência Analítica." };
    return { label: "Risco Crítico 🔥", color: "text-red-400 bg-red-500/10 border-red-500/20", barColor: "bg-red-500", desc: "Inconsistências críticas detectadas! O documento apresenta riscos jurídicos que demandam revisão imediata." };
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
    setIsAuditing(true)
    const toastId = toast.loading("Analisando conformidade e riscos...")
    
    try {
      await (editor.commands as any).aiAuditRisk()
      setTimeout(() => {
        const results = (editor.storage as any).ai.auditResults
        setAuditResults(results || [])
        setHasAudited(true)
        setIsAuditing(false)
        toast.success("Análise de conformidade concluída.", { id: toastId })
      }, 3000)
    } catch (error) {
      console.error(error)
      toast.error("O sistema falhou ao processar a auditoria.", { id: toastId })
      setIsAuditing(false)
    }
  }

  const handleConfirmSignature = async () => {
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
      const { data: currentContract } = await supabase.from('contracts').select('title').eq('id', room).single()
      if (currentContract?.title) setFileName(currentContract.title)

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
  }, [room, supabase])

  useEffect(() => {
    if (!room || readOnly || fileName === "Documento_ExtraJus") return
    const delayDebounceFn = setTimeout(async () => {
      await supabase.from('contracts').update({ title: fileName }).eq('id', room)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [fileName, room, readOnly, supabase])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap.ProseMirror {
          font-family: ${fontFamily === "Lora" ? '"Lora", serif' : fontFamily === "Inter" ? '"Inter", sans-serif' : fontFamily === "Times New Roman" ? '"Times New Roman", serif' : '"JetBrains Mono", monospace'} !important;
          font-size: ${fontSize}px !important;
        }
      ` }} />
      
      <header className="fixed top-0 left-0 w-full h-12 border-b border-border bg-background/60 backdrop-blur-2xl flex items-center justify-between px-6 z-[100] transition-all duration-500 hover:bg-background/80 group">
        <div className="flex items-center gap-4">
          {!readOnly ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 group/back">
                  <ChevronLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[9px] font-black uppercase">Somente Leitura</Badge>
          )}
          <div className="flex items-center gap-3">
            {!readOnly ? (
              <div className="flex items-center gap-1 group/title relative">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nome do contrato..."
                  className="bg-transparent border-0 border-b border-transparent hover:border-border/60 focus:border-primary text-[10px] font-black uppercase tracking-widest text-foreground outline-none px-1 py-0.5 transition-all w-[150px] focus:w-[260px] truncate"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pointer-events-none select-none">.docx</span>
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[160px]">{fileName}.docx</span>
            )}
            {/* Version, word count and reading time removed for clean workspace layout */}
          </div>
        </div>

        {!readOnly && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 z-[110]">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <MarkButton type="strike" />
              <ResetAllFormattingButton />
            </div>
            <div className="relative flex items-center justify-center px-3 h-12 rounded-none cursor-default border-x border-primary/10 gap-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <BrainCircuit size={14} className="text-primary/60 relative z-10 animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em] relative z-10 text-primary/80">IA</span>
            </div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <ListButton type="bulletList" />
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />
              <div className="h-4 w-px bg-border mx-1" />
              <LinkPopover autoOpenOnLinkActive={false} orientation="horizontal" />
              <ColorTextPopover orientation="horizontal" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pr-4 border-r border-border/50">
            {!readOnly && <InviteButton room={room || ""} />}
            <CollaborationUsers />
            <ThemeToggle />
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2 pl-2">
              <Button variant="outline" size="sm" onClick={handleManualSave} disabled={isSaving} className="h-8 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider rounded-lg px-3 transition-all">
                <Save className={cn("w-3.5 h-3.5", isSaving && "animate-spin")} /> {isSaving ? "Gravando..." : "Salvar"}
              </Button>
              <ExportButton />
              <SignModal title={fileName} />
            </div>
          )}
        </div>
      </header>

      {!isFocused && (
        <div className="absolute inset-0 top-12 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[5px] z-[99999] select-none pointer-events-none">
          <div className="text-center p-8 bg-background/90 border border-primary/20 rounded-3xl max-w-md shadow-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-2">Proteção Confidencial</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">Conteúdo ocultado automaticamente por diretiva de segurança.</p>
          </div>
        </div>
      )}

      <div className={cn("flex-1 flex pt-12 relative overflow-hidden h-full transition-all duration-700", !isFocused && "filter blur-[45px] select-none pointer-events-none")}>
        {!readOnly && (
          <aside className={cn("h-full border-r border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30", leftSidebarOpen ? "w-80" : "w-0 opacity-0 pointer-events-none overflow-hidden")}>
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <div className="space-y-5 mb-8 shrink-0">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                   <div className="flex items-center gap-2">
                     <Zap size={10} className="text-primary" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Tipografia</span>
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Fonte</label>
                  <div className="relative group/select">
                    <button 
                      onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                      className="w-full bg-muted/30 border border-border/60 text-foreground text-[10px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/20 text-left"
                    >
                      <span>
                        {fontFamily === "Lora" && "Lora (Serifa)"}
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
                            { value: "Lora", label: "Lora (Serifa)" },
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
                                "w-full text-left text-[10px] py-2 px-2.5 rounded-lg flex items-center justify-between font-bold transition-all",
                                fontFamily === font.value
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              <span>{font.label}</span>
                              {fontFamily === font.value && <Check size={10} className="shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Tamanho</label>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 rounded-full border border-primary/10">{fontSize}px</span>
                  </div>
                  <Slider value={[fontSize]} onValueChange={(val) => setFontSize(Array.isArray(val) ? val[0] : val)} min={12} max={26} step={1} />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6 shrink-0 pt-10 border-t border-border/40">
                <Library size={16} className="text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Biblioteca</h3>
              </div>
              <div className="relative mb-6 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={12} />
                <input type="text" placeholder="Filtrar documentos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-muted/30 border border-border/60 rounded-xl pl-8 pr-3 py-2 text-[10px] placeholder:text-muted-foreground/40 font-semibold" />
              </div>
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-6 pb-6">
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em] border-b border-border pb-1">Seus Documentos</p>
                    <div className="space-y-0.5">
                      {filteredContracts.map(c => (
                        <Link key={c.id} href={`/editor?room=${c.id}`} className="w-full text-left text-[11px] py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{c.title || "Documento"}</span>
                          <Zap size={10} className={cn("opacity-0 hover:opacity-100", c.status === 'signed' ? "text-emerald-500" : "text-primary")} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-8 py-8 relative z-10">
          <div className="w-full max-w-[840px] mx-auto bg-card border border-border/40 rounded-3xl px-12 md:px-20 pt-10 pb-16 md:pt-16 md:pb-24 relative shadow-2xl animate-in fade-in duration-1000 min-h-[800px] md:min-h-[1188px]">
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-3xl" />
             <div className="relative z-10">
               {!readOnly && <BubbleMenu editor={editor} />}
               <EditorContentArea />
             </div>
             {!readOnly && (
               <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[540px] z-[100] px-4">
                  <AiMenu plain={true} />
               </div>
             )}
          </div>
        </main>

        <aside className={cn("h-full border-l border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30", rightSidebarOpen ? "w-96" : "w-0 opacity-0 pointer-events-none overflow-hidden")}>
          {readOnly ? (
            <div className="p-6 flex flex-col h-full justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <ShieldCheck size={20} className="text-primary animate-pulse" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Assinatura Digital</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">Revise o documento e preencha as credenciais para assinar.</p>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase">E-mail</label>
                    <input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="Seu e-mail..." className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase">Código (6 dígitos)</label>
                    <input type="text" maxLength={6} value={sealingCode} onChange={(e) => setSealingCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-[0.5em]" />
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <input type="checkbox" id="consent" checked={consentCheck} onChange={(e) => setConsentCheck(e.target.checked)} className="mt-0.5 rounded text-primary focus:ring-0" />
                    <label htmlFor="consent" className="text-[9px] text-muted-foreground leading-normal font-semibold cursor-pointer">Declaro que li e concordo com os termos.</label>
                  </div>
                </div>
              </div>
              <Button onClick={handleConfirmSignature} disabled={isSealing || !consentCheck} className="w-full bg-primary py-6 rounded-2xl font-black text-[10px] uppercase">Assinar Instrumento</Button>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <Tabs value={oracleTab} onValueChange={setOracleTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl h-10 mb-6 border border-border/40">
                  <TabsTrigger value="insights" className="text-[10px] font-bold uppercase tracking-wider transition-all">Auditoria IA</TabsTrigger>
                  <TabsTrigger value="logs" className="text-[10px] font-bold uppercase tracking-wider transition-all">Histórico</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="insights" className="h-full m-0 flex flex-col space-y-6">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="flex items-center gap-3">
                        <BrainCircuit size={16} className={cn("text-primary", isAuditing && "animate-pulse")} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Radar Analítico</h3>
                      </div>
                      <Button onClick={runAudit} disabled={isAuditing} variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider text-primary border-primary/20 hover:bg-primary/5 hover:border-primary transition-all">Analisar</Button>
                    </div>
                    <ScrollArea className="flex-1 -mx-2 px-2">
                       <div className="space-y-6 pb-6">
                          {!hasAudited ? (
                            <div className="py-16 text-center space-y-4 border border-dashed border-border rounded-2xl">
                              <Brain size={28} className="mx-auto text-muted-foreground opacity-20" />
                              <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed px-4">Utilize a IA para escanear inconsistências e otimizar este documento.</p>
                              <Button onClick={runAudit} disabled={isAuditing} className="bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold uppercase tracking-wider h-9 px-6 rounded-xl transition-all shadow-sm active:scale-95">Iniciar Análise</Button>
                            </div>
                          ) : (
                            <div className="space-y-5">
                              <div className="p-5 rounded-2xl bg-muted/30 border space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase">Score de Segurança</span>
                                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", auditStatus.color)}>{auditStatus.label}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-4xl font-black">{auditScore}</span>
                                  <span className="text-sm font-bold text-primary">%</span>
                                </div>
                                <p className="text-[9px] text-muted-foreground leading-relaxed italic">{auditStatus.desc}</p>
                              </div>
                              {auditResults.map((risk) => (
                                <div key={risk.id} className="p-4 rounded-2xl border bg-red-500/[0.02] border-red-500/10 space-y-2">
                                  <span className="text-[8px] font-black text-red-400 uppercase">Ponto de Atenção</span>
                                  <p className="text-[10px] font-bold italic">"{risk.originalText}"</p>
                                  <p className="text-[9px] text-muted-foreground">{risk.reason}</p>
                                  <Button size="sm" className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[9px] font-bold uppercase tracking-wider h-9 rounded-xl transition-all">Otimizar Cláusula</Button>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="logs" className="h-full m-0">
                    <ScrollArea className="flex-1 -mx-2 px-2">
                      <div className="space-y-4 pb-6">
                        {historyLogs.map((log) => (
                          <div key={log.id} className="p-4 rounded-2xl bg-muted/30 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-primary">{log.version}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">{log.time}</span>
                            </div>
                            <p className="text-[12px] font-bold mb-1">{log.action}</p>
                            <span className="text-[10px] text-muted-foreground">{log.user}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = "Comece a redigir...", geminiKey, templateSlug, readOnly } = props
  const { user } = useUser()
  const { setTocContent } = useToc()

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: { attributes: { class: "notion-like-editor" }, scrollThreshold: 0, scrollMargin: 0 },
    extensions: [
      StarterKit.configure({ undoRedo: false, horizontalRule: false, dropcursor: { width: 2 } }),
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
      Typography, UiState, TocNode.configure({ topOffset: 48 }), Gemini.configure({ apiKey: geminiKey || "" }), BubbleMenuExtension,
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

  const contextValue = useMemo(() => (editor ? { editor } : null), [editor])
  if (!editor || !contextValue) return <LoadingSpinner />

  return (
    <EditorContext.Provider value={contextValue}>
      <EditorLayout />
    </EditorContext.Provider>
  )
}

export function NotionEditor({ room, placeholder = "Comece a redigir...", templateSlug, readOnly }: NotionEditorProps) {
  return (
    <UserProvider>
      <CollabProvider room={room} key={room}>
        <AiProvider>
          <TocProvider>
            <AiMenuStateProvider>
              <NotionEditorContent placeholder={placeholder} templateSlug={templateSlug} readOnly={readOnly} />
            </AiMenuStateProvider>
          </TocProvider>
        </AiProvider>
      </CollabProvider>
    </UserProvider>
  )
}

export function NotionEditorContent({ placeholder, templateSlug, readOnly }: { placeholder?: string, templateSlug?: string | null, readOnly?: boolean }) {
  const { provider, ydoc, setupError: collabSetupError } = useCollab()
  const { geminiKey, setupError: aiSetupError } = useAi()

  if (collabSetupError || aiSetupError) return <SetupErrorMessage aiSetupError={aiSetupError} collabSetupError={collabSetupError} />
  if (!provider || !geminiKey) return <LoadingSpinner />

  return <EditorProvider provider={provider} ydoc={ydoc} placeholder={placeholder} geminiKey={geminiKey} templateSlug={templateSlug} readOnly={readOnly} />
}

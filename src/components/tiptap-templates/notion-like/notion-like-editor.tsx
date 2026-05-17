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
  Save
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
      toast.success("Link do ritual copiado.")
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
export function LoadingSpinner({ text = "Invocando Ritual..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)] animate-pulse duration-[4000ms]" />
      
      <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
        {/* The Portal (Logo) */}
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
      
      {/* Structural Framing */}
      <div className="absolute top-12 left-12 w-24 h-px bg-white/[0.03]" />
      <div className="absolute top-12 left-12 w-px h-24 bg-white/[0.03]" />
      <div className="absolute bottom-12 right-12 w-24 h-px bg-white/[0.03]" />
      <div className="absolute bottom-12 right-12 w-px h-24 bg-white/[0.03]" />
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
        isDragging ? "cursor-grabbing" : "cursor-default"
      )}
    >
      <DragContextMenu />
      <SlashDropdownMenu />
      {createPortal(<MobileToolbar />, document.body)}
    </EditorContent>
  )
}

const ORACLE_LOGS = [
  { id: 1, user: "Cadelo Imperial", action: "Cláusula de Sigilo Blindada", time: "12m atrás", version: "v2.4.1" },
  { id: 2, user: "Lilith OS", action: "Auditoria de Risco Concluída", time: "45m atrás", version: "v2.4.0" },
  { id: 3, user: "Cadelo Imperial", action: "Invocação de Template: M&A", time: "2h atrás", version: "v2.3.8" },
  { id: 4, user: "Sistema", action: "Sessão Colaborativa Iniciada", time: "4h atrás", version: "v2.3.0" },
];

const ORACLE_INSIGHTS = {
  score: 92,
  status: "Contrato Inabalável",
  vulnerabilityMsg: '"Detectei um flanco exposto na cláusula 7.2. Deseja realizar a blindagem estratégica?"',
};

/**
 * Component that creates and provides the editor instance
 */
export function EditorLayout() {
  const [oracleTab, setOracleTab] = useState("insights")
  const [fileName, setFileName] = useState("Contrato_Imperial_Alpha")
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
      toast.error("Cópia de segurança proibida sob as leis soberanas do ExtraJus.")
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      toast.error("Remoção ou corte de segurança proibido sob as leis soberanas do ExtraJus.")
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      toast.error("Colagem proibida. Redija seu pacto de forma pura.")
    }

    // 2. Prevent key combinations for copying, pasting, and printing
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey

      // Ctrl+C / Cmd+C (Copy)
      if (isCtrlOrCmd && e.key?.toLowerCase() === "c") {
        e.preventDefault()
        toast.error("Cópia de segurança proibida.")
      }

      // Ctrl+V / Cmd+V (Paste)
      if (isCtrlOrCmd && e.key?.toLowerCase() === "v") {
        e.preventDefault()
        toast.error("Colagem de segurança proibida.")
      }

      // Ctrl+X / Cmd+X (Cut)
      if (isCtrlOrCmd && e.key?.toLowerCase() === "x") {
        e.preventDefault()
        toast.error("Corte de segurança proibido.")
      }

      // Ctrl+P / Cmd+P (Print)
      if (isCtrlOrCmd && e.key?.toLowerCase() === "p") {
        e.preventDefault()
        toast.error("Impressão física ou digital proibida.")
      }

      // Detect Shift + Windows/Cmd + S (Windows Snipping Tool / Mac selection)
      if (e.shiftKey && e.metaKey && e.key?.toLowerCase() === "s") {
        e.preventDefault()
        setIsFocused(false)
        toast.error("Tentativa de captura de tela detectada. Bloqueando conteúdo.")
      }

      // Mac screenshot combinations: Cmd + Shift + 3 or Cmd + Shift + 4
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4")) {
        e.preventDefault()
        setIsFocused(false)
        toast.error("Tentativa de captura de tela detectada. Bloqueando conteúdo.")
      }
    }

    // 3. Prevent PrintScreen screen grabs by clearing the clipboard immediately
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.key === "PrtScn") {
        e.preventDefault()
        if (navigator.clipboard) {
          navigator.clipboard.writeText("Acesso não autorizado. Pacto de segurança do ExtraJus ativo.")
        }
        toast.error("Captura de tela detectada. Pacto de segurança inviolável acionado.")
      }
    }

    // 4. Block dragging selection or text blocks to copy externally
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      toast.error("Movimentação de texto desativada por segurança.")
    }

    // 5. Block standard browser right-click context menu (which has Copy/Paste)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      toast.error("Menu de contexto bloqueado pelas diretrizes de confidencialidade.")
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    // Use CAPTURE phase (true) for absolute interception supremacy
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

  const handleManualSave = async () => {
    if (!provider) {
      toast.error("Erro: Provedor de colaboração não está pronto.")
      return
    }
    
    setIsSaving(true)
    const toastId = toast.loading("Selando progresso no banco...")
    
    try {
      const result = await provider.forceSave()
      if (result.saved) {
        toast.success(result.message, { id: toastId })
      } else {
        toast.success(result.message, { id: toastId })
      }
    } catch (e: any) {
      toast.error(`Erro ao salvar pacto: ${e.message || e}`, { id: toastId })
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
    if (!hasAudited) return { label: "Inativa", color: "text-muted-foreground bg-muted border-border", barColor: "bg-muted", desc: "Oráculo adormecido. Inicie a auditoria para avaliar o pacto." };
    if (auditScore >= 90) return { label: "Soberano ✨", color: "text-[#c0ff00] bg-[#c0ff00]/10 border-[#c0ff00]/20", barColor: "bg-[#c0ff00]", desc: "Este pacto atingiu blindagem absoluta. As cláusulas estão impecáveis e extremamente seguras contra brechas de terceiros." };
    if (auditScore >= 70) return { label: "Seguro 👍", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", barColor: "bg-emerald-500", desc: "O contrato possui excelente blindagem. Alguns riscos pontuais foram identificados, mas a saúde estrutural é ótima." };
    if (auditScore >= 50) return { label: "Vulnerável ⚠️", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", barColor: "bg-amber-500", desc: "Presença de ambiguidades e riscos moderados. Sugerimos aplicar os ajustes recomendados pela IA Lilith." };
    return { label: "Risco Crítico 🔥", color: "text-red-400 bg-red-500/10 border-red-500/20", barColor: "bg-red-500", desc: "Vulnerabilidade crítica detectada! O pacto está exposto a graves riscos jurídicos que ameaçam a sua blindagem." };
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
    const toastId = toast.loading("Lilith está escaneando vulnerabilidades...")
    
    try {
      // Invocamos o comando da extensão Gemini
      await (editor.commands as any).aiAuditRisk()
      
      // Pequeno delay para a extensão processar e atualizar o storage
      setTimeout(() => {
        const results = (editor.storage as any).ai.auditResults
        setAuditResults(results || [])
        setHasAudited(true)
        setIsAuditing(false)
        toast.success("Auditoria concluída. Analise os riscos detectados.", { id: toastId })
      }, 3000)
    } catch (error) {
      console.error(error)
      toast.error("O Oráculo falhou na auditoria.", { id: toastId })
      setIsAuditing(false)
    }
  }

  const handleConfirmSignature = async () => {
    if (!signerEmail) {
      toast.error("Por favor, informe seu e-mail de convidado.")
      return
    }
    if (!sealingCode || sealingCode.length !== 6) {
      toast.error("Por favor, informe o código de selamento de 6 dígitos.")
      return
    }
    if (!consentCheck) {
      toast.error("Você precisa marcar o consentimento digital para prosseguir.")
      return
    }

    setIsSealing(true)
    const toastId = toast.loading("Selando o instrumento contratual na rede neural...")

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

      if (data.error) {
        throw new Error(data.error)
      }

      toast.success("Pacto selado com sucesso absoluta! A integridade digital foi garantida.", { id: toastId })
      setSealingCode("")
      setConsentCheck(false)
      
      // Pequeno delay para atualizar a tela e recarregar
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error: any) {
      toast.error(error.message || "Erro desconhecido ao selar pacto.", { id: toastId })
    } finally {
      setIsSealing(false)
    }
  }

  // Fetch dynamic content for Biblioteca and Logs
  useEffect(() => {
    const fetchArsenal = async () => {
      
      // Fetch Active Contract Title
      const { data: currentContract } = await supabase
        .from('contracts')
        .select('title')
        .eq('id', room)
        .single()
      
      if (currentContract && currentContract.title) {
        setFileName(currentContract.title)
      }

      // Fetch User Contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, title, status')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (contracts) setUserContracts(contracts)

      // Fetch Global Templates
      const { data: tmpls } = await supabase
        .from('templates')
        .select('id, title, slug')
        .limit(10)
      
      if (tmpls) setTemplates(tmpls)

      // Fetch History Logs from yjs_updates (simplified version)
      const { data: logs } = await supabase
        .from('yjs_updates')
        .select('created_at')
        .eq('contract_id', room)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (logs) {
        const formattedLogs = logs.map((log, i) => ({
          id: i,
          user: "Sistema",
          action: "Sincronização de Delta",
          time: new Date(log.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          version: `v${logs.length - i}.0`
        }))
        setHistoryLogs(formattedLogs)
      }
    }

    fetchArsenal()
  }, [room, supabase])

  // Debounced auto-save of filename to Supabase
  useEffect(() => {
    if (!room || readOnly) return
    
    // Skip saving the default initial value if it hasn't loaded yet
    if (fileName === "Contrato_Imperial_Alpha") return

    const delayDebounceFn = setTimeout(async () => {
      const { error } = await supabase
        .from('contracts')
        .update({ title: fileName })
        .eq('id', room)
      
      if (error) {
        console.error("Erro ao salvar título do pacto:", error.message)
      } else {
        // Also refresh userContracts sidebar list to show updated title immediately!
        const { data: contracts } = await supabase
          .from('contracts')
          .select('id, title, status')
          .order('updated_at', { ascending: false })
          .limit(10)
        if (contracts) setUserContracts(contracts)
      }
    }, 1000) // 1s debounce

    return () => clearTimeout(delayDebounceFn)
  }, [fileName, room, readOnly, supabase])

  // Scroll to the top of the A4 paper on mount/room change to prevent starting at the bottom
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTop = 0
    }

    const timer1 = setTimeout(() => {
      const mainEl = document.querySelector('main')
      if (mainEl) mainEl.scrollTop = 0
    }, 100)

    const timer2 = setTimeout(() => {
      const mainEl = document.querySelector('main')
      if (mainEl) mainEl.scrollTop = 0
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [room])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap.ProseMirror {
          font-family: ${fontFamily === "Lora" ? '"Lora", serif' : fontFamily === "Inter" ? '"Inter", sans-serif' : fontFamily === "Times New Roman" ? '"Times New Roman", serif' : '"JetBrains Mono", monospace'} !important;
          font-size: ${fontSize}px !important;
        }
      ` }} />
      
      {/* Background Ornaments */}
      <div className="absolute top-12 left-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute top-12 left-12 w-px h-24 bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-px h-24 bg-foreground/[0.03]" />

      {/* Settings Modal (Arsenal Config) */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 border-border bg-card rounded-3xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Arsenal Config</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronização Realtime</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auto-Salvamento (2s)</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">Otimizado</Badge>
              </div>
            </div>
            <Button onClick={() => setShowSettings(false)} className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-6 rounded-2xl">
              Fechar Configurações
            </Button>
          </Card>
        </div>
      )}

      {/* Sovereign Header - The Command Monolith */}
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
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg">
                Somente Leitura
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[160px]">{fileName}.docx</span>
            <div className="h-4 w-px bg-border/50" />
            <div className="flex items-center gap-2.5 text-[9px] font-bold text-muted-foreground/50 tracking-wider">
              <span className="bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full border border-primary/10 font-black uppercase tracking-[0.1em]">Soberano v2.4.0</span>
              <span className="flex items-center gap-1"><FileText size={10} /> {wordCount} palavras</span>
              <span className="flex items-center gap-1"><Cpu size={10} /> {readTime} min</span>
            </div>
          </div>
        </div>

        {/* Neural Action Center: Symmetrical Command Bridge */}
        {!readOnly && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 z-[110]">
            
            {/* Left Wing: Structure & Weight */}
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <MarkButton type="strike" />
              <ResetAllFormattingButton />
            </div>

            <div 
              className="relative flex items-center justify-center px-3 h-12 rounded-none cursor-default group/ia transition-all overflow-hidden border-x border-primary/10 gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 transition-all" />
              <BrainCircuit size={14} className="text-primary/60 relative z-10 animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.2em] relative z-10 text-primary/80">IA</span>
            </div>

            {/* Right Wing: Refinement & Style */}
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
            <div className="flex items-center gap-3 ml-2">
              <CollaborationUsers />
              <ThemeToggle />
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2 pl-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving}
                className="h-8 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider gap-1.5 rounded-lg px-3 transition-all duration-300"
              >
                <Save className={cn("w-3.5 h-3.5", isSaving && "animate-spin")} />
                {isSaving ? "Gravando..." : "Salvar"}
              </Button>
              <ExportButton />
              <SignModal title={fileName} />
            </div>
          )}
        </div>
      </header>

      {!isFocused && (
        <div className="absolute inset-0 top-12 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[5px] z-[99999] transition-all duration-500 select-none pointer-events-none">
          <div className="text-center p-8 bg-background/90 border border-primary/20 rounded-3xl max-w-md shadow-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-2">Escudo Confidencial Ativo</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
              O foco da tela foi perdido. O conteúdo foi ocultado automaticamente sob a diretiva de proteção de segredo ExtraJus.
            </p>
          </div>
        </div>
      )}

      <div className={cn(
        "flex-1 flex pt-12 relative overflow-hidden h-full transition-all duration-700",
        !isFocused && "filter blur-[45px] select-none pointer-events-none"
      )}>
        
        {/* Left Sidebar: O Códice (The War Library) */}
        {!readOnly && (
          <div 
            className={cn(
              "h-full border-r border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30",
              leftSidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none overflow-hidden"
            )}
          >
            <div className="p-6 flex flex-col h-full overflow-hidden min-h-0">
              
              {/* Tipografia Soberana - Fixed at Top */}
              <div className="space-y-5 relative overflow-hidden group/tipografia mb-8 shrink-0">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Zap size={10} className="text-primary" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Tipografia Soberana</span>
                  </div>
                  <span className="text-[10px] opacity-40">🖋️</span>
                </div>
                
                {/* Font Style Selection */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Estilo de Letra</label>
                  <div className="relative">
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-muted/20 hover:bg-muted/40 border border-border/40 hover:border-primary/20 text-foreground text-[10px] font-black uppercase tracking-wider py-2 pl-3 pr-8 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    >
                      <option value="Lora" className="text-foreground bg-background font-serif">Lora (Serifa)</option>
                      <option value="Inter" className="text-foreground bg-background font-sans">Inter (Sans)</option>
                      <option value="Times New Roman" className="text-foreground bg-background font-serif">Times (Formal)</option>
                      <option value="JetBrains Mono" className="text-foreground bg-background font-mono">JetBrains (Brutal)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* Font Size Selector (with Shadcn Slider) */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Tamanho da Letra</label>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/10">{fontSize}px</span>
                  </div>
                  <div className="px-1 py-1.5 flex items-center gap-3">
                    <span className="text-[9px] font-black text-muted-foreground/40">A-</span>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(val) => { if (Array.isArray(val)) { setFontSize(val[0]); } else if (typeof val === "number") { setFontSize(val); } }}
                      min={12}
                      max={26}
                      step={1}
                      className="flex-1 opacity-70 hover:opacity-100 transition-opacity"
                    />
                    <span className="text-[9px] font-black text-muted-foreground/40">A+</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 shrink-0 pt-10 border-t border-border/40 mt-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Library size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Biblioteca</h3>
                  <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">Arsenal Ativo</p>
                </div>
              </div>

              {/* Search Box - Live Filtering */}
              <div className="relative mb-6 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={12} />
                <input 
                  type="text"
                  placeholder="Filtrar arsenal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/30 border border-border/60 hover:border-primary/20 focus:border-primary rounded-xl pl-8 pr-3 py-2 text-[10px] text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/40 font-semibold"
                />
              </div>

              <div className="flex-1 -mx-2 px-2 overflow-y-auto custom-scrollbar min-h-0">
                <div className="space-y-6 pb-6">
                  {/* Seus Pactos (User Contracts) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-1.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em]">Seus Pactos</p>
                      <span className="text-[9px] opacity-40">🛡️</span>
                    </div>
                    <div className="space-y-0.5">
                      {filteredContracts.length > 0 ? filteredContracts.map(contract => (
                        <Link key={contract.id} href={`/editor?room=${contract.id}`} className="w-full text-left text-[11px] py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{contract.title || "Documento Sem Nome"}</span>
                          <Zap size={10} className={cn("opacity-0 group-hover/item:opacity-100 transition-opacity", contract.status === 'signed' ? "text-emerald-500" : "text-primary")} />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-muted-foreground px-2 py-1.5 italic font-semibold">Nenhum pacto encontrado...</p>
                      )}
                    </div>
                  </div>

                  {/* Arsenal de Modelos (Global Templates) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-1.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em]">Modelos Soberanos</p>
                      <span className="text-[9px] opacity-40">📖</span>
                    </div>
                    <div className="space-y-0.5">
                      {filteredTemplates.length > 0 ? filteredTemplates.map(template => (
                        <Link key={template.id} href={`/editor?template=${template.slug}`} className="w-full text-left text-[11px] py-2 px-2.5 hover:bg-primary/5 hover:text-primary rounded-lg transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{template.title}</span>
                          <ArrowRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-primary" />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-muted-foreground px-2 py-1.5 italic font-semibold">Nenhum modelo encontrado...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Central Sanctuary - The Infinite Paper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-8 py-8 relative z-10">
          <div className="w-full max-w-[840px] mx-auto bg-card border border-border/40 rounded-3xl px-12 md:px-20 pt-10 pb-16 md:pt-16 md:pb-24 relative shadow-[0_4px_30px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-1000 min-h-[800px] md:min-h-[1188px]">
             
             {/* Premium Paper Texture */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-3xl" />
             
             {/* Focus Light Effect */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/5 blur-[80px] pointer-events-none rounded-full" />

             <div className="relative z-10 selection:bg-primary/30">
               {!readOnly && <BubbleMenu editor={editor} />}
               <EditorContentArea />
             </div>

             {/* Fixed Transparent AI Command Center */}
             {!readOnly && (
               <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[540px] z-[100] px-4 animate-in slide-in-from-bottom-10 duration-1000">
                  <AiMenu plain={true} />
               </div>
             )}
          </div>
        </main>

        {/* Right Sidebar: A Alquimia (The Oracle of Lilith) or Sealing Panel */}
        <div 
          className={cn(
            "h-full border-l border-border bg-card/20 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-300 relative z-30",
            rightSidebarOpen ? "w-96 opacity-100" : "w-0 opacity-0 pointer-events-none overflow-hidden"
          )}
        >
          {readOnly ? (
            <div className="p-6 flex flex-col h-full justify-between relative group/oracle">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ShieldCheck size={20} className="text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Selamento de Pacto</h3>
                    <span className="text-[8px] text-primary font-bold uppercase tracking-widest font-black">Painel do Signatário</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                    Você foi convidado para selar digitalmente este pacto soberano. Revise o documento à esquerda (somente leitura) e preencha as credenciais de autenticação para assinar.
                  </p>

                  <div className="h-px bg-border my-2" />

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">E-mail Convidado</label>
                    <input 
                      type="email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder="Seu e-mail de convocação..."
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Código de Selamento (6 dígitos)</label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={sealingCode}
                      onChange={(e) => setSealingCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 123456"
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-[0.5em] text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-3 mt-4">
                    <input 
                      type="checkbox"
                      id="consent"
                      checked={consentCheck}
                      onChange={(e) => setConsentCheck(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-0"
                    />
                    <label htmlFor="consent" className="text-[9px] text-muted-foreground leading-normal font-semibold cursor-pointer">
                      Declaro que li e concordo com os termos deste pacto e dou meu consentimento digital irrevogável sob as penas da lei.
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <Button 
                  onClick={handleConfirmSignature}
                  disabled={isSealing || !consentCheck || !sealingCode}
                  className="w-full bg-primary hover:opacity-90 text-primary-foreground font-black text-[10px] uppercase tracking-widest py-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] active:scale-95"
                >
                  {isSealing ? "Selando Instrumento..." : "Selar Instrumento Jurídico"}
                </Button>

                <div className="text-center">
                  <span className="text-[7px] text-muted-foreground uppercase tracking-widest opacity-50 font-black">ExtraJus AI • Ritual Sovereign Protocol</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col h-full overflow-hidden group/oracle">
              <Tabs value={oracleTab} onValueChange={setOracleTab} className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 bg-muted/40 rounded-xl h-9 p-0.5 border border-border items-center mb-6">
                  <TabsTrigger value="insights" className="rounded-lg text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full flex items-center justify-center">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="rounded-lg text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full flex items-center justify-center">
                    Logs
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="insights" className="h-full m-0 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-none">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <BrainCircuit size={16} className={cn("text-primary", isAuditing && "animate-pulse")} />
                        </div>
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Alquimia AI</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isAuditing ? "bg-amber-500 animate-ping" : "bg-green-500")} />
                            <span className={cn("text-[7px] font-bold uppercase tracking-widest", isAuditing ? "text-amber-500" : "text-green-500")}>
                              {isAuditing ? "Auditoria em Curso" : "Sincronizada"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={runAudit}
                        disabled={isAuditing}
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-lg transition-all"
                      >
                        <Zap size={10} className="mr-1.5" /> Auditoria
                      </Button>
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2 custom-scrollbar">
                      <div className="space-y-6 pb-6">
                        <div className="space-y-4">
                          <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em] border-l-2 border-primary pl-2.5">
                            Status de Blindagem
                          </h4>

                          {!hasAudited ? (
                            <div className="py-16 text-center space-y-4 border border-dashed border-border rounded-2xl bg-muted/5 transition-colors">
                              <Brain size={28} className="mx-auto text-muted-foreground animate-pulse" />
                              <div className="space-y-1 px-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                  Análise Neural Inativa
                                </p>
                                <p className="text-[9px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                                  Invoque o oráculo da IA Lilith para escanear brechas, ambiguidades e blindar este instrumento.
                                </p>
                              </div>
                              <Button 
                                onClick={runAudit}
                                disabled={isAuditing}
                                className="bg-primary hover:opacity-90 text-primary-foreground font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl transition-all"
                              >
                                {isAuditing ? "Escaneando..." : "Iniciar Escaneamento"}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-5">
                              {/* Shielding Health Panel */}
                              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                    Score de Blindagem
                                  </span>
                                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", auditStatus.color)}>
                                    {auditStatus.label}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="text-5xl font-black tracking-tighter text-foreground">
                                    {auditScore}
                                  </span>
                                  <span className="text-lg font-bold text-primary">%</span>
                                </div>

                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all duration-1000", auditStatus.barColor)}
                                    style={{ width: `${auditScore}%` }} 
                                  />
                                </div>

                                <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                                  "{auditStatus.desc}"
                                </p>
                              </div>

                              {/* Cláusulas de Risco list */}
                              {auditResults.length > 0 ? (
                                <div className="space-y-3">
                                  <h5 className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 pl-1">
                                    Vulnerabilidades no Pacto ({auditResults.length})
                                  </h5>
                                  <div className="space-y-3">
                                     {auditResults.map((risk) => (
                                       <div key={risk.id} className="p-4 rounded-2xl bg-red-500/[0.02] border border-red-500/10 space-y-2.5 group/risk hover:border-red-500/25 transition-all">
                                         <div className="flex items-center justify-between">
                                           <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                             <ShieldAlert size={10} /> Cláusula de Risco
                                           </span>
                                           <span className="text-[8px] font-bold text-red-500/70 uppercase">Score -15%</span>
                                         </div>
                                         <p className="text-[10px] font-bold text-foreground italic">"{risk.originalText}"</p>
                                         <p className="text-[9px] text-muted-foreground leading-relaxed">{risk.reason}</p>
                                         <Button size="sm" className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[8px] font-black uppercase tracking-widest h-8 rounded-xl transition-all">
                                            Aplicar Sugestão de Blindagem
                                         </Button>
                                       </div>
                                     ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6 text-center space-y-3 border border-dashed border-[#c0ff00]/30 bg-[#c0ff00]/[0.01] rounded-2xl">
                                  <ShieldCheck size={28} className="mx-auto text-[#c0ff00]" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#c0ff00]">Blindagem Total Confirmada</p>
                                  <p className="text-[9px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">Nenhuma brecha estrutural detectada pela rede neural da IA Lilith. O pacto está chancelado.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="logs" className="h-full m-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 border-none">
                    <ScrollArea className="flex-1 -mx-2 px-2 custom-scrollbar">
                      <div className="space-y-4 pb-6">
                        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
                          <h4 className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <History size={10} className="text-primary" />
                            Histórico do Pacto
                          </h4>
                        </div>
                        
                        {historyLogs.length > 0 ? historyLogs.map((log) => (
                          <div key={log.id} className="p-4 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 transition-all group/log cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{log.version}</span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">{log.time}</span>
                            </div>
                            <p className="text-[12px] font-bold text-foreground mb-1 group-hover/log:text-primary transition-colors">{log.action}</p>
                            <div className="flex items-center gap-2">
                               <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                                 {log.user[0]}
                               </div>
                               <span className="text-[10px] font-medium text-muted-foreground">{log.user}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="py-16 text-center space-y-3 opacity-20 border border-dashed border-border rounded-2xl">
                            <History size={24} className="mx-auto" />
                            <p className="text-[8px] font-black uppercase tracking-widest">Nenhum log de alteração encontrado.</p>
                          </div>
                        )}

                        <div className="pt-8 text-center opacity-20">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                          <Cpu size={24} className="mx-auto mb-3" />
                          <p className="text-[8px] font-black uppercase tracking-[0.4em]">End of Log Archive</p>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = "Comece a redigir a cláusula...", geminiKey, templateSlug, readOnly } = props

  const { user } = useUser()
  const { setTocContent } = useToc()

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "notion-like-editor",
      },
      // Prevent automatic scroll into view when editor is focused
      // This is crucial for header buttons to work without jumping the page
      scrollThreshold: 0,
      scrollMargin: 0,
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph", "legalNode"] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({
        provider,
        user: { id: user.id, name: user.name, color: user.color },
      }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-empty with-slash",
      }),
      TableKit.configure({
        table: {
          resizable: true,
          cellMinWidth: 120,
        },
      }),
      NodeBackground.configure({
        types: [
          "paragraph",
          "heading",
          "blockquote",
          "tableCell",
          "tableHeader",
          "tocNode",
          "legalNode",
        ],
      }),
      NodeAlignment,
      Superscript,
      Subscript,
      Indent,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Selection,
      Image,
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate(content) {
          setTocContent((prev: any) => {
            if (!prev || prev.length !== content.length) return content
            for (let i = 0; i < prev.length; i++) {
              if (
                prev[i].id !== content[i].id || 
                prev[i].textContent !== content[i].textContent || 
                prev[i].level !== content[i].level ||
                prev[i].isActive !== content[i].isActive
              ) {
                return content
              }
            }
            return prev
          })
        },
      }),
      TableHandleExtension,
      ListNormalizationExtension,
      LegalNode,
      VariableNode,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      UniqueID.configure({
        types: [
          "table",
          "paragraph",
          "bulletList",
          "orderedList",
          "heading",
          "blockquote",
          "codeBlock",
          "tocNode",
          "legalNode",
        ],
        filterTransaction: (transaction) => !isChangeOrigin(transaction),
      }),
      Typography,
      UiState,
      TocNode.configure({
        topOffset: 48,
      }),
      Gemini.configure({
        apiKey: geminiKey || "",
      }),
      // Underline,
      /* TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "contract-link",
        },
      }), */
      BubbleMenuExtension,
    ],
  })

  // Enforce readOnly/editable state dynamically
  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  // Template Pre-population Logic
  useEffect(() => {
    if (!editor || !templateSlug) return

    const checkAndFill = async () => {
      // Small delay to ensure Yjs has loaded existing content if any
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (editor.isEmpty) {
        console.log(`[NotionEditor] Pre-populating with template: ${templateSlug}`)
        const supabase = createClient()
        const { data } = await supabase
          .from("templates")
          .select("content")
          .eq("slug", templateSlug)
          .single()

        if (data?.content) {
          editor.commands.setContent(data.content)
          toast.success("Modelo carregado no editor.")
        }
      }
    }

    checkAndFill()
  }, [editor, templateSlug])

  const contextValue = useMemo(() => (editor ? { editor } : null), [editor])
  const memoizedLayout = useMemo(() => <EditorLayout />, [])

  if (!editor || !contextValue) {
    return <LoadingSpinner />
  }

  return (
    <EditorContext.Provider value={contextValue}>
      {memoizedLayout}
    </EditorContext.Provider>
  )
}

/**
 * Full editor with all necessary providers, ready to use with just a room ID
 */
export function NotionEditor({
  room,
  placeholder = "Start writing...",
  templateSlug,
  readOnly,
}: NotionEditorProps) {
  return (
    <UserProvider>
      <CollabProvider room={room}>
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

/**
 * Internal component that handles the editor loading state
 */
export function NotionEditorContent({ 
  placeholder, 
  templateSlug,
  readOnly
}: { 
  placeholder?: string, 
  templateSlug?: string | null,
  readOnly?: boolean
}) {
  const { provider, ydoc, setupError: collabSetupError } = useCollab()
  const { geminiKey, setupError: aiSetupError } = useAi()

  // Show setup error if either collab or AI setup failed
  if (collabSetupError || aiSetupError) {
    return (
      <SetupErrorMessage
        aiSetupError={aiSetupError}
        collabSetupError={collabSetupError}
      />
    )
  }

  if (!provider || !geminiKey) {
    return <LoadingSpinner />
  }

  return (
    <EditorProvider
      provider={provider}
      ydoc={ydoc}
      placeholder={placeholder}
      geminiKey={geminiKey}
      templateSlug={templateSlug}
      readOnly={readOnly}
    />
  )
}

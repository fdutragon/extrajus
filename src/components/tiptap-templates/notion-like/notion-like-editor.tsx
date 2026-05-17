"use client"

import { useContext, useEffect, useMemo } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import type { Doc as YDoc } from "yjs"
import { createPortal } from "react-dom"
import { SupabaseYjsProvider } from "../../../lib/supabase-yjs-provider"
import { Gemini } from "../../../components/tiptap-extension/gemini-ai-extension"
import { createClient } from "@/utils/supabase/client"

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
  Cpu
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
          <div className="absolute -inset-8 bg-primary/20 blur-[50px] rounded-full animate-pulse transition-all duration-700" />
          <div className="relative flex flex-col items-center">
            <span className="text-[24px] font-black uppercase tracking-[0.6em] text-primary">
              ExtraJus
            </span>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2 scale-x-0 animate-in slide-in-from-left duration-1000 fill-mode-forwards" style={{ animationDelay: '500ms' }} />
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
      className="notion-like-editor-content"
      style={{
        cursor: isDragging ? "grabbing" : "auto",
      }}
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
  const { state, updateState } = useAiMenuState()
  const { editor } = useContext(EditorContext)!
  const { provider, room } = useCollab()

  const searchParams = useSearchParams()
  const readOnly = searchParams?.get("mode") === "preview" || searchParams?.get("readOnly") === "true"

  const [signerEmail, setSignerEmail] = useState("")
  const [sealingCode, setSealingCode] = useState("")
  const [consentCheck, setConsentCheck] = useState(false)
  const [isSealing, setIsSealing] = useState(false)

  const handleConfirmSignature = async () => {
    if (!sealingCode) {
      toast.error("Por favor, insira o código de selamento de 6 dígitos.")
      return
    }
    if (!consentCheck) {
      toast.error("Você precisa aceitar os termos de consentimento digital.")
      return
    }

    setIsSealing(true)
    const toastId = toast.loading("Validando evidências e selando pacto...")

    try {
      const res = await fetch("/api/sign/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: room,
          sealingCode,
          email: signerEmail || undefined
        })
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || "Erro desconhecido")
      }

      toast.success("PACTO SELADO COM SUCESSO! A integridade foi gravada.", { id: toastId })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Falha no ritual de selamento.", { id: toastId })
    } finally {
      setIsSealing(false)
    }
  }

  // Fetch dynamic content for Biblioteca
  useEffect(() => {
    const fetchArsenal = async () => {
      const supabase = createClient()
      
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
    }

    fetchArsenal()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30">
      
      {/* Background Ornaments */}
      <div className="absolute top-12 left-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute top-12 left-12 w-px h-24 bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-px h-24 bg-foreground/[0.03]" />

      {/* Sovereign Header - The Command Monolith */}
      <header className="fixed top-0 left-0 w-full h-12 border-b border-border bg-background/60 backdrop-blur-2xl flex items-center justify-between px-6 z-[100] transition-all duration-500 hover:bg-background/80 group">
        <div className="flex items-center gap-6">
          {!readOnly ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 group/back">
                <ChevronLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg">
                Somente Leitura
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 group/brand cursor-default">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary transition-all">ExtraJus</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 truncate max-w-[120px]">{fileName}.docx</span>
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
              className="relative flex items-center justify-center px-3 h-10 rounded-none cursor-default group/ia transition-all overflow-hidden border border-primary/10 gap-2"
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
              <ExportButton />
              <SignModal title={fileName} />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex pt-12 relative overflow-hidden">
        
        {/* Fixed Left: O Códice (The War Library) */}
        {!readOnly && (
          <div className="absolute left-6 top-12 z-40 hidden lg:block animate-in slide-in-from-left-12 duration-1000 mt-6">
            <div className="w-96 h-[calc(100vh-96px)] bg-card border border-border rounded-[2rem] overflow-hidden flex flex-col group/library">
            
            <div className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Library size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Biblioteca</h3>
                  <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">Arsenal Ativo</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden px-4">
              <ScrollArea className="h-full pr-4 custom-scrollbar">
                <div className="space-y-8 py-4 px-2">
                  
                  {/* Seus Pactos (User Contracts) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">Seus Pactos</p>
                      <span className="text-[10px] grayscale opacity-50 text-primary">🛡️</span>
                    </div>
                    <div className="space-y-1">
                      {userContracts.length > 0 ? userContracts.map(contract => (
                        <Link key={contract.id} href={`/editor?room=${contract.id}`} className="w-full text-left text-xs py-2.5 px-3 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{contract.title || "Documento Sem Nome"}</span>
                          <Zap size={10} className={cn("opacity-0 group-hover/item:opacity-100 transition-opacity", contract.status === 'signed' ? "text-emerald-500" : "text-primary")} />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-muted-foreground px-3 py-2 italic font-medium">Nenhum pacto selado ainda...</p>
                      )}
                    </div>
                  </div>

                  {/* Arsenal de Modelos (Global Templates) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">Arsenal de Modelos</p>
                      <span className="text-[10px] grayscale opacity-50">📖</span>
                    </div>
                    <div className="space-y-1">
                      {templates.length > 0 ? templates.map(template => (
                        <Link key={template.id} href={`/editor?template=${template.slug}`} className="w-full text-left text-xs py-2.5 px-3 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{template.title}</span>
                          <ArrowRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-primary" />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-muted-foreground px-3 py-2 italic font-medium">Carregando arsenal...</p>
                      )}
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </div>

            <div className="p-6 mt-auto bg-muted/50 border-t border-border">
               <Button variant="ghost" className="w-full justify-center text-[10px] font-black uppercase tracking-widest h-10 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground">
                 <Settings2 size={14} className="mr-2" /> Arsenal Config
               </Button>
            </div>
          </div>
        </div>
      )}

        {/* Central Sanctuary - The Infinite Paper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent pt-6 pb-6 px-4 relative z-10">
          <div className="w-full max-w-[880px] mx-auto min-h-[calc(100vh-96px)] bg-card border border-border/50 rounded-3xl p-20 md:pt-16 md:pb-20 md:px-32 relative animate-in fade-in zoom-in-95 duration-1000">
             
             {/* Document Title Header */}
             <div className="mb-6 group/title relative">
               <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary/0 group-hover/title:bg-primary/20 transition-all rounded-full" />
               <input 
                 value={fileName}
                 onChange={(e) => setFileName(e.target.value)}
                 disabled={readOnly}
                 className="w-full bg-transparent border-none text-xl md:text-2xl font-black tracking-tight focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20 text-foreground uppercase italic disabled:opacity-80 disabled:cursor-default"
                 placeholder="Título do Documento..."
               />
               <div className="flex items-center gap-2 mt-0.5 opacity-0 group-hover/title:opacity-100 transition-opacity">
                  <FileText size={8} className="text-primary" />
                  <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Documento Soberano • v2.4.0</span>
               </div>
             </div>

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
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-[100] px-4 animate-in slide-in-from-bottom-10 duration-1000">
                   <AiMenu plain={true} />
                </div>
              )}
          </div>
        </main>

        {/* Fixed Right: A Alquimia (The Oracle of Lilith) or Sealing Panel */}
        <div className="absolute right-6 top-12 z-40 hidden xl:block animate-in slide-in-from-right-12 duration-1000 mt-6">
          {readOnly ? (
            <div className="w-96 h-[calc(100vh-96px)] bg-card border border-border rounded-[2rem] flex flex-col p-8 justify-between relative group/oracle">
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
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all font-semibold"
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
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-center text-lg font-black tracking-[0.5em] text-foreground focus:outline-none focus:border-primary transition-all"
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

              <div className="space-y-4">
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
            <div className="w-96 h-[calc(100vh-96px)] bg-card border border-border rounded-[2rem] flex flex-col overflow-hidden group/oracle">
              <Tabs value={oracleTab} onValueChange={setOracleTab} className="w-full h-full flex flex-col">
                <div className="px-8 pt-8 mb-6">
                  <TabsList className="grid w-full grid-cols-2 bg-muted rounded-2xl h-10 p-1 border border-border items-center">
                    <TabsTrigger value="insights" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full flex items-center justify-center">
                      Insights
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full flex items-center justify-center">
                      Logs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden px-8 pb-8">
                  <TabsContent value="insights" className="h-full m-0 flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 border-none">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <BrainCircuit size={20} className="text-primary animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Alquimia AI</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                          <span className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Sincronizada</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] border-l-2 border-primary pl-3">Score de Dominação</h4>
                        <div className="flex items-baseline gap-3">
                          <div className="text-5xl font-black tracking-tighter text-foreground">{ORACLE_INSIGHTS.score}</div>
                          <div className="text-xl font-bold text-primary">%</div>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-gradient-to-r from-primary to-primary/60" />
                        </div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={12} /> {ORACLE_INSIGHTS.status}
                        </p>
                        <div className="space-y-4 pt-4 border-t border-border">
                         <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">Vulnerabilidades</h4>
                         <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl p-5 space-y-4 group/card hover:border-primary/30 transition-all">
                           <p className="text-[11px] leading-relaxed italic text-muted-foreground font-medium">
                             {ORACLE_INSIGHTS.vulnerabilityMsg}
                           </p>
                           <Button size="sm" className="w-full bg-primary hover:opacity-90 text-primary-foreground text-[9px] font-black uppercase tracking-widest h-9 rounded-xl transition-all active:scale-95">
                             Aplicar Blindagem
                           </Button>
                         </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="h-full m-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 border-none">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <History size={12} className="text-primary" />
                          Histórico de Versões
                        </h4>
                      </div>
                      
                      {ORACLE_LOGS.map((log) => (
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
                      ))}

                      <div className="pt-8 text-center opacity-20">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                        <Cpu size={24} className="mx-auto mb-3" />
                        <p className="text-[8px] font-black uppercase tracking-[0.4em]">End of Log Archive</p>
                      </div>
                    </div>

                    <Button className="mt-4 w-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest py-6 rounded-2xl">
                      <History className="mr-2 h-4 w-4" /> Restaurar Versão Anterior
                    </Button>
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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
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

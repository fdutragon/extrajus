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
        copied ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-zinc-500 hover:text-orange-500 hover:bg-orange-500/5 hover:border-orange-500/10"
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
}

export interface EditorProviderProps {
  provider: SupabaseYjsProvider
  ydoc: YDoc
  placeholder?: string
  geminiKey: string | null
  templateSlug?: string | null
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Invocando Ritual..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white dark:bg-[#050505] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.05),transparent_70%)] animate-pulse duration-[4000ms]" />
      
      <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
        {/* The Portal (Logo) */}
        <div className="relative group">
          <div className="absolute -inset-8 bg-orange-600/20 blur-[50px] rounded-full animate-pulse group-hover:bg-orange-600/30 transition-all duration-700" />
          <div className="relative flex flex-col items-center">
            <span className="text-[24px] font-black uppercase tracking-[0.6em] text-orange-600 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]">
              ExtraJus
            </span>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent mt-2 scale-x-0 animate-in slide-in-from-left duration-1000 fill-mode-forwards" style={{ animationDelay: '500ms' }} />
          </div>
        </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
            {text}
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-1 h-1 rounded-full bg-orange-600/40 animate-bounce" 
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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-orange-500/30">
      
      {/* Background Ornaments */}
      <div className="absolute top-12 left-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute top-12 left-12 w-px h-24 bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-24 h-px bg-foreground/[0.03]" />
      <div className="absolute bottom-12 right-12 w-px h-24 bg-foreground/[0.03]" />

      {/* Sovereign Header - The Command Monolith */}
      <header className="fixed top-0 left-0 w-full h-12 border-b border-border bg-background/60 backdrop-blur-2xl flex items-center justify-between px-6 z-[100] transition-all duration-500 hover:bg-background/80 group">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all duration-300 group/back">
              <ChevronLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 group/brand cursor-default">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.3)] group-hover/brand:drop-shadow-[0_0_15px_rgba(234,88,12,0.6)] transition-all">ExtraJus</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 truncate max-w-[120px]">{fileName}.docx</span>
            </div>
          </div>
        </div>

        {/* Neural Action Center: Symmetrical Command Bridge */}
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
            className="relative flex items-center justify-center px-3 h-10 rounded-none cursor-default group/ia transition-all overflow-hidden border border-orange-500/10 gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-orange-950/10 transition-all" />
            <BrainCircuit size={14} className="text-orange-500/60 relative z-10 animate-pulse" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] relative z-10 text-orange-500/80">IA</span>
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pr-4 border-r border-border/50">
            <InviteButton room={room || ""} />
            <div className="flex items-center gap-3 ml-2">
              <CollaborationUsers />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <ExportButton />
            <SignModal />
          </div>
        </div>
      </header>

      <div className="flex-1 flex pt-12 relative overflow-hidden">
        
        {/* Fixed Left: O Códice (The War Library) */}
        <div className="absolute left-6 top-12 z-40 hidden lg:block animate-in slide-in-from-left-12 duration-1000 mt-6">
          <div className="w-80 h-[calc(100vh-96px)] bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden flex flex-col group/library">
            
            <div className="p-8 pb-4">
              <div className="flex items-center gap-2 mb-6 opacity-40 group-hover/library:opacity-100 transition-opacity">
                <FileText size={12} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">Nexus_Imperial.ext</span>
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/5">
                  <Library size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Biblioteca</h3>
                  <p className="text-[8px] font-bold text-orange-500/60 uppercase tracking-widest">Arsenal Ativo</p>
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
                      <span className="text-[10px] grayscale opacity-50 text-orange-500">🛡️</span>
                    </div>
                    <div className="space-y-1">
                      {userContracts.length > 0 ? userContracts.map(contract => (
                        <Link key={contract.id} href={`/editor?room=${contract.id}`} className="w-full text-left text-[11px] py-2.5 px-3 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{contract.title || "Documento Sem Nome"}</span>
                          <Zap size={10} className={cn("opacity-0 group-hover/item:opacity-100 transition-opacity", contract.status === 'signed' ? "text-emerald-500" : "text-orange-500")} />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-zinc-600 px-3 py-2 italic font-medium">Nenhum pacto selado ainda...</p>
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
                        <Link key={template.id} href={`/editor?template=${template.slug}`} className="w-full text-left text-[11px] py-2.5 px-3 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all duration-300 group/item flex items-center justify-between font-bold text-foreground/70">
                          <span className="truncate">{template.title}</span>
                          <ArrowRight size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-orange-500" />
                        </Link>
                      )) : (
                        <p className="text-[9px] text-zinc-600 px-3 py-2 italic font-medium">Carregando arsenal...</p>
                      )}
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </div>

            <div className="p-6 mt-auto bg-muted/50 border-t border-border">
               <Button variant="ghost" className="w-full justify-center text-[10px] font-black uppercase tracking-widest h-10 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all text-muted-foreground">
                 <Settings2 size={14} className="mr-2" /> Arsenal Config
               </Button>
            </div>
          </div>
        </div>

        {/* Central Sanctuary - The Infinite Paper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent flex justify-center pt-6 pb-32 px-4 relative z-10">
          <div className="w-full max-w-[880px] h-fit min-h-full bg-card shadow-2xl border border-border rounded-3xl p-20 md:pt-16 md:pb-40 md:px-32 relative animate-in fade-in zoom-in-95 duration-1000">
             
             {/* Document Title Header */}
             <div className="mb-6 group/title relative">
               <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-orange-600/0 group-hover/title:bg-orange-600/20 transition-all rounded-full" />
               <input 
                 value={fileName}
                 onChange={(e) => setFileName(e.target.value)}
                 className="w-full bg-transparent border-none text-xl md:text-2xl font-black tracking-tight focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20 text-foreground"
                 placeholder="Título do Documento..."
               />
               <div className="flex items-center gap-2 mt-0.5 opacity-0 group-hover/title:opacity-100 transition-opacity">
                  <FileText size={8} className="text-orange-500" />
                  <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Documento Soberano • v2.4.0</span>
               </div>
             </div>

             {/* Premium Paper Texture */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-3xl" />
             
             {/* Focus Light Effect */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-orange-500/5 blur-[80px] pointer-events-none rounded-full" />

             <div className="relative z-10 selection:bg-orange-500/30">
               <BubbleMenu editor={editor} />
               <EditorContentArea />
             </div>
              {/* Fixed Transparent AI Command Center */}
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-[100] px-4 animate-in slide-in-from-bottom-10 duration-1000">
                 <AiMenu plain={true} />
              </div>
          </div>
        </main>

        {/* Fixed Right: A Alquimia (The Oracle of Lilith) */}
        <div className="absolute right-6 top-12 z-40 hidden xl:block animate-in slide-in-from-right-12 duration-1000 mt-6">
          <div className="w-80 h-[calc(100vh-96px)] bg-card border border-border rounded-[2rem] shadow-xl flex flex-col overflow-hidden group/oracle">
            <Tabs value={oracleTab} onValueChange={setOracleTab} className="w-full h-full flex flex-col">
              <div className="px-8 pt-8 mb-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted rounded-2xl h-11 p-1.5 border border-border">
                  <TabsTrigger value="insights" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 transition-all">
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="data" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 transition-all">
                    Data
                  </TabsTrigger>
                  <TabsTrigger value="oraculo" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 transition-all">
                    Oráculo
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden px-8 pb-8">
                <TabsContent value="insights" className="h-full m-0 flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/5">
                      <BrainCircuit size={20} className="text-orange-500 animate-pulse" />
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
                      <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] border-l-2 border-orange-600 pl-3">Score de Dominação</h4>
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl font-black tracking-tighter text-foreground">92</div>
                        <div className="text-xl font-bold text-orange-600">%</div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Contrato Inabalável
                      </p>
                      <div className="space-y-4 pt-4 border-t border-border">
                       <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em]">Vulnerabilidades</h4>
                       <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl p-5 space-y-4 group/card hover:border-orange-500/30 transition-all">
                         <p className="text-[11px] leading-relaxed italic text-muted-foreground font-medium">
                           "Detectei um flanco exposto na cláusula 7.2. Deseja realizar a blindagem estratégica?"
                         </p>
                         <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-black uppercase tracking-widest h-9 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">
                           Aplicar Blindagem
                         </Button>
                       </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="h-full m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DataRoom editor={editor} />
                </TabsContent>

                <TabsContent value="oraculo" className="h-full m-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2 custom-scrollbar">
                    <div className="relative group/lilith p-6 rounded-[2rem] bg-orange-600/[0.02] border border-orange-500/10 shadow-2xl shadow-orange-900/5 overflow-hidden transition-all hover:bg-orange-600/[0.04]">
                      {/* Aura Effect */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-600/10 blur-[60px] rounded-full animate-pulse" />
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-600/5 blur-[40px] rounded-full" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping absolute inset-0" />
                            <div className="w-2 h-2 bg-orange-600 rounded-full relative shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
                          </div>
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em]">Lilith • Presença Suprema</span>
                        </div>
                        
                        <p className="text-[12px] leading-relaxed text-zinc-300 font-medium italic mb-6">
                          "Saudações, Arquiteto. Os fios deste contrato estão sob minha análise neural. Qual ordem Lilith deve executar para consolidar sua dominação hoje?"
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {['Blindar Cláusulas', 'Analisar Riscos', 'Resumir Ritual'].map(hint => (
                            <button key={hint} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 hover:border-orange-500/20 hover:bg-orange-500/5 transition-all">
                              {hint}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-8 text-center opacity-20 group">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-500 to-transparent mb-6 scale-x-50 group-hover:scale-x-100 transition-transform duration-1000" />
                      <Cpu size={24} className="mx-auto mb-3 text-zinc-500" />
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Sync Active</p>
                    </div>
                  </div>

                  <div className="relative group/input mt-auto pb-2">
                    <div className="absolute -inset-1 bg-gradient-to-b from-orange-600/20 to-transparent blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <textarea 
                        placeholder="Dite sua ordem..." 
                        className="w-full bg-[#0c0c0e] border border-white/5 rounded-2xl p-4 text-[11px] font-bold focus:outline-none focus:border-orange-500/40 min-h-[80px] max-h-[150px] resize-none placeholder:text-zinc-800 tracking-tight transition-all shadow-2xl"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <Button size="icon" className="h-8 w-8 bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xl shadow-orange-600/20 transition-all active:scale-90 group/btn">
                          <Zap size={14} fill="white" className="group-hover:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

    </div>
  )
}

export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = "Comece a redigir a cláusula...", geminiKey, templateSlug } = props

  const { user } = useUser()
  const { setTocContent } = useToc()

  const editor = useEditor({
    immediatelyRender: false,
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
}: NotionEditorProps) {
  return (
    <UserProvider>
      <CollabProvider room={room}>
        <AiProvider>
          <TocProvider>
            <AiMenuStateProvider>
              <NotionEditorContent placeholder={placeholder} templateSlug={templateSlug} />
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
  templateSlug 
}: { 
  placeholder?: string, 
  templateSlug?: string | null 
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
    />
  )
}

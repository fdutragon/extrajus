"use client"

import { useContext, useEffect, useMemo } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import type { Doc as YDoc } from "yjs"
import { createPortal } from "react-dom"
import { SupabaseYjsProvider } from "../../../lib/supabase-yjs-provider"
import { Gemini } from "../../../components/tiptap-extension/gemini-ai-extension"

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
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "../../../components/tiptap-ui-primitive/separator"
import { ThemeToggle } from "../../../components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"
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
import {
  TocProvider,
  useToc,
} from "../../../components/tiptap-node/toc-node/context/toc-context"
import { ListNormalizationExtension } from "../../../components/tiptap-extension/list-normalization-extension"
import { Indent } from "../../../components/tiptap-extension/indent-extension"

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



export interface NotionEditorProps {
  room: string
  placeholder?: string
}

export interface EditorProviderProps {
  provider: SupabaseYjsProvider
  ydoc: YDoc
  placeholder?: string
  geminiKey: string | null
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Conectando..." }: { text?: string }) {
  return (
    <div className="spinner-container">
      <div className="spinner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="spinner-loading-text">{text}</div>
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
      className="notion-like-editor-content"
      style={{
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      <DragContextMenu />
      <AiMenu />
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
  const { state, updateState } = useAiMenuState()
  const { editor } = useContext(EditorContext)!
  const { provider, room } = useCollab()

  return (
    <div className="flex flex-col h-screen bg-[#f8f8f8] dark:bg-[#020203] text-zinc-900 dark:text-zinc-100 overflow-hidden relative font-sans selection:bg-orange-500/30">
      
      {/* Sovereign Header - The Command Monolith */}
      <header className="fixed top-0 left-0 w-full h-12 border-b border-zinc-200/50 dark:border-white/[0.03] bg-white/60 dark:bg-black/60 backdrop-blur-2xl flex items-center justify-between px-6 z-[100] transition-all duration-500 hover:bg-white/80 dark:hover:bg-black/80 group">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all duration-300 group/back">
              <ChevronLeft size={18} className="group-hover/back:-translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 group/brand cursor-default">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.3)] group-hover/brand:drop-shadow-[0_0_15px_rgba(234,88,12,0.6)] transition-all">ExtraJus</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-40">Cânone v2</span>
            </div>
          </div>
        </div>

        {/* Neural Action Center: Symmetrical Command Bridge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8 z-[110]">
          
          {/* Left Wing: Structure & Weight */}
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <TurnIntoDropdown hideWhenUnavailable={true} showText={false} />
            <div className="h-4 w-px bg-zinc-200/50 dark:bg-white/[0.05] mx-1" />
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
            <ResetAllFormattingButton />
          </div>

          {/* The AI Heart: Absolute Center (Standardized Layout, Unique Color) */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-auto px-3 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 rounded-xl transition-all duration-500 group/ai relative overflow-hidden border border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)] gap-2"
            onClick={() => {
              if (editor) {
                ;(editor.chain().focus() as any).aiGenerationShow().run()
                updateState({ isOpen: true })
              }
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">IA</span>
            <BrainCircuit size={16} className="group-hover/ai:scale-110 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover/ai:opacity-100 transition-opacity" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-orange-600 rounded-full blur-[2px] opacity-40 animate-pulse" />
          </Button>

          {/* Right Wing: Refinement & Style */}
          <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <ListButton type="bulletList" />
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
            <div className="h-4 w-px bg-zinc-200/50 dark:bg-white/[0.05] mx-1" />
            <LinkPopover autoOpenOnLinkActive={false} orientation="horizontal" />
            <ColorTextPopover orientation="horizontal" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-zinc-200/50 dark:border-white/[0.05]">
            <InviteButton room={room || ""} />
            <CollaborationUsers />
            <ThemeToggle />
          </div>
          <SignModal />
        </div>
      </header>

      <div className="flex-1 flex pt-12 relative overflow-hidden">
        
        {/* Fixed Left: O Códice (The War Library) */}
        <div className="absolute left-6 top-12 z-40 hidden lg:block animate-in slide-in-from-left-12 duration-1000 mt-6">
          <div className="w-72 h-[calc(100vh-96px)] bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/[0.05] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col group/library">
            
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
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Biblioteca</h3>
                  <p className="text-[8px] font-bold text-orange-500/60 uppercase tracking-widest">Arsenal Ativo</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden px-4">
              <ScrollArea className="h-full pr-4 custom-scrollbar">
                <div className="space-y-8 py-4 px-2">
                  {[
                    { title: 'Protocolos de Elite', items: ['Contrato de Guerra', 'NDA Soberano', 'Acordo de Cúpula'], icon: '🛡️' },
                    { title: 'Cláusulas Seladas', items: ['Sigilo Absoluto', 'Exclusividade Brutal', 'Foro de Dominação'], icon: '⚖️' },
                    { title: 'Jurisprudência', items: ['Súmulas de Poder', 'Precedentes M&A'], icon: '📖' }
                  ].map(cat => (
                    <div key={cat.title} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-white/[0.05] pb-2">
                        <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em]">{cat.title}</p>
                        <span className="text-[10px] grayscale opacity-50">{cat.icon}</span>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map(item => (
                          <button key={item} className="w-full text-left text-[11px] py-2.5 px-3 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all duration-300 group/item flex items-center justify-between font-bold text-zinc-600 dark:text-zinc-400">
                            <span className="truncate">{item}</span>
                            <Zap size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-orange-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="p-6 mt-auto bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-200/50 dark:border-white/[0.05]">
               <Button variant="ghost" className="w-full justify-center text-[10px] font-black uppercase tracking-widest h-10 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl transition-all text-zinc-500">
                 <Settings2 size={14} className="mr-2" /> Arsenal Config
               </Button>
            </div>
          </div>
        </div>

        {/* Central Sanctuary - The Infinite Paper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-transparent flex justify-center pt-6 pb-32 px-4 relative z-10">
          <div className="w-full max-w-[880px] h-fit min-h-[1123px] bg-white dark:bg-[#08080a] shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-zinc-200/50 dark:border-white/[0.05] rounded-3xl p-20 md:pt-16 md:pb-40 md:px-32 relative animate-in fade-in zoom-in-95 duration-1000">
             
             {/* Premium Paper Texture */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-3xl" />
             
             {/* Focus Light Effect */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-orange-500/5 blur-[80px] pointer-events-none rounded-full" />

             <div className="relative z-10 selection:bg-orange-500/30">
               <EditorContentArea />
             </div>
          </div>
        </main>

        {/* Fixed Right: A Alquimia (The Oracle of Lilith) */}
        <div className="absolute right-6 top-12 z-40 hidden xl:block animate-in slide-in-from-right-12 duration-1000 mt-6">
          <div className="w-72 h-[calc(100vh-96px)] bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/[0.05] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden group/oracle">
            <Tabs value={oracleTab} onValueChange={setOracleTab} className="w-full h-full flex flex-col">
              <div className="px-8 pt-8 mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-100 dark:bg-white/[0.03] rounded-2xl h-11 p-1.5 border border-zinc-200/50 dark:border-white/[0.05]">
                  <TabsTrigger value="insights" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/20 transition-all">
                    Insights
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
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Alquimia AI</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Sincronizada</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] border-l-2 border-orange-600 pl-3">Score de Dominação</h4>
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl font-black tracking-tighter text-zinc-800 dark:text-white">92</div>
                        <div className="text-xl font-bold text-orange-600">%</div>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="w-[92%] h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Contrato Inabalável
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-200/50 dark:border-white/[0.05]">
                       <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em]">Vulnerabilidades</h4>
                       <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl p-5 space-y-4 group/card hover:border-orange-500/30 transition-all">
                         <p className="text-[11px] leading-relaxed italic text-zinc-600 dark:text-zinc-400 font-medium">
                           "Detectei um flanco exposto na cláusula 7.2. Deseja realizar a blindagem estratégica?"
                         </p>
                         <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-black uppercase tracking-widest h-9 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">
                           Blindar Agora
                         </Button>
                       </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="oraculo" className="h-full m-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 custom-scrollbar">
                    <div className="bg-zinc-100/50 dark:bg-white/[0.03] rounded-2xl p-5 border border-zinc-200/50 dark:border-white/[0.05] relative group/msg">
                      <div className="absolute -left-1 top-4 w-2 h-2 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.5)]" />
                      <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
                        Saudações, Arquiteto. Os padrões deste contrato estão sob minha análise. Qual ordem Lilith deve executar hoje?
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="w-4 h-px bg-orange-500/30" />
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Lilith • Presença Ativa</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative group/input">
                    <textarea 
                      placeholder="Dite sua ordem suprema..." 
                      className="w-full bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.05] rounded-2xl p-4 text-[11px] focus:outline-none focus:border-orange-500/40 min-h-[100px] resize-none placeholder:text-zinc-500 font-medium transition-all group-hover/input:border-orange-500/20"
                    />
                    <Button size="icon" className="absolute bottom-4 right-4 h-8 w-8 bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-90">
                      <Zap size={16} fill="white" />
                    </Button>
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
  const { provider, ydoc, placeholder = "Comece a redigir a cláusula...", geminiKey } = props

  const { user } = useUser()
  const { setTocContent } = useToc()

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "notion-like-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
        link: { openOnClick: false },
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
    ],
  })

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
}: NotionEditorProps) {
  return (
    <UserProvider>
      <CollabProvider room={room}>
        <AiProvider>
          <TocProvider>
            <AiMenuStateProvider>
              <NotionEditorContent placeholder={placeholder} />
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
export function NotionEditorContent({ placeholder }: { placeholder?: string }) {
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
    />
  )
}

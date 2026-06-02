"use client"

import { useCallback, useState, useEffect, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useCollab } from "../../../../contexts/collab-context"
// Tiptap Core Extensions
import type { Tone } from "../../../../components/tiptap-extension/gemini-ai-extension"

// Icons
import { MicAiIcon } from "../../../../components/tiptap-icons/mic-ai-icon"
import { AiSparklesIcon } from "../../../../components/tiptap-icons/ai-sparkles-icon"
import { BrainCircuit, StopCircle as StopCircle2Icon, ArrowUp as ArrowUpIcon, Mic, MicOff, Search, FileText, ChevronDown, X, Cloud } from "lucide-react"

// UI Components
import { SUPPORTED_TONES } from "../../../../components/tiptap-ui/ai-menu"

// UI Primitives
import { Button } from "../../../../components/tiptap-ui-primitive/button"
import { Spacer } from "../../../../components/tiptap-ui-primitive/spacer"
import { Toolbar, ToolbarGroup } from "../../../../components/tiptap-ui-primitive/toolbar"
import { useComboboxValueState } from "../../../../components/tiptap-ui-primitive/menu"
import { Combobox } from "../../../../components/tiptap-ui-primitive/combobox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/tiptap-ui-primitive/dropdown-menu"
import { TextareaAutosize } from "../../../../components/tiptap-ui-primitive/textarea-autosize"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import {
  useBlurHandler,
  useKeyboardHandlers,
} from "../../../../components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input-hooks"
import { useAiMenuState } from "../../../../components/tiptap-ui/ai-menu/ai-menu-hooks"
import { useTiptapEditor } from "../../../../hooks/use-tiptap-editor"
import type { AiMenuInputTextareaProps } from "../../../../components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input-types"

// Styles
import "../../../../components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input.scss"

const CONTRACT_TYPES = [
  "Prestação de Serviços", "Compra e Venda", "Aluguel Residencial", "Aluguel Comercial",
  "Confidencialidade (NDA)", "Trabalho (CLT)", "Parceria Comercial", "Empréstimo (Mútuo)",
  "Consultoria", "Honorários Advocatícios", "Software (SaaS)", "Licenciamento de Marca",
  "Franquia", "Comodato", "Doação", "Arrendamento Rural", "Representação Comercial",
  "Distribuição", "Corretagem", "Fiança", "Transporte de Cargas", "Empreitada",
  "Sociedade Limitada", "Acordo de Sócios", "Vestimento (Vesting)", "Mútuo Conversível",
  "Termo de Uso (Site)", "Política de Privacidade", "Cessão de Direitos", "Permuta",
  "Consignação", "Agenciamento", "Hospedagem", "Eventos", "Publicidade",
  "Patrocínio", "Terceirização", "Manutenção", "Seguro", "Arrendamento Mercantil",
  "Depósito", "Mandato (Procuração)", "Transação (Acordo)", "Parceria Agrícola",
  "Cessão de Imagem", "Direitos Autorais", "Franchising", "Leasing", "Factoring"
]

const cleanContractName = (name: string | null) => {
  if (!name) return "MODELOS DE CONTRATO"
  return name
    .replace(/(contrato de |minuta de |contrato |minuta )/gi, "")
    .trim()
}

export function ContractTypeSelector({
  onSelect,
  selectedType = null,
}: {
  onSelect: (type: string) => void
  selectedType?: string | null
}) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const { editor } = useTiptapEditor()

  useEffect(() => {
    // Função unificada de detecção de PWA
    const checkInstallation = () => {
      if (typeof window === "undefined") return false
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      const isNavStandalone = (window.navigator as any).standalone === true
      const isReferrerPwa = document.referrer.includes('android-app://') // Android TWA detection
      
      return isStandalone || isNavStandalone || isReferrerPwa
    }

    // Verifica estado inicial imediatamente
    setIsInstalled(checkInstallation())

    const handleStatusChange = (e: any) => {
      setIsInstalled(!!e.detail?.installed || checkInstallation())
    }

    // Listener para mudanças dinâmicas e evento customizado
    window.addEventListener("pwa-installed-status-changed", handleStatusChange)
    
    // Adiciona listener para mudança de display-mode (caso o usuário instale sem fechar)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener("pwa-installed-status-changed", handleStatusChange)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  const isSearching = search.trim().length > 0
  const filtered = CONTRACT_TYPES.filter(type => 
    type.toLowerCase().includes(search.toLowerCase())
  )
  const displayedTypes = isSearching ? filtered : filtered.slice(0, 4)

  const isEditing = editor && !editor.isEmpty

  const handleSaveClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault()
      e.stopPropagation()
      
      if (isInstalled) {
        toast.success("Seu progresso está sendo sincronizado no armazenamento local e na nuvem.", {
          icon: <Cloud className="w-4 h-4 text-emerald-500" />,
          duration: 3000
        })
        return
      }

      // Abre o modal personalizado de instalação (funciona em mobile e pc)
      window.dispatchEvent(new CustomEvent("open-pwa-modal"))
      return
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isEditing && setIsOpen(open)}>
      <DialogTrigger 
        render={
          <Button
            type="button"
            variant="ghost"
            onClick={handleSaveClick}
            className={cn(
              "h-7 md:h-9 px-0 pl-2.5 md:pl-4 gap-2 transition-all duration-500 hover:bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent [-webkit-tap-highlight-color:transparent] flex items-center",
              isEditing ? "opacity-100" : "text-primary hover:opacity-80"
            )}
          />
        }
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          {isEditing && (
            <div className={cn(
              "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 transition-all duration-500",
              isInstalled ? "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.4)]" : "bg-zinc-600 animate-pulse shadow-[0_0_8px_rgba(113,113,122,0.4)]"
            )} />
          )}
          <span className={cn(
            "text-[8.5px] md:text-[11px] font-black tracking-[0.15em] uppercase transition-colors duration-500",
            isEditing 
              ? "text-zinc-500 dark:text-zinc-500" 
              : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-400"
          )}>
            {isEditing 
              ? (isInstalled ? "CONTRATO SALVO" : "SALVAR CONTRATO") 
              : cleanContractName(selectedType).toUpperCase()
            }
          </span>
          {!isEditing && <ChevronDown className="w-3 h-3 md:w-4 md:h-4 opacity-30 shrink-0" />}
        </div>
      </DialogTrigger>

      <DialogContent 
        showCloseButton={false} 
        className="inset-x-0 mx-auto w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden bg-popover border-border shadow-2xl z-[100000] top-[15%] translate-y-0 sm:top-1/2 sm:-translate-y-1/2"
      >
        <div className="p-2.5 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {/* Honeypot hidden inputs to trick browser autofill */}
            <input style={{ display: 'none' }} aria-hidden="true" type="text" name="fake-email-ai" />
            <input style={{ display: 'none' }} aria-hidden="true" type="password" name="fake-password-ai" />
            <input 
              type="search"
              role="searchbox"
              name="contract-search-field-no-autofill"
              id="contract-search-field-no-autofill"
              placeholder="Buscar contrato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              className="w-full bg-background border border-input rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
          </div>
        </div>
        <div className="max-h-[280px] sm:max-h-[360px] overflow-y-auto p-0 scrollbar-minimalist relative">
          {displayedTypes.length > 0 ? (
            <>
              {displayedTypes.map((type) => {
                const isSelected = selectedType === type
                return (
                  <button 
                    key={type}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 rounded-none first:pt-2 last:pb-2 cursor-pointer group transition-colors text-left [-webkit-tap-highlight-color:transparent]",
                      isSelected 
                        ? "bg-primary/10 text-primary border-l-2 border-primary" 
                        : "hover:bg-muted focus:bg-muted hover:text-primary active:bg-transparent focus:bg-transparent"
                    )}
                    onClick={() => {
                      onSelect(type)
                      setIsOpen(false)
                      setSearch("")
                    }}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors shrink-0",
                      isSelected ? "bg-primary" : "bg-primary/40 group-hover:bg-primary"
                    )} />
                    <span className={cn(
                      "text-[13px] sm:text-[12px] font-medium truncate uppercase tracking-tight transition-colors",
                      isSelected ? "text-primary" : "text-foreground/80 dark:text-zinc-300 group-hover:text-primary"
                    )}>{type}</span>
                  </button>
                )
              })}
              <div className="h-2 shrink-0"></div>
              {!isSearching && (
                <div className="sm:sticky sm:bottom-0 sm:z-10 p-3 pb-4 text-center border-t border-border bg-popover/95 backdrop-blur-sm">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary/90 dark:text-primary/70 uppercase">⚡ + 50 modelos de elite no acervo</span>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center">
              <span className="text-[11px] text-muted-foreground">Nenhum modelo encontrado.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AiMenuInputPlaceholder({
  onPlaceholderClick,
  placeholder,
}: {
  onPlaceholderClick?: () => void
  placeholder?: string
}) {
  return (
    <div
      className="tiptap-ai-prompt-input-placeholder"
      role="button"
      tabIndex={0}
      onClick={onPlaceholderClick}
    >
      <div className="tiptap-ai-prompt-input-placeholder-content pr-4 truncate">
        <span className="tiptap-ai-prompt-input-placeholder-text truncate block w-full">
          {placeholder || "Descreva os termos, dite o acordo por voz ou escolha um modelo pronto. Que documento vai blindar o seu negócio hoje?"}
        </span>
      </div>
      <Button data-style="primary" disabled className="h-7 w-7 rounded-lg p-0 flex items-center justify-center shrink-0">
        <ArrowUpIcon className="tiptap-button-icon w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

export function ToneSelector({
  tone,
  onToneChange,
}: {
  tone: Tone | null
  onToneChange: (tone: string) => void
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-active-state={tone ? "on" : "off"}
          role="button"
          tabIndex={-1}
          aria-label="Tone adjustment options"
        >
          <MicAiIcon className="tiptap-button-icon" />
          <span className="tiptap-button-text">Tone</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {SUPPORTED_TONES.map((supportedTone) => (
            <DropdownMenuItem key={supportedTone.value} asChild>
              <Button
                variant="ghost"
                data-active-state={tone === supportedTone.value ? "on" : "off"}
                onClick={() => onToneChange(supportedTone.value)}
              >
                <span className="tiptap-button-text">
                  {supportedTone.label}
                </span>
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AiPromptInputToolbar({
  showPlaceholder,
  onInputSubmit,
  onToneChange,
  isEmpty = false,
  isRecording = false,
  toggleRecording,
  hasMicSupport = false,
  selectedContractType = null,
  onContractTypeSelect,
}: {
  showPlaceholder?: boolean
  onInputSubmit: (prompt: string) => void
  onToneChange?: (tone: string) => void
  isEmpty?: boolean
  isRecording?: boolean
  toggleRecording?: () => void
  hasMicSupport?: boolean
  selectedContractType?: string | null
  onContractTypeSelect?: (type: string | null) => void
}) {
  const [tone, setTone] = useState<Tone | null>(null)
  const [promptValue] = useComboboxValueState()
  const { editor } = useTiptapEditor()

  const handleToneChange = useCallback(
    (newTone: string) => {
      setTone(newTone as Tone)
      onToneChange?.(newTone)
    },
    [onToneChange]
  )

  const handleSubmit = useCallback(() => {
    onInputSubmit(promptValue)
  }, [onInputSubmit, promptValue])

  const isEditorEmpty = !editor || editor.isEmpty

  return (
    <Toolbar
      variant="floating"
      data-plain="true"
      className="tiptap-ai-prompt-input-toolbar pt-2"
      style={{ display: showPlaceholder ? "none" : "flex" }}
    >
      <ToolbarGroup className="flex items-center gap-2">
        <ContractTypeSelector 
          selectedType={selectedContractType}
          onSelect={(type) => {
            onContractTypeSelect?.(type)
          }} 
        />
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup className="!gap-2 flex items-center">
        {hasMicSupport && (
          <Button
            type="button"
            onClick={toggleRecording}
            variant="ghost"
            className={cn(
              "h-7 w-7 rounded-lg p-0 flex items-center justify-center shrink-0 transition-all duration-300 border border-transparent",
              isRecording 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 animate-pulse" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary animate-pulse"
            )}
            aria-label="Gravar áudio"
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isEmpty || isRecording}
          data-style={isEmpty || isRecording ? "disabled" : "primary"}
          aria-label="Submit prompt"
          className={cn(
            "h-9 rounded-full p-0 flex items-center justify-center shrink-0 transition-all duration-500 shadow-md",
            isEmpty || isRecording
              ? "w-9 opacity-60 scale-90 bg-zinc-200 dark:bg-muted text-zinc-600 dark:text-muted-foreground pointer-events-none"
              : "w-12 bg-primary text-primary-foreground hover:scale-105 active:scale-95 hover:shadow-lg"
          )}
        >
          <ArrowUpIcon className={cn(
            "tiptap-button-icon transition-all duration-500",
            isEmpty || isRecording ? "w-3.5 h-3.5 stroke-[2]" : "w-4.5 h-4.5 stroke-[2.5]"
          )} />
        </Button>
      </ToolbarGroup>
    </Toolbar>
  )
}

function mergeTranscripts(parts: string[]): string {
  if (parts.length === 0) return ""
  let merged = parts[0].trim()

  for (let i = 1; i < parts.length; i++) {
    const next = parts[i].trim()
    if (!next) continue

    if (next.toLowerCase().startsWith(merged.toLowerCase())) {
      merged = next
      continue
    }

    if (merged.toLowerCase().includes(next.toLowerCase())) {
      continue
    }

    const mergedWords = merged.split(/\s+/)
    const nextWords = next.split(/\s+/)
    let overlapCount = 0

    const maxOverlap = Math.min(mergedWords.length, nextWords.length)
    for (let o = 1; o <= maxOverlap; o++) {
      const suffix = mergedWords.slice(-o).join(" ").toLowerCase()
      const prefix = nextWords.slice(0, o).join(" ").toLowerCase()
      if (suffix === prefix) {
        overlapCount = o
      }
    }

    if (overlapCount > 0) {
      const nonOverlapping = nextWords.slice(overlapCount).join(" ")
      merged = `${merged} ${nonOverlapping}`.trim()
    } else {
      merged = `${merged} ${next}`.trim()
    }
  }

  return merged
}

export function AiMenuInputTextarea({
  onInputSubmit,
  onToneChange,
  onClose,
  onStop,
  onInputFocus,
  onInputBlur,
  onEmptyBlur,
  onPlaceholderClick,
  showPlaceholder = false,
  isLoading = false,
  placeholder = "Descreva os termos, dite o acordo por voz ou escolha um modelo pronto. Que documento vai blindar o seu negócio hoje?",
  autoFocus = true,
  isEditing = false,
  ...props
}: AiMenuInputTextareaProps) {
  const [promptValue, setPromptValue] = useComboboxValueState()
  const { state, updateState } = useAiMenuState()
  const selectedContractType = state.selectedContractType
  
  const setSelectedContractType = useCallback((type: string | null) => {
    updateState({ selectedContractType: type })
  }, [updateState])

  const [isFocused, setIsFocused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingFlash, setRecordingFlash] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  
  const promptRef = useRef(promptValue)
  const recordingStartTextRef = useRef("")
  
  useEffect(() => {
    promptRef.current = promptValue
  }, [promptValue])

  useEffect(() => {
    if (isRecording) {
      setRecordingFlash(true)
      const timer = setTimeout(() => {
        setRecordingFlash(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setRecordingFlash(false)
    }
  }, [isRecording])

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = "pt-BR"

      rec.onresult = (event: any) => {
        const parts: string[] = []
        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
          if (transcript && transcript.trim()) {
            parts.push(transcript.trim())
          }
        }
        const totalTranscript = mergeTranscripts(parts)
        const baseText = recordingStartTextRef.current || ""
        const newVal = baseText ? `${baseText.trim()} ${totalTranscript}` : totalTranscript
        setPromptValue(newVal)
      }

      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error)
        setIsRecording(false)
        if (event.error === "not-allowed") {
          toast.error("Permissão de microfone negada. Ative nas configurações do navegador.")
        } else {
          toast.error("Erro ao transcrever áudio. Tente novamente.")
        }
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      setRecognition(rec)
    }
  }, [setPromptValue])

  const toggleRecording = useCallback(() => {
    if (!recognition) {
      toast.error("Gravação de áudio não é suportada neste navegador.")
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      try {
        recordingStartTextRef.current = promptRef.current || ""
        recognition.start()
        setIsRecording(true)
      } catch (err) {
        console.error(err)
        setIsRecording(false)
      }
    }
  }, [recognition, isRecording])

  const { editor } = useTiptapEditor()

  const handleSubmit = useCallback(() => {
    const cleanedPrompt = promptValue?.trim()
    
    if (cleanedPrompt || selectedContractType) {
      const isEditorEmpty = !editor || editor.isEmpty

      let finalPrompt = ""

      if (isEditorEmpty && selectedContractType) {
        // Modo Criação Inicial: O documento está vazio e um modelo foi selecionado.
        finalPrompt = `Crie um ${selectedContractType} profissional com todas as cláusulas essenciais, considerando os seguintes detalhes adicionais: ${cleanedPrompt || 'Sem detalhes adicionais.'}`
      } else {
        // Modo Edição Cirúrgica: O documento já tem conteúdo (o usuário está editando um bloco ou adicionando texto).
        // Aqui nós ignoramos o selectedContractType para não recriar o contrato do zero.
        finalPrompt = cleanedPrompt || ""
      }
        
      if (finalPrompt) {
        onInputSubmit(finalPrompt)
        setPromptValue("")
      }
    }
  }, [onInputSubmit, promptValue, setPromptValue, selectedContractType, editor])

  const handleKeyDown = useKeyboardHandlers(promptValue, onClose, handleSubmit)

  const handleBlur = useBlurHandler(
    promptValue.trim() === "" && !selectedContractType,
    onInputBlur,
    onEmptyBlur
  )

  const handleOnPlaceholderClick = useCallback(() => {
    if (onPlaceholderClick) {
      onPlaceholderClick()
    }
  }, [onPlaceholderClick])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (onInputFocus) {
      onInputFocus()
    }
  }, [onInputFocus])

  const handleTextareaBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      handleBlur(e)
    },
    [handleBlur]
  )

  const { provider } = useCollab()
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

  const getPlaceholder = () => {
    if (!isSynced) return "Sincronizando ambiente da inteligência artificial..."
    if (isRecording) return "Gravando áudio... Fale os termos do acordo e a IA redigirá o contrato em tempo real."
    if (isEditing) return "Escreva o que você deseja alterar, complementar ou remover nas cláusulas..."
    
    if (selectedContractType) {
      const type = selectedContractType.toLowerCase()
      if (type.includes("prestação de serviços") || type.includes("empreitada") || type.includes("consultoria")) {
        return `Descreva o serviço, prazos, valor e forma de pagamento para ${selectedContractType}...`
      }
      if (type.includes("compra e venda") || type.includes("permuta")) {
        return `Qual o bem (imóvel, veículo, produto), valor e condições de entrega?`
      }
      if (type.includes("aluguel") || type.includes("arrendamento") || type.includes("comodato")) {
        return `Descreva o imóvel/bem, valor do aluguel, prazo e garantias (caução, fiador)...`
      }
      if (type.includes("confidencialidade") || type.includes("nda")) {
        return `Qual projeto ou informação será protegida? Há multa por vazamento?`
      }
      if (type.includes("trabalho") || type.includes("clt")) {
        return `Qual o cargo, salário, carga horária e local de trabalho?`
      }
      if (type.includes("sociedade") || type.includes("acordo de sócios") || type.includes("parceria")) {
        return `Qual o objetivo da parceria, investimento e como os lucros serão divididos?`
      }
      if (type.includes("empréstimo") || type.includes("mútuo")) {
        return `Qual o valor emprestado, taxa de juros, prazo e forma de pagamento?`
      }
      if (type.includes("licenciamento") || type.includes("franquia") || type.includes("direitos autorais")) {
        return `Descreva a marca/obra, limites de uso (território, prazo) e royalties...`
      }
      return `Adicione os detalhes essenciais para o seu ${selectedContractType} (ex: objeto, valores, prazos)...`
    }
    
    return "Descreva os termos, dite o acordo por voz ou escolha um modelo pronto. Que documento vai blindar o seu negócio hoje?"
  }

  const dynamicPlaceholder = getPlaceholder()

  return (
    <div
      className={cn(
        "tiptap-ai-prompt-input transition-all duration-700",
        recordingFlash && "ring-2 ring-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.45)] border-amber-500/50 scale-[1.015] bg-amber-500/5"
      )}
      data-focused={isFocused}
      data-loading={isLoading}
      data-active-state={showPlaceholder || isLoading ? "off" : "on"}
      {...props}
    >
      <div className="tiptap-ai-prompt-input-inner flex flex-col w-full h-full">

        {isLoading ? (
          <div className="flex items-center justify-between w-full px-[1rem] py-[0.65rem] bg-primary/5 rounded-xl border border-primary/10 animate-pulse-subtle">
            <div className="flex items-center gap-[0.6rem]">
               <BrainCircuit className="text-primary animate-spin duration-[3000ms] shrink-0" style={{ width: '0.9rem', height: '0.9rem' }} />
               <span className="text-[0.72rem] font-semibold text-primary leading-none">A inteligência artificial está processando seu comando...</span>
            </div>
            <Button variant="ghost" size="small" className="rounded-lg hover:bg-primary/10 text-primary shrink-0" style={{ width: '1.75rem', height: '1.75rem' }} onClick={onStop}>
              <StopCircle2Icon style={{ width: '0.875rem', height: '0.875rem' }} />
            </Button>
          </div>
        ) : showPlaceholder ? (
          <AiMenuInputPlaceholder onPlaceholderClick={handleOnPlaceholderClick} placeholder={dynamicPlaceholder} />
        ) : (
          <>
            <div className="relative w-full flex-1 flex flex-col">
              <div className="relative flex-1">
                {!promptValue && (
                  <div suppressHydrationWarning className="absolute inset-0 pointer-events-none px-[0.7rem] py-[0.55rem] max-sm:px-[0.7rem] max-sm:py-[0.55rem] flex items-start z-30 pr-[0.7rem]">
                    <span suppressHydrationWarning className="tiptap-ai-prompt-input-placeholder-text leading-[1.5] font-medium">
                      {dynamicPlaceholder}
                    </span>
                  </div>
                )}
                <Combobox
                  autoSelect={false}
                  autoFocus={autoFocus}
                  render={
                    <TextareaAutosize
                      onChange={(e) => setPromptValue(e.target.value)}
                      value={promptValue}
                      onKeyDown={handleKeyDown}
                      onFocus={handleFocus}
                      onBlur={handleTextareaBlur}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-form-type="other"
                      name="ai_prompt_input_field"
                      id="ai_prompt_input_field"
                      className={cn(
                        "tiptap-ai-prompt-input-content relative z-20",
                        "pt-[0.55rem]"
                      )}
                      placeholder=""
                      autoFocus={autoFocus}
                      style={{
                        display: showPlaceholder ? "none" : "flex",
                      }}
                    />
                  }
                />
              </div>
            </div>

            <AiPromptInputToolbar
              showPlaceholder={showPlaceholder}
              onInputSubmit={handleSubmit}
              onToneChange={onToneChange}
              isEmpty={!promptValue?.trim() && !selectedContractType}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              hasMicSupport={!!recognition}
              selectedContractType={selectedContractType}
              onContractTypeSelect={setSelectedContractType}
            />
          </>
        )}
      </div>
    </div>
  )
}

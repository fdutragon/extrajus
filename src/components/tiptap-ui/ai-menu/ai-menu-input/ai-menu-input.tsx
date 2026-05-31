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
import { BrainCircuit, StopCircle as StopCircle2Icon, ArrowUp as ArrowUpIcon, Mic, MicOff, Search, FileText, ChevronDown, X } from "lucide-react"

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

import {
  useBlurHandler,
  useKeyboardHandlers,
} from "../../../../components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input-hooks"
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

export function ContractTypeSelector({
  onSelect,
  selectedType = null,
}: {
  onSelect: (type: string) => void
  selectedType?: string | null
}) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filtered = CONTRACT_TYPES.filter(type => 
    type.toLowerCase().includes(search.toLowerCase())
  ).slice(0, search ? 10 : 4)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-7 px-2 gap-1.5 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all duration-300 max-w-[200px]"
        >
          <FileText className="w-3 h-3 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider truncate">
            {selectedType || "Modelos"}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-80 sm:w-96 p-0 overflow-hidden bg-zinc-950 border-zinc-800 shadow-2xl z-[3000]">
        <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              autoFocus
              placeholder="Buscar contrato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1 pb-4 scrollbar-minimalist">
          {filtered.length > 0 ? (
            filtered.map((type) => (
              <DropdownMenuItem 
                key={type}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-primary/10 focus:bg-primary/10 group transition-colors"
                onSelect={() => {
                  onSelect(type)
                  setIsOpen(false)
                  setSearch("")
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <span className="text-[12px] font-medium text-zinc-300 group-hover:text-primary">{type}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center">
              <span className="text-[11px] text-muted-foreground">Nenhum modelo encontrado.</span>
            </div>
          )}
        </div>
        {!search && CONTRACT_TYPES.length > 4 && (
          <div className="p-2 border-t border-zinc-800 bg-zinc-900/30 text-center">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Use a busca para ver mais modelos</span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
          {placeholder || "Digite instruções para criar seu contrato..."}
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
  onContractTypeSelect?: (type: string) => void
}) {
  const [tone, setTone] = useState<Tone | null>(null)
  const [promptValue] = useComboboxValueState()

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
              ? "w-9 opacity-35 scale-90 bg-muted text-muted-foreground pointer-events-none"
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
  placeholder = "Digite instruções para criar seu contrato...",
  autoFocus = true,
  isEditing = false,
  ...props
}: AiMenuInputTextareaProps) {
  const [promptValue, setPromptValue] = useComboboxValueState()
  const [selectedContractType, setSelectedContractType] = useState<string | null>(null)
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

  const handleSubmit = useCallback(() => {
    const cleanedPrompt = promptValue?.trim()
    if (cleanedPrompt || selectedContractType) {
      const finalPrompt = selectedContractType 
        ? `Crie um ${selectedContractType} profissional com todas as cláusulas essenciais, considerando os seguintes detalhes adicionais: ${cleanedPrompt || 'Sem detalhes adicionais.'}`
        : cleanedPrompt
        
      onInputSubmit(finalPrompt || "")
      setPromptValue("")
      setSelectedContractType(null)
    }
  }, [onInputSubmit, promptValue, setPromptValue, selectedContractType])

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

  const dynamicPlaceholder = !isSynced
    ? "Sincronizando ambiente da inteligência artificial..."
    : isRecording
    ? "Gravando áudio... Fale os termos do acordo e a IA redigirá o contrato em tempo real."
    : isEditing
    ? "Escreva o que você deseja alterar, complementar ou remover nas cláusulas do seu contrato..."
    : selectedContractType 
    ? "Adicione detalhes (ex: nomes, valores, prazos)..." 
    : "Qual contrato você deseja criar hoje? (ex: Prestação de Serviços, NDA) Descreva os detalhes do acordo...";

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



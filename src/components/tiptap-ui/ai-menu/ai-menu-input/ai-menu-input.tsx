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
import { BrainCircuit, StopCircle as StopCircle2Icon, ArrowUp as ArrowUpIcon, Mic, MicOff } from "lucide-react"

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
}: {
  showPlaceholder?: boolean
  onInputSubmit: (prompt: string) => void
  onToneChange?: (tone: string) => void
  isEmpty?: boolean
  isRecording?: boolean
  toggleRecording?: () => void
  hasMicSupport?: boolean
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
      <ToolbarGroup>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[8.5px] font-medium text-primary">IA Ativa</span>
        </div>
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup className="gap-1.5 flex items-center">
        {hasMicSupport && (
          <Button
            type="button"
            onClick={toggleRecording}
            variant="ghost"
            className={cn(
              "h-7 w-7 rounded-lg p-0 flex items-center justify-center shrink-0 transition-all duration-300 border",
              isRecording 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 animate-pulse" 
                : "text-amber-500 bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)] hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
            )}
            aria-label="Gravar áudio"
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isEmpty || isRecording}
          data-style="primary"
          aria-label="Submit prompt"
          className="h-7 w-7 rounded-lg p-0 flex items-center justify-center shrink-0"
        >
          <ArrowUpIcon className="tiptap-button-icon w-3.5 h-3.5" />
        </Button>
      </ToolbarGroup>
    </Toolbar>
  )
}

// Algoritmo de deduplicação e fusão de frases em tempo real.
// Evita repetições causadas pelo Chrome do Android que re-emite ou concatena frases inteiras nos índices de resultados subsequentes.
// Ele faz um merge inteligente de sobreposição de prefixo/sufixo tanto para Desktop quanto para Mobile.
function mergeTranscripts(parts: string[]): string {
  if (parts.length === 0) return ""
  let merged = parts[0].trim()

  for (let i = 1; i < parts.length; i++) {
    const next = parts[i].trim()
    if (!next) continue

    // Se o próximo bloco já começa com o acumulado, ele é o próprio acumulado atualizado (comum no Android)
    if (next.toLowerCase().startsWith(merged.toLowerCase())) {
      merged = next
      continue
    }

    // Se o acumulado já contém o próximo bloco por inteiro, ignora a duplicidade
    if (merged.toLowerCase().includes(next.toLowerCase())) {
      continue
    }

    // Busca sobreposições de palavras na junção (ex: "como vai tudo bem" + "tudo bem tudo ótimo")
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
      // Remove a sobreposição do início do próximo bloco e concatena
      const nonOverlapping = nextWords.slice(overlapCount).join(" ")
      merged = `${merged} ${nonOverlapping}`.trim()
    } else {
      // Sem sobreposição, simplesmente concatena com espaço
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
      }, 3000) // 3 segundos de destaque dourado/fogo místico
      return () => clearTimeout(timer)
    } else {
      setRecordingFlash(false)
    }
  }, [isRecording])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Configura o Web Speech API para transcrição nativa em tempo real
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = "pt-BR"

      rec.onresult = (event: any) => {
        const parts: string[] = []

        // Coleta todos os fragmentos brutos produzidos pelo motor de voz na sessão ativa
        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
          if (transcript && transcript.trim()) {
            parts.push(transcript.trim())
          }
        }

        // Consolida os fragmentos aplicando o algoritmo de fusão inteligente livre de duplicações
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
        // Captura o valor exato que já estava no prompt antes de começar a falar
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
    if (cleanedPrompt) {
      onInputSubmit(cleanedPrompt)
      setPromptValue("")
    }
  }, [onInputSubmit, promptValue, setPromptValue])

  const handleKeyDown = useKeyboardHandlers(promptValue, onClose, handleSubmit)

  const handleBlur = useBlurHandler(
    promptValue.trim() === "",
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

  const [isMaster, setIsMaster] = useState(false)
  
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

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(() => typeof window !== "undefined" ? window.localStorage.getItem("extrajus_ai_suggestion") : null)

  useEffect(() => {
    const handleSuggestionUpdate = () => {
      setAiSuggestion(window.localStorage.getItem("extrajus_ai_suggestion"))
    }
    window.addEventListener("ai-suggestion-updated", handleSuggestionUpdate)
    return () => window.removeEventListener("ai-suggestion-updated", handleSuggestionUpdate)
  }, [])

  const docType = (typeof window !== "undefined" ? localStorage.getItem("extrajus_ai_doc_type") : null) || "notificacao";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTipo = urlParams.get("tipo");
      if (urlTipo && ["contrato", "notificacao", "peticao"].includes(urlTipo)) {
        localStorage.setItem("extrajus_ai_doc_type", urlTipo);
      } else {
        localStorage.setItem("extrajus_ai_doc_type", "notificacao");
      }
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "felipedutra@outlook.com") {
        setIsMaster(true)
      }
    })
  }, [])

  const dynamicPlaceholder = !isSynced
    ? "Sincronizando ambiente da inteligência artificial..."
    : isRecording
    ? "Gravando áudio... Fale o que aconteceu e a IA transcreverá em tempo real."
    : isEditing
    ? "Escreva o que você deseja alterar, complementar ou remover na sua notificação..."
    : "Descreva o teor da sua notificação extrajudicial (ex: cobrança de débitos, desocupação de imóvel) e os fatos principais...";

  return (
    <div
      className={cn(
        "tiptap-ai-prompt-input transition-all duration-700",
        recordingFlash && "ring-2 ring-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.45)] border-amber-500/50 scale-[1.015] bg-amber-500/5"
      )}
      data-focused={isFocused}
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
            <div className="relative w-full flex-1">
              {!promptValue && (
                <div suppressHydrationWarning className="absolute inset-0 pointer-events-none px-[0.6rem] py-[0.45rem] max-sm:px-[0.9rem] max-sm:py-[0.8rem] flex items-start z-30 pr-[0.6rem]">
                   <span suppressHydrationWarning className="tiptap-ai-prompt-input-placeholder-text leading-[1.5] font-medium">
                     {dynamicPlaceholder}
                   </span>
                </div>
              )}
              <Combobox
                autoSelect="always"
                autoFocus={autoFocus}
                render={
                  <TextareaAutosize
                    onChange={(e) => setPromptValue(e.target.value)}
                    value={promptValue}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleTextareaBlur}
                    className="tiptap-ai-prompt-input-content relative z-20"
                    placeholder=""
                    autoFocus={autoFocus}
                    style={{
                      display: showPlaceholder ? "none" : "flex",
                    }}
                  />
                }
              />
            </div>

            <AiPromptInputToolbar
              showPlaceholder={showPlaceholder}
              onInputSubmit={handleSubmit}
              onToneChange={onToneChange}
              isEmpty={!promptValue?.trim()}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              hasMicSupport={!!recognition}
            />
          </>
        )}
      </div>
    </div>
  )
}

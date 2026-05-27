"use client"

import { useCallback, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useCollab } from "../../../../contexts/collab-context"
// Tiptap Core Extensions
import type { Tone } from "../../../../components/tiptap-extension/gemini-ai-extension"

// Icons
import { MicAiIcon } from "../../../../components/tiptap-icons/mic-ai-icon"
import { AiSparklesIcon } from "../../../../components/tiptap-icons/ai-sparkles-icon"
import { BrainCircuit, StopCircle as StopCircle2Icon, ArrowUp as ArrowUpIcon } from "lucide-react"

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
}: {
  showPlaceholder?: boolean
  onInputSubmit: (prompt: string) => void
  onToneChange?: (tone: string) => void
  isEmpty?: boolean
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
           <span className="text-[10px] font-medium text-primary">IA Ativa</span>
        </div>
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup>
        <Button
          onClick={handleSubmit}
          disabled={isEmpty}
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

  const docType = "contrato";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTipo = urlParams.get("tipo");
      if (urlTipo && ["contrato", "notificacao", "peticao"].includes(urlTipo)) {
        localStorage.setItem("extrajus_ai_doc_type", urlTipo);
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
    : isEditing
    ? "Escreva o que você deseja alterar, complementar ou remover..."
    : "Descreva o tipo de contrato que você precisa e liste as cláusulas ou obrigações especiais que deseja incluir...";

  return (
    <div
      className="tiptap-ai-prompt-input"
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
                <div suppressHydrationWarning className="absolute inset-0 pointer-events-none px-[0.6rem] py-[0.35rem] flex items-start z-30 pr-[0.6rem]">
                   <span suppressHydrationWarning className="tiptap-ai-prompt-input-placeholder-text leading-[1.4] font-medium">
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
            />
          </>
        )}
      </div>
    </div>
  )
}

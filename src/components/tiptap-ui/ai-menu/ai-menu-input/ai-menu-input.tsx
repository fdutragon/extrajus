"use client"

import { useCallback, useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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
}: {
  onPlaceholderClick: () => void
}) {
  return (
    <div
      className="tiptap-ai-prompt-input-placeholder"
      onClick={onPlaceholderClick}
    >
      <div className="tiptap-ai-prompt-input-placeholder-content">
        <AiSparklesIcon className="tiptap-ai-prompt-input-placeholder-icon" />
        <span className="tiptap-ai-prompt-input-placeholder-text">
          Digite instruções para criar seu contrato...
        </span>
      </div>
      <Button data-style="primary" disabled>
        <ArrowUpIcon className="tiptap-button-icon" />
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
      className="tiptap-ai-prompt-input-toolbar"
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
        >
          <ArrowUpIcon className="tiptap-button-icon" />
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
  const [docType, setDocType] = useState<string>("contrato")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("extrajus_ai_doc_type") || "contrato"
      setDocType(saved)
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "felipedutra@outlook.com") {
        setIsMaster(true)
      }
    })
  }, [])

  return (
    <div
      className="tiptap-ai-prompt-input flex flex-col"
      data-focused={isFocused}
      data-active-state={showPlaceholder || isLoading ? "off" : "on"}
      {...props}
    >
      {isMaster && !isLoading && !showPlaceholder && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 border border-border/60 rounded-xl mb-3.5 mt-0.5 self-center mx-auto select-none z-50">
          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mr-1.5">Foco IA:</span>
          {[
            { id: "contrato", label: "Contratos" },
            { id: "notificacao", label: "Notificações" },
            { id: "peticao", label: "Petições" }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                localStorage.setItem("extrajus_ai_doc_type", opt.id)
                setDocType(opt.id)
                toast.success(`💥 Foco da IA alterado para: ${opt.label}`)
              }}
              className={cn(
                "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all",
                docType === opt.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.2)] border border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-between w-full h-[3.25rem] px-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse-subtle">
          <div className="flex items-center gap-3">
             <BrainCircuit size={16} className="text-primary animate-spin duration-[3000ms]" />
             <span className="text-[11px] font-medium text-primary">A inteligência artificial está processando seu comando...</span>
          </div>
          <Button variant="ghost" size="small" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" onClick={onStop}>
            <StopCircle2Icon size={16} />
          </Button>
        </div>
      ) : showPlaceholder ? (
        <AiMenuInputPlaceholder onPlaceholderClick={handleOnPlaceholderClick} />
      ) : (
        <>
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
                className="tiptap-ai-prompt-input-content"
                placeholder={placeholder}
                autoFocus={autoFocus}
                style={{
                  display: showPlaceholder ? "none" : "flex",
                }}
              />
            }
          />

          <AiPromptInputToolbar
            showPlaceholder={showPlaceholder}
            onInputSubmit={handleSubmit}
            onToneChange={onToneChange}
            isEmpty={!promptValue?.trim()}
          />
        </>
      )}
    </div>
  )
}

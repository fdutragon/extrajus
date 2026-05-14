import type { Tone } from "../../../../components/tiptap-extension/gemini-ai-extension"

export interface BaseAiMenuInputProps {
  onInputSubmit: (value: string) => void
  onToneChange?: (tone: Tone) => void
  onClose?: () => void
  onInputFocus?: () => void
  onInputBlur?: () => void
  onEmptyBlur?: () => void
  showPlaceholder?: boolean
  onPlaceholderClick?: () => void
}

export interface AiMenuInputTextareaProps
  extends BaseAiMenuInputProps, Omit<React.ComponentProps<"div">, "style"> {
  placeholder?: string
}

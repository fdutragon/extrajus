export interface BaseAiMenuInputProps {
  onInputSubmit: (value: string) => void
  onToneChange?: (tone: string) => void
  onClose?: () => void
  onStop?: () => void
  onInputFocus?: () => void
  onInputBlur?: () => void
  onEmptyBlur?: () => void
  showPlaceholder?: boolean
  isLoading?: boolean
  onPlaceholderClick?: () => void
  autoFocus?: boolean
}

export interface AiMenuInputTextareaProps
  extends BaseAiMenuInputProps, Omit<React.ComponentProps<"div">, "style"> {
  placeholder?: string
}

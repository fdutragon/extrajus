import { Extension } from "@tiptap/core"

export interface UiState {
  aiGenerationIsSelection: boolean
  aiGenerationIsLoading: boolean
  aiGenerationActive: boolean
  aiGenerationHasMessage: boolean
  commentInputVisible: boolean
  lockDragHandle: boolean
  isDragging: boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiGenerationSetIsSelection: (value: boolean) => ReturnType
    aiGenerationSetIsLoading: (value: boolean) => ReturnType
    aiGenerationShow: () => ReturnType
    aiGenerationHide: () => ReturnType
    aiGenerationHasMessage: (value: boolean) => ReturnType

    commentInputShow: () => ReturnType
    commentInputHide: () => ReturnType

    setLockDragHandle: (value: boolean) => ReturnType

    resetUiState: () => ReturnType
    setIsDragging: (value: boolean) => ReturnType
  }

  interface Storage {
    uiState: UiState
  }
}

export const defaultUiState: UiState = {
  aiGenerationIsSelection: false,
  aiGenerationIsLoading: false,
  aiGenerationActive: false,
  aiGenerationHasMessage: false,
  commentInputVisible: false,
  lockDragHandle: false,
  isDragging: false,
} as const

export const UiState = Extension.create<UiState>({
  name: "uiState",

  addStorage() {
    return {
      uiState: { ...defaultUiState },
    }
  },

  addCommands() {
    const triggerUpdate = () => {
      this.editor.view.dispatch(this.editor.state.tr.setMeta("uiStateUpdate", true))
    }

    return {
      // AI Generation commands
      aiGenerationSetIsSelection: (value: boolean) => () => {
        this.storage.uiState.aiGenerationIsSelection = value
        triggerUpdate()
        return true
      },
      aiGenerationSetIsLoading: (value: boolean) => () => {
        this.storage.uiState.aiGenerationIsLoading = value
        triggerUpdate()
        return true
      },
      aiGenerationHasMessage: (value: boolean) => () => {
        this.storage.uiState.aiGenerationHasMessage = value
        triggerUpdate()
        return true
      },
      aiGenerationShow: () => () => {
        this.storage.uiState.aiGenerationActive = true
        triggerUpdate()
        return true
      },
      aiGenerationHide: () => () => {
        this.storage.uiState.aiGenerationActive = false
        triggerUpdate()
        return true
      },

      // Comment input commands
      commentInputShow: () => () => {
        this.storage.uiState.commentInputVisible = true
        triggerUpdate()
        return true
      },
      commentInputHide: () => () => {
        this.storage.uiState.commentInputVisible = false
        triggerUpdate()
        return true
      },

      // Drag handle commands
      setLockDragHandle: (value: boolean) => () => {
        this.storage.uiState.lockDragHandle = value
        triggerUpdate()
        return true
      },
      setIsDragging: (value: boolean) => () => {
        this.storage.uiState.isDragging = value
        triggerUpdate()
        return true
      },

      // Reset command
      resetUiState: () => () => {
        this.storage.uiState = { ...defaultUiState }
        triggerUpdate()
        return true
      },
    } as any
  },
})

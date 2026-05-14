"use client"

import { getUrlParam, GEMINI_API_KEY } from "../lib/tiptap-collab-utils"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AiContextValue = {
  geminiKey: string | null
  hasAi: boolean
  setupError: boolean
}

export const AiContext = createContext<AiContextValue>({
  hasAi: false,
  geminiKey: null,
  setupError: false,
})

export const AiConsumer = AiContext.Consumer
export const useAi = (): AiContextValue => {
  const context = useContext(AiContext)
  if (!context) {
    throw new Error("useAi must be used within an AiProvider")
  }
  return context
}

export const useAiToken = () => {
  const [geminiKey, setGeminiKey] = useState<string | null>(null)
  const [hasAi, setHasAi] = useState<boolean>(true)
  const [setupError, setSetupError] = useState<boolean>(false)

  useEffect(() => {
    const noAiParam = getUrlParam("noAi")
    setHasAi(parseInt(noAiParam || "0") !== 1)
  }, [])

  useEffect(() => {
    if (!hasAi) return

    if (!GEMINI_API_KEY) {
      setSetupError(true)
    } else {
      setGeminiKey(GEMINI_API_KEY)
    }
  }, [hasAi])

  return { geminiKey, hasAi, setupError }
}

export function AiProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { hasAi, geminiKey, setupError } = useAiToken()

  const value = useMemo<AiContextValue>(
    () => ({
      hasAi,
      geminiKey,
      setupError,
    }),
    [hasAi, geminiKey, setupError]
  )

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>
}

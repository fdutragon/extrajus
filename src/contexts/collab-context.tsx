"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Doc as YDoc } from "yjs"
import {
  getUrlParam,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "../lib/tiptap-collab-utils"
import { SupabaseYjsProvider } from "../lib/supabase-yjs-provider"

export type CollabContextValue = {
  provider: SupabaseYjsProvider | null
  ydoc: YDoc
  hasCollab: boolean
  setupError: boolean
}

export const CollabContext = createContext<CollabContextValue>({
  hasCollab: false,
  provider: null,
  ydoc: new YDoc(),
  setupError: false,
})

export const CollabConsumer = CollabContext.Consumer
export const useCollab = (): CollabContextValue => {
  const context = useContext(CollabContext)
  if (!context) {
    throw new Error("useCollab must be used within an CollabProvider")
  }
  return context
}

export const useCollaboration = (room: string) => {
  const [provider, setProvider] = useState<SupabaseYjsProvider | null>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [hasCollab, setHasCollab] = useState<boolean>(true)
  const [setupError, setSetupError] = useState<boolean>(false)
  const ydoc = useMemo(() => new YDoc(), [])

  useEffect(() => {
    const noCollabParam = getUrlParam("noCollab")
    setHasCollab(parseInt(noCollabParam || "0") !== 1)
  }, [])

  useEffect(() => {
    if (!hasCollab) return

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setSetupError(true)
      return
    }

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    setSupabase(client)
  }, [hasCollab])

  useEffect(() => {
    if (!hasCollab || !supabase) return

    const channelName = room ? `room:${room}` : "room:default"

    const newProvider = new SupabaseYjsProvider(supabase, channelName, ydoc)

    setProvider(newProvider)

    return () => {
      newProvider.destroy()
    }
  }, [supabase, ydoc, room, hasCollab])

  return { provider, ydoc, hasCollab, setupError }
}

export function CollabProvider({
  children,
  room,
}: Readonly<{
  children: React.ReactNode
  room: string
}>) {
  const { hasCollab, provider, ydoc, setupError } = useCollaboration(room)

  const value = useMemo<CollabContextValue>(
    () => ({
      hasCollab,
      provider,
      ydoc,
      setupError,
    }),
    [hasCollab, provider, ydoc, setupError]
  )

  return (
    <CollabContext.Provider value={value}>{children}</CollabContext.Provider>
  )
}

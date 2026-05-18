"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Doc as YDoc } from "yjs"
import { getUrlParam } from "../lib/tiptap-collab-utils"
import { SupabaseYjsProvider } from "../lib/supabase-yjs-provider"
import { createClient } from "@/utils/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"

export type CollabContextValue = {
  provider: SupabaseYjsProvider | null
  ydoc: YDoc
  hasCollab: boolean
  setupError: boolean
  room: string
}

export const CollabContext = createContext<CollabContextValue>({
  hasCollab: false,
  provider: null,
  ydoc: new YDoc(),
  setupError: false,
  room: "",
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
  const ydoc = useMemo(() => new YDoc(), [room])

  useEffect(() => {
    const noCollabParam = getUrlParam("noCollab")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasCollab(parseInt(noCollabParam || "0") !== 1)
  }, [])

  useEffect(() => {
    if (!hasCollab) return

    try {
      const client = createClient()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupabase(client)
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSetupError(true)
    }
  }, [hasCollab])

  useEffect(() => {
    if (!hasCollab || !supabase) return

    const channelName = room ? `room:${room}` : "room:default"

    const newProvider = new SupabaseYjsProvider(supabase, channelName, ydoc)

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      room,
    }),
    [hasCollab, provider, ydoc, setupError, room]
  )

  return (
    <CollabContext.Provider value={value}>{children}</CollabContext.Provider>
  )
}

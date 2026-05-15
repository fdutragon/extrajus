import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import * as Y from "yjs"
import * as awarenessProtocol from "y-protocols/awareness"
import * as syncProtocol from "y-protocols/sync"
import * as encoding from "lib0/encoding"
import * as decoding from "lib0/decoding"
import { Observable } from "lib0/observable"

/**
 * Utility to convert Uint8Array to Base64 in a browser-safe way
 */
function toBase64(uint8Array: Uint8Array): string {
  const chunks: string[] = []
  const chunkSize = 0x8000 // 32k chunks to avoid stack overflow
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunkSize))))
  }
  return btoa(chunks.join(""))
}

/**
 * Utility to convert Base64 to Uint8Array in a browser-safe way
 */
function fromBase64(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export const messageSync = 0
export const messageAwareness = 1

export class SupabaseYjsProvider extends Observable<string> {
  public awareness: awarenessProtocol.Awareness
  private channel: RealtimeChannel
  private doc: Y.Doc
  private isSubscribed: boolean = false
  private channelName: string

  constructor(
    supabase: SupabaseClient,
    channelName: string,
    doc: Y.Doc,
    options: { awareness?: awarenessProtocol.Awareness } = {}
  ) {
    super()
    this.doc = doc
    this.channelName = channelName
    this.awareness = options.awareness || new awarenessProtocol.Awareness(doc)

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: this.awareness.clientID.toString() },
      },
    })

    // 1. Handle Broadcast messages
    this.channel.on("broadcast", { event: "message" }, ({ payload }) => {
      this.handleMessage(fromBase64(payload.data))
    })

    // 2. Handle Yjs updates
    this.doc.on("update", (update, origin) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        this.broadcast(encoding.toUint8Array(encoder))
      }
    })

    // 3. Handle Awareness updates
    this.awareness.on("update", ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) => {
      const changedClients = added.concat(updated).concat(removed)
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
      this.broadcast(encoding.toUint8Array(encoder))
    })

    // 4. Handle Presence sync
    this.channel.on("presence", { event: "sync" }, () => {
      // Presence is used for tracking connected users, but we use Broadcast for Yjs data
      // We can also trigger a sync here if needed
    })

    // 5. Connect and initial sync
    this.channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        this.isSubscribed = true
        console.log(`[SupabaseYjsProvider] Connected to ${this.channelName}`)
        
        // Initial Sync Step 1: Send our state vector to others
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, this.doc)
        this.broadcast(encoding.toUint8Array(encoder))

        // Also broadcast our awareness state
        const awarenessEncoder = encoding.createEncoder()
        encoding.writeVarUint(awarenessEncoder, messageAwareness)
        encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.awareness.clientID]))
        this.broadcast(encoding.toUint8Array(awarenessEncoder))
        
        this.emit("status", [{ status: "connected" }])
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        this.isSubscribed = false
        console.error(`[SupabaseYjsProvider] Connection error for ${this.channelName}: ${status}`)
        this.emit("status", [{ status: "disconnected" }])
      }
    })
  }

  private broadcast(data: Uint8Array) {
    if (this.isSubscribed) {
      this.channel.send({
        type: "broadcast",
        event: "message",
        payload: { data: toBase64(data) },
      })
    }
  }

  private handleMessage(data: Uint8Array) {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(data)
    const messageType = decoding.readVarUint(decoder)

    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        const syncType = syncProtocol.readSyncMessage(decoder, encoder, this.doc, this)
        if (syncType !== syncProtocol.messageYjsSyncStep2 && syncType !== syncProtocol.messageYjsUpdate) {
          // If it was a step 1, we need to send back the response (step 2)
          this.broadcast(encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness:
        awarenessProtocol.applyAwarenessUpdate(this.awareness, decoding.readVarUint8Array(decoder), this)
        break
    }
  }

  public destroy() {
    this.channel.unsubscribe()
    this.awareness.destroy()
    super.destroy()
  }
}

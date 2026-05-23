import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import * as Y from "yjs"
import * as awarenessProtocol from "y-protocols/awareness"
import * as syncProtocol from "y-protocols/sync"
import * as encoding from "lib0/encoding"
import * as decoding from "lib0/decoding"
import { Observable } from "lib0/observable"

/**
 * Optimized utility to convert Uint8Array to Base64
 */
function toBase64(uint8Array: Uint8Array): string {
  const binString = Array.from(uint8Array, (byte) =>
    String.fromCharCode(byte)
  ).join("")
  return btoa(binString)
}

/**
 * Optimized utility to convert Base64 to Uint8Array
 */
function fromBase64(base64: string): Uint8Array {
  const binString = atob(base64)
  return Uint8Array.from(binString, (m) => m.charCodeAt(0))
}

export const messageSync = 0
export const messageAwareness = 1

export class SupabaseYjsProvider extends Observable<string> {
  public awareness: awarenessProtocol.Awareness
  public isSynced: boolean = false
  private channel: RealtimeChannel
  private doc: Y.Doc
  private isSubscribed: boolean = false
  private channelName: string
  private supabase: SupabaseClient
  private contractId: string | null = null
  private pendingUpdate: Uint8Array | null = null
  private saveTimeout: any = null

  constructor(
    supabase: SupabaseClient,
    channelName: string,
    doc: Y.Doc,
    options: { awareness?: awarenessProtocol.Awareness } = {}
  ) {
    super()
    this.doc = doc
    this.channelName = channelName
    this.supabase = supabase
    this.awareness = options.awareness || new awarenessProtocol.Awareness(doc)

    // Extract contractId from channelName (format: room:ID)
    if (channelName.startsWith("room:")) {
      const id = channelName.split(":")[1]
      if (id && id !== "default") {
        this.contractId = id
        console.log(`[SupabaseYjsProvider] Contract ID detected: ${this.contractId}`)
      }
    }

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: this.awareness.clientID.toString() },
      },
    })

    // Browser close handling
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.boundDestroy)
    }

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

        // PERSISTENCE: Queue for debounced save
        this.queueUpdate(update)
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
      // Presence tracking
    })

    // 5. Load initial data and connect
    this.init()
  }

  private queueUpdate(update: Uint8Array) {
    if (this.pendingUpdate) {
      this.pendingUpdate = Y.mergeUpdates([this.pendingUpdate, update])
    } else {
      this.pendingUpdate = update
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(() => this.saveToDb(), 2000)
  }

  private async saveToDb() {
    if (!this.pendingUpdate || !this.contractId) return
    
    const update = this.pendingUpdate
    this.pendingUpdate = null
    this.saveTimeout = null

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.contractId || "")
    if (!isUuid) return

    try {
      // Optimized hex conversion
      const hex = Array.from(update, (byte) => byte.toString(16).padStart(2, "0")).join("")
      
      const { error } = await this.supabase.from("yjs_updates").insert({
        contract_id: this.contractId,
        update: `\\x${hex}`
      })

      if (error) {
        console.error("[SupabaseYjsProvider] Error saving debounced update:", error.message)
        // Restore updates so we do not lose them
        if (this.pendingUpdate) {
          this.pendingUpdate = Y.mergeUpdates([update, this.pendingUpdate])
        } else {
          this.pendingUpdate = update
        }
      } else {
        console.log(`[SupabaseYjsProvider] Debounced update saved for ${this.contractId}`)
      }
    } catch (e) {
      console.error("[SupabaseYjsProvider] Unexpected error saving update:", e)
      // Restore updates so we do not lose them
      if (this.pendingUpdate) {
        this.pendingUpdate = Y.mergeUpdates([update, this.pendingUpdate])
      } else {
        this.pendingUpdate = update
      }
    }
  }

  public async forceSave(): Promise<{ saved: boolean; message: string }> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }

    if (!this.pendingUpdate) {
      return { saved: false, message: "Todos os dados já estão totalmente sincronizados com o banco." }
    }

    const update = this.pendingUpdate
    this.pendingUpdate = null

    if (!this.contractId) {
      return { saved: false, message: "Erro: ID do contrato ausente." }
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.contractId || "")
    if (!isUuid) {
      return { saved: false, message: "Erro: ID do contrato inválido." }
    }

    try {
      const hex = Array.from(update, (byte) => byte.toString(16).padStart(2, "0")).join("")
      
      const { error } = await this.supabase.from("yjs_updates").insert({
        contract_id: this.contractId,
        update: `\\x${hex}`
      })

      if (error) {
        console.error("[SupabaseYjsProvider] Error saving update:", error.message)
        throw error
      }
      
      console.log(`[SupabaseYjsProvider] Manual update saved successfully for ${this.contractId}`)
      return { saved: true, message: "Documento salvo com sucesso no banco de dados!" }
    } catch (e: any) {
      console.error("[SupabaseYjsProvider] Manual save failed:", e)
      // Restore pendingUpdate so we don't lose it on retry
      this.pendingUpdate = update
      return { saved: false, message: `Falha ao salvar progresso: ${e.message || e}` }
    }
  }

  private async init() {
    // Load initial state from database if contractId exists and is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.contractId || "")

    if (this.contractId && isUuid) {
      try {
        console.log(`[SupabaseYjsProvider] Loading initial data for ${this.contractId}`)
        const { data, error } = await this.supabase
          .from("yjs_updates")
          .select("update")
          .eq("contract_id", this.contractId)
          .order("id", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          console.log(`[SupabaseYjsProvider] Found ${data.length} updates in DB. Applying...`)
          Y.transact(this.doc, () => {
            data.forEach((row: any, index: number) => {
              // Row.update is returned as a hex string or Buffer depending on client
              // If it's a string, we might need to convert it.
              let updateData: Uint8Array
              if (typeof row.update === 'string') {
                const hex = row.update.startsWith('\\x') ? row.update.slice(2) : row.update
                updateData = new Uint8Array(hex.length / 2)
                for (let i = 0; i < hex.length; i += 2) {
                  updateData[i / 2] = parseInt(hex.slice(i, i + 2), 16)
                }

                // Check if the data was accidentally stringified as JSON (e.g. starting with '{')
                if (updateData[0] === 0x7b) {
                  try {
                    const str = new TextDecoder().decode(updateData)
                    const obj = JSON.parse(str)
                    updateData = new Uint8Array(Object.values(obj) as number[])
                  } catch (e) {
                    // Not JSON or failed to parse, continue with raw bytes
                  }
                }
              } else {
                updateData = new Uint8Array(row.update)
              }
              
              Y.applyUpdate(this.doc, updateData, this)
            })
          }, this)
          console.log(`[SupabaseYjsProvider] Initialization complete. Applied ${data.length} updates.`)
        } else {
          console.log(`[SupabaseYjsProvider] No previous data found for ${this.contractId}. Starting fresh.`)
        }
      } catch (e: any) {
        console.error("[SupabaseYjsProvider] Error loading initial data:", e.message || e)
      }
    } else {
      console.warn(`[SupabaseYjsProvider] Persistence disabled: ${this.contractId || 'No ID'} is not a valid UUID.`)
    }

    // Connect and initial sync
    this.channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        this.isSubscribed = true
        this.isSynced = true
        console.log(`[SupabaseYjsProvider] Connected to ${this.channelName}`)
        
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeSyncStep1(encoder, this.doc)
        this.broadcast(encoding.toUint8Array(encoder))

        const awarenessEncoder = encoding.createEncoder()
        encoding.writeVarUint(awarenessEncoder, messageAwareness)
        encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.awareness.clientID]))
        this.broadcast(encoding.toUint8Array(awarenessEncoder))
        
        this.emit("status", [{ status: "connected" }])
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        this.isSubscribed = false
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
          this.broadcast(encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness:
        awarenessProtocol.applyAwarenessUpdate(this.awareness, decoding.readVarUint8Array(decoder), this)
        break
    }
  }

  private boundDestroy = this.destroy.bind(this)

  public destroy() {
    console.log(`[SupabaseYjsProvider] Destroying provider for ${this.channelName}`)
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.boundDestroy)
    }
    this.channel.unsubscribe()
    this.supabase.removeChannel(this.channel)
    this.awareness.destroy()
    super.destroy()
  }
}


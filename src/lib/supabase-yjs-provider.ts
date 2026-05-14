import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import * as Y from "yjs"
import * as awarenessProtocol from "y-protocols/awareness"
import { Observable } from "lib0/observable"

export class SupabaseYjsProvider extends Observable<any> {
  public awareness: awarenessProtocol.Awareness
  private channel: RealtimeChannel
  private doc: Y.Doc

  constructor(
    supabase: SupabaseClient,
    channelName: string,
    doc: Y.Doc,
    options: { awareness?: awarenessProtocol.Awareness } = {}
  ) {
    super()
    this.doc = doc
    this.awareness = options.awareness || new awarenessProtocol.Awareness(doc)

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: this.awareness.clientID.toString() },
      },
    })

    // 1. Handle Yjs updates via Broadcast
    this.doc.on("update", (update, origin) => {
      if (origin !== this) {
        this.channel.send({
          type: "broadcast",
          event: "update",
          payload: { update: Buffer.from(update).toString("base64") },
        })
      }
    })

    this.channel.on("broadcast", { event: "update" }, ({ payload }) => {
      const update = Buffer.from(payload.update, "base64")
      Y.applyUpdate(this.doc, update, this)
    })

    // 2. Handle Awareness via Presence
    this.awareness.on("update", () => {
      const state = awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.awareness.clientID,
      ])
      this.channel.track({
        awareness: Buffer.from(state).toString("base64"),
      })
    })

    this.channel.on("presence", { event: "sync" }, () => {
      const state = this.channel.presenceState()
      Object.values(state).forEach((presences: any) => {
        presences.forEach((presence: any) => {
          if (presence.awareness) {
            const update = Buffer.from(presence.awareness, "base64")
            awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this)
          }
        })
      })
    })

    this.channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Supabase Yjs Provider: Connected to channel", channelName)
        // Request initial state if needed, but for now we just broadcast updates
      }
    })
  }

  public destroy() {
    this.channel.unsubscribe()
    this.awareness.destroy()
    super.destroy()
  }
}

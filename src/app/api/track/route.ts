import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_LILITH_SUPABASE_URL!,
  process.env.LILITH_SUPABASE_SERVICE_ROLE_KEY!
)

type IncomingEvent = {
  session_id: string
  event_name: string
  event_category?: string
  page?: string
  click_x_pct?: number
  click_y_pct?: number
  element_id?: string
  element_text?: string
  properties?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const events: IncomingEvent[] = body.events ?? [body]

    if (!events?.length) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // ── Upsert das sessões únicas ─────────────────────────────────
    const sessionIds = [...new Set(events.map((e) => e.session_id))]

    await Promise.allSettled(
      sessionIds.map((sid) => {
        const firstEvent = events.find((e) => e.session_id === sid)
        const props = firstEvent?.properties ?? {}

        return supabase.from("site_sessions").upsert(
          {
            session_id: sid,
            utm_source: (props.utm_source as string) ?? null,
            utm_medium: (props.utm_medium as string) ?? null,
            utm_campaign: (props.utm_campaign as string) ?? null,
            utm_term: (props.utm_term as string) ?? null,
            utm_content: (props.utm_content as string) ?? null,
            device_type: (props.device_type as string) ?? null,
            is_pwa: (props.is_pwa as boolean) ?? false,
            screen_width: (props.screen_w as number) ?? null,
            screen_height: (props.screen_h as number) ?? null,
            landing_page: (props.landing_page as string) ?? firstEvent?.page ?? null,
            referrer: (props.referrer as string) ?? null,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "session_id", ignoreDuplicates: false }
        )
      })
    )

    // ── Insert dos eventos ─────────────────────────────────────────
    const rows = events.map((e) => ({
      session_id: e.session_id,
      event_name: e.event_name,
      event_category: e.event_category ?? null,
      page: e.page ?? null,
      click_x_pct: e.click_x_pct ?? null,
      click_y_pct: e.click_y_pct ?? null,
      element_id: e.element_id ?? null,
      element_text: e.element_text ?? null,
      properties: e.properties ?? {},
    }))

    const { error } = await supabase.from("site_events").insert(rows)

    if (error) {
      console.error("[tracker] Supabase insert error:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, count: rows.length })
  } catch (err: any) {
    console.error("[tracker] Unexpected error:", err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// GET para health check
export async function GET() {
  return NextResponse.json({ ok: true, service: "smartdoc-tracker" })
}

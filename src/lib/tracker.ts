/**
 * Extrajus Analytics Tracker
 * Zero-delay, async, batched event tracking com buffer local.
 * Envia lotes de 10 eventos para /api/track — sem bloquear a UI.
 */

const FLUSH_THRESHOLD = 10
const ENDPOINT = "/api/track"

type EventPayload = {
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

let eventBuffer: EventPayload[] = []
let sessionId: string | null = null
let sessionStartedAt: number = Date.now()
let isClient = typeof window !== "undefined"

// ── Session ID ────────────────────────────────────────────────────
function getSessionId(): string {
  if (sessionId) return sessionId
  if (!isClient) return "ssr"

  let sid = sessionStorage.getItem("_ex_sid")
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem("_ex_sid", sid)
    sessionStartedAt = Date.now()
  }
  sessionId = sid
  return sid
}

// ── UTM params ────────────────────────────────────────────────────
function getUTMs(): Record<string, string | null> {
  if (!isClient) return {}
  const p = new URLSearchParams(window.location.search)
  // Persiste UTMs na sessão para capturar em páginas internas
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
  const stored: Record<string, string | null> = {}

  keys.forEach((k) => {
    const val = p.get(k)
    if (val) sessionStorage.setItem(`_ex_${k}`, val)
    stored[k] = sessionStorage.getItem(`_ex_${k}`)
  })

  return stored
}

// ── Device info ───────────────────────────────────────────────────
function getDeviceInfo() {
  if (!isClient) return {}
  const ua = navigator.userAgent
  const isMobile = /Mobi|Android/i.test(ua)
  const isTablet = /Tablet|iPad/i.test(ua)
  return {
    device_type: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
    is_pwa: window.matchMedia("(display-mode: standalone)").matches || !!(navigator as any).standalone,
    screen_w: window.screen.width,
    screen_h: window.screen.height,
  }
}

// ── Flush buffer → /api/track ─────────────────────────────────────
function flushBuffer(force = false) {
  if (!isClient || eventBuffer.length === 0) return
  if (!force && eventBuffer.length < FLUSH_THRESHOLD) return

  const batch = [...eventBuffer]
  eventBuffer = []

  // sendBeacon é fire-and-forget, não bloqueia a página
  const blob = new Blob([JSON.stringify({ events: batch })], {
    type: "application/json",
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, blob)
  } else {
    // Fallback para browsers sem sendBeacon
    fetch(ENDPOINT, { method: "POST", body: blob, keepalive: true }).catch(() => {})
  }
}

// ── Core track function ───────────────────────────────────────────
export function track(
  eventName: string,
  options: {
    category?: string
    elementId?: string
    elementText?: string
    clickX?: number
    clickY?: number
    properties?: Record<string, unknown>
  } = {}
) {
  if (!isClient) return

  const payload: EventPayload = {
    session_id: getSessionId(),
    event_name: eventName,
    event_category: options.category,
    page: window.location.pathname + window.location.search,
    element_id: options.elementId,
    element_text: options.elementText,
    click_x_pct: options.clickX,
    click_y_pct: options.clickY,
    properties: {
      ...getUTMs(),
      ...getDeviceInfo(),
      page_title: document.title,
      time_on_session_ms: Date.now() - sessionStartedAt,
      ...options.properties,
    },
  }

  eventBuffer.push(payload)

  // Flush imediato para eventos de conversão críticos
  const criticalEvents = [
    "checkout_paid",
    "checkout_triggered",
    "ai_generation_error",
    "pwa_install_completed",
    "session_end",
  ]

  if (criticalEvents.includes(eventName)) {
    flushBuffer(true)
  } else {
    flushBuffer()
  }
}

// ── Click tracker com coordenadas (heatmap) ───────────────────────
export function trackClick(
  eventName: string,
  event: React.MouseEvent | MouseEvent,
  options: Parameters<typeof track>[1] = {}
) {
  const x = parseFloat(((event.clientX / window.innerWidth) * 100).toFixed(2))
  const y = parseFloat(((event.clientY / window.innerHeight) * 100).toFixed(2))
  track(eventName, { ...options, clickX: x, clickY: y, category: options.category ?? "engagement" })
}

// ── Session start (chama no layout) ──────────────────────────────
export function initTracker() {
  if (!isClient) return

  getSessionId() // garante que session_id existe
  getUTMs()      // persiste UTMs na sessionStorage

  // Dispara session_start apenas uma vez por sessão
  const alreadyStarted = sessionStorage.getItem("_ex_session_started")
  if (!alreadyStarted) {
    sessionStorage.setItem("_ex_session_started", "1")
    track("session_start", {
      category: "navigation",
      properties: {
        landing_page: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
        ...getUTMs(),
        ...getDeviceInfo(),
      },
    })
  }

  // Scroll depth auto-tracking
  const scrollMilestones = new Set<number>()
  const pageStartTime = Date.now()

  window.addEventListener(
    "scroll",
    () => {
      const scrollable = document.body.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const pct = Math.round((window.scrollY / scrollable) * 100)

      ;[25, 50, 75, 100].forEach((milestone) => {
        if (pct >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone)
          track("scroll_depth_global", {
            category: "engagement",
            properties: {
              depth_pct: milestone,
              time_to_reach_ms: Date.now() - pageStartTime,
            },
          })
        }
      })
    },
    { passive: true }
  )

  // Session end — flush tudo antes de sair
  window.addEventListener("beforeunload", () => {
    track("session_end", {
      category: "navigation",
      properties: {
        total_duration_ms: Date.now() - sessionStartedAt,
        events_buffered: eventBuffer.length,
      },
    })
    flushBuffer(true)
  })

  // Flush ao voltar para a aba
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushBuffer(true)
    }
  })
}

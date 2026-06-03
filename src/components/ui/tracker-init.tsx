"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { initTracker, track } from "@/lib/tracker"

/**
 * Componente silencioso que inicializa o tracker de analytics.
 * Monta uma única vez no layout global — captura sessão, UTMs,
 * scroll depth e page_view em cada mudança de rota.
 */
export function TrackerInit() {
  const pathname = usePathname()

  // Inicialização única: session_start, UTMs, scroll listener, beforeunload
  useEffect(() => {
    initTracker()
  }, [])

  // Page view em cada mudança de rota do Next.js
  useEffect(() => {
    track("page_view", {
      category: "navigation",
      properties: {
        page: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      },
    })
  }, [pathname])

  return null
}

"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { track } from "@/lib/tracker"

/**
 * Componente silencioso que gerencia o prompt nativo de instalação do PWA.
 * Ele escuta a primeira edição do usuário e dispara o convite do sistema (Android/iOS/Chrome).
 */
export function NativePwaHandler() {
  const deferredPrompt = useRef<any>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    // Verifica se já está rodando como PWA (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    
    // Pequeno delay para garantir que os listeners de outros componentes já foram registrados
    if (isStandalone) {
      localStorage.setItem("pwa-installed", "true")
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("pwa-installed-status-changed", { detail: { installed: true } }))
      }, 500)
      // Track: abriu como PWA instalado
      track("pwa_launched", {
        category: "pwa",
        properties: { platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "desktop" },
      })
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede que o navegador mostre o banner automático imediatamente
      e.preventDefault()
      // Guarda o evento para disparar no momento certo
      deferredPrompt.current = e
      // Track: browser emitiu o prompt de instalação
      track("pwa_install_prompted", {
        category: "pwa",
        properties: { platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "desktop" },
      })
    }

    const handleUserEdit = async () => {
      // Só dispara se tivermos o prompt guardado e se ainda não foi disparado nesta sessão
      if (deferredPrompt.current && !hasTriggered.current) {
        hasTriggered.current = true
        
        // Pequeno delay para garantir que a edição foi processada
        setTimeout(async () => {
          showNativePrompt()
        }, 1500)
      }
    }

    const showNativePrompt = async () => {
      if (!deferredPrompt.current) {
        console.warn("[PWA] Prompt de instalação não disponível (pode já estar instalado ou não suportado).")
        return
      }

      console.log("[PWA] Disparando prompt de instalação nativo...")
      deferredPrompt.current.prompt()
      
      const { outcome } = await deferredPrompt.current.userChoice
      console.log(`[PWA] Resposta do usuário: ${outcome}`)
      
      if (outcome === 'accepted') {
        localStorage.setItem("pwa-installed", "true")
        // Track: usuário aceitou instalar o PWA
        track("pwa_install_accepted", { category: "pwa" })

        // Removemos a dependência do evento 'appinstalled' (que falha em alguns celulares)
        // Disparamos o sucesso após 10 segundos fixos, tempo suficiente para a instalação concluir
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("pwa-installed-status-changed", { detail: { installed: true } }))
          track("pwa_install_completed", {
            category: "pwa",
            properties: { platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "desktop" },
          })
          
          const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          
          if (isMobile) {
            toast.success("SmartDoc instalada com sucesso!", {
              description: "O aplicativo já está pronto no seu celular.",
              duration: 10000,
              className: "text-[11px]"
            })
          } else {
            toast.success("SmartDoc instalada com sucesso! Redirecionando...", {
              duration: 3000,
              className: "text-[11px]"
            })
            setTimeout(() => {
               window.location.href = "web+smartdoc://editor"
            }, 3000)
          }
        }, 10000)
      } else {
        // Track: usuário recusou o prompt de instalação
        track("pwa_install_dismissed", { category: "pwa" })
      }
      
      deferredPrompt.current = null
      hasTriggered.current = true
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("trigger-pwa-install", showNativePrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("trigger-pwa-install", showNativePrompt)
    }
  }, [])

  return null // Não renderiza nada na UI, apenas lógica
}

"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

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
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Impede que o navegador mostre o banner automático imediatamente
      e.preventDefault()
      // Guarda o evento para disparar no momento certo
      deferredPrompt.current = e
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
        // Conversão do Google Ads para Instalação
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
              'send_to': 'AW-18191879169/hEqyCJvpwrYcEIGYyOJD',
              'value': 1.0,
              'currency': 'BRL'
          });
        }

        // Removemos a dependência do evento 'appinstalled' (que falha em alguns celulares)
        // Disparamos o sucesso após 10 segundos fixos, tempo suficiente para a instalação concluir
        window.dispatchEvent(new CustomEvent("pwa-installed-status-changed", { detail: { installed: true } }))
        setTimeout(() => {
          toast.success("ExtraJus instalada com sucesso! Redirecionando...", {
            duration: 3000,
            className: "text-[11px]"
          })
          setTimeout(() => {
             const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
             if (isMobile) {
               window.open(window.location.href, "_blank")
             } else {
               window.location.href = "web+extrajus://editor"
             }
          }, 3000)
        }, 10000)
      }
      
      deferredPrompt.current = null
      hasTriggered.current = true
    }

    const handleAppInstalledEvent = () => {
      localStorage.setItem("pwa-installed", "true")
      window.dispatchEvent(new CustomEvent("pwa-installed-status-changed", { detail: { installed: true } }))
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("trigger-pwa-install", showNativePrompt)
    window.addEventListener("appinstalled", handleAppInstalledEvent)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("trigger-pwa-install", showNativePrompt)
      window.removeEventListener("appinstalled", handleAppInstalledEvent)
    }
  }, [])

  return null // Não renderiza nada na UI, apenas lógica
}

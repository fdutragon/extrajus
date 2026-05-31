"use client"

import { useEffect, useRef } from "react"

/**
 * Componente silencioso que gerencia o prompt nativo de instalação do PWA.
 * Ele escuta a primeira edição do usuário e dispara o convite do sistema (Android/iOS/Chrome).
 */
export function NativePwaHandler() {
  const deferredPrompt = useRef<any>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
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
        // Conversão do Google Ads para Instalação
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
              'send_to': 'AW-18191879169/hEqyCJvpwrYcEIGYyOJD',
              'value': 1.0,
              'currency': 'BRL'
          });
        }
      }
      
      deferredPrompt.current = null
      hasTriggered.current = true
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("user-manual-edit", handleUserEdit)
    window.addEventListener("trigger-pwa-install", showNativePrompt)
    window.addEventListener("appinstalled", () => {
      deferredPrompt.current = null
      hasTriggered.current = true
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("user-manual-edit", handleUserEdit)
      window.removeEventListener("trigger-pwa-install", showNativePrompt)
    }
  }, [])

  return null // Não renderiza nada na UI, apenas lógica
}

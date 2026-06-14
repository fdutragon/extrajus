"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { NotionEditor, LoadingSpinner } from "@/components/tiptap-templates/notion-like/notion-like-editor"
import { Button } from "@/components/ui/button"
import { Download, ShieldCheck } from "lucide-react"
import { PaymentDialog } from "@/components/checkout/payment-dialog"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

function NotificationEditorContent() {
  const searchParams = useSearchParams()
  const session = searchParams.get("session")
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [room, setRoom] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session: authSession } } = await supabase.auth.getSession()
      setIsPublic(!authSession?.user)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (session) {
      setRoom(`notificacao-${session}`)
    } else {
      setRoom(`notificacao-draft-${Date.now()}`)
    }
  }, [session])

  if (isPublic === null || !room) {
    return <LoadingSpinner text="Carregando Notificação..." />
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      {/* Container do Editor com blur condicional */}
      <div className={cn(
        "flex-1 relative transition-all duration-700",
        isPaymentOpen && !hasPaid ? "blur-md pointer-events-none select-none opacity-50" : ""
      )}>
        <NotionEditor 
          room={room} 
          templateSlug="Notificação Extrajudicial" 
          readOnly={true} 
          isPublic={isPublic} 
        />
      </div>

      {/* Footer com Call to Action (Download) */}
      <div className="sticky bottom-0 left-0 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl p-4 flex flex-col items-center justify-center z-50">
        <div className="max-w-md w-full flex flex-col space-y-3">
          <Button 
            size="lg"
            className="w-full bg-white text-black hover:bg-neutral-200 font-bold tracking-tight shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all"
            onClick={() => setIsPaymentOpen(true)}
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Documento Final
          </Button>
          <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            <span>Documento Pronto para Uso</span>
          </div>
        </div>
      </div>

      <PaymentDialog 
        open={isPaymentOpen} 
        onOpenChange={(open) => {
          if (hasPaid) {
            setIsPaymentOpen(open)
          } else {
            // Só permite fechar o modal se tiver pago. Caso contrário, mantém forçado.
            // Para debug, podemos deixar fechar, mas a instrução diz "impedir retorno ao texto sem pagamento".
            // O blur vai continuar se isPaymentOpen for false e hasPaid for false?
            // Não, o blur depende de isPaymentOpen. Então se não pagou, reabrimos ou não fechamos.
            if (!open) {
               // Impede fechamento
            }
          }
        }}
        onSuccess={() => {
          setHasPaid(true)
          setIsPaymentOpen(false)
          // Aqui no mundo real baixaríamos o PDF
          alert("Pagamento confirmado! O download do documento iniciaria aqui.")
        }}
      />
    </div>
  )
}

export default function NotificationEditorPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Preparando Ambiente..." />}>
      <NotificationEditorContent />
    </Suspense>
  )
}

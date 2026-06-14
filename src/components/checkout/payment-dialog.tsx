"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock, FileDown, ShieldCheck } from "lucide-react"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, onSuccess }: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white shadow-[0_0_50px_-15px_rgba(255,255,255,0.1)]"
        // @ts-expect-error type missing in wrapper
        onInteractOutside={(e: any) => {
          e.preventDefault() // Impede fechamento ao clicar fora
        }}
        onEscapeKeyDown={(e: any) => {
          e.preventDefault() // Impede fechamento com a tecla Esc
        }}
      >
        <DialogHeader className="space-y-3">
          <div className="mx-auto bg-white/5 p-3 rounded-full border border-white/10 mb-2">
            <Lock className="w-6 h-6 text-neutral-300" />
          </div>
          <DialogTitle className="text-center text-xl tracking-tight">Desbloquear Documento</DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            A notificação extrajudicial gerada pela Lilith está pronta e formatada. Efetue o pagamento para liberar o download e a visualização completa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileDown className="w-5 h-5 text-neutral-400" />
              <div className="text-sm font-medium">Notificação Extrajudicial</div>
            </div>
            <div className="font-bold text-lg">R$ 49,90</div>
          </div>

          <Button 
            className="w-full bg-white text-black hover:bg-neutral-200" 
            size="lg"
            onClick={() => {
              // Mock do fluxo de pagamento
              onSuccess()
              onOpenChange(false)
            }}
          >
            Pagar com Pix
          </Button>
          
          <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Pagamento 100% Seguro</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

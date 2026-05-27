"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { BrainCircuit, Copy, CheckCircle2, Lock, Zap, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  documentContent: string
  docType: string
  title: string
}

export function CheckoutModal({ isOpen, onClose, onSuccess, documentContent, docType, title }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "pix" | "success">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string, code: string, externalId: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("form")
      setPixData(null)
      setName("")
      setEmail("")
    }
  }, [isOpen])

  // Polling for payment status
  useEffect(() => {
    const isPollingEnabled = true; // Habilitado após testes de webhook bem-sucedidos
    if (!isPollingEnabled || step !== "pix" || !pixData || !pixData.externalId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/status?externalId=${pixData.externalId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === "COMPLETE") {
            // Dispara o evento de conversão de compra do Google Ads no frontend
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag('event', 'conversion', {
                'send_to': 'AW-18191879169/eKl1CM-bnrQcEIGYyOJD',
                'value': 29.90, // Valor real do download do documento
                'currency': 'BRL',
                'transaction_id': pixData.externalId
              });
              console.log("[Google Ads] Conversão de compra de contrato disparada com sucesso!", pixData.externalId);
            }

            setStep("success")
            clearInterval(interval)
          }
        }
      } catch (err) {
        console.error("Polling error", err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [step, pixData])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          content: documentContent,
          doc_type: docType,
          title
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao gerar cobrança")

      setPixData({
        qrCode: data.pixQrCode,
        code: data.pixCode,
        externalId: data.externalId
      })
      setStep("pix")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Developer simulation: Creates account and completes payment instantly
  const handleDevSimulateAll = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Por favor, preencha o Nome e o E-mail no formulário antes de clicar em simular!")
      return
    }

    setLoading(true)
    try {
      // 1. Create transaction and account using the actual user inputted name and email
      const res = await fetch("/api/billing/checkout-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          content: documentContent,
          doc_type: docType,
          title
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao gerar cobrança de simulação")

      setPixData({
        qrCode: data.pixQrCode,
        code: data.pixCode,
        externalId: data.externalId
      })
      
      toast.success(`Conta gerada para ${email.trim()}! Processando pagamento...`)
      
      // 2. Direct call to mark transaction complete
      const statusRes = await fetch("/api/billing/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: data.externalId })
      })

      const statusData = await statusRes.json()
      if (!statusRes.ok) throw new Error(statusData.error || "Falha ao simular confirmação de pagamento")

      // 3. Transition to success
      setStep("success")

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Developer simulation: Confirms the active PIX payment
  const handleDevSimulatePaymentOnly = async () => {
    if (!pixData?.externalId) return
    setLoading(true)
    try {
      const res = await fetch("/api/billing/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: pixData.externalId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao simular confirmação de pagamento")

      toast.success("Confirmação de pagamento simulada com sucesso!")
      setStep("success")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyPix = () => {
    if (pixData?.code) {
      navigator.clipboard.writeText(pixData.code)
      setCopied(true)
      toast.success("Código PIX copiado!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (step === "success") return;
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-[95vw] md:max-w-[780px] lg:max-w-[850px] bg-background border border-border text-foreground rounded-[32px] shadow-[0_0_50px_rgba(139,92,246,0.15)] p-6 md:p-8 overflow-hidden transition-all duration-500">
        {/* Soft Occult Ambient Highlights (Adaptive to Theme) */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 relative z-10">
          
          {/* Painel Esquerdo: A Oferta Suprema (6 colunas) */}
          <div className="md:col-span-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6 lg:pr-8 space-y-3">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <Zap size={12} className="text-primary animate-pulse filter drop-shadow-[0_0_4px_rgba(139,92,246,0.4)]" />
                <span className="text-[11px] font-bold text-primary">Oferta de lançamento</span>
              </div>
              
              <h3 className="text-[28px] font-black text-foreground leading-[1.1] tracking-tight">
                Desbloqueie agora<br />
                <span className="bg-gradient-to-r from-primary via-violet-600 to-primary dark:via-violet-400 bg-clip-text text-transparent">seu contrato</span>
              </h3>
              
              <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                Obtenha a versão editável oficial <strong className="text-foreground font-bold">(.docx)</strong> deste instrumento, com acesso imediato ao download e plena liberdade para personalizar cada cláusula conforme sua realidade jurídica.
              </p>
            </div>

            {/* Box de Preço Único */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Valor de liberação</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-foreground">R$ 29,90</span>
              </div>
            </div>
          </div>

          {/* Painel Direito: Formulário, PIX ou Sucesso (6 colunas) */}
          <div className="md:col-span-6 flex flex-col justify-center min-h-[340px]">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg font-black uppercase tracking-[0.12em] bg-gradient-to-r from-primary via-violet-600 to-primary dark:via-violet-400 bg-clip-text text-transparent">
                <Lock size={16} className="text-primary animate-pulse filter drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
                {step === "form" ? "Dados de Acesso" : step === "pix" ? "Pagamento Pix" : "Sucesso!"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium tracking-wide mt-1 leading-relaxed">
                {step === "form" 
                  ? "Preencha os dados abaixo para receber as credenciais da sua conta e liberar o download." 
                  : step === "pix" 
                  ? "Escaneie o QR Code ou copie a chave Pix. O documento e o saldo serão liberados imediatamente após o pagamento."
                  : "Seu pagamento foi confirmado com glória absoluta."}
              </DialogDescription>
            </DialogHeader>

            {step === "form" && (
              <form onSubmit={handleCheckout} className="space-y-4 mt-2">
                {/* Nome Completo Input Group */}
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 dark:text-primary/70">
                    Nome Completo
                  </label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background/50 text-foreground text-sm placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-semibold shadow-xs duration-300"
                    placeholder="Ex: Seu Nome Completo"
                  />
                </div>
                
                {/* E-mail Input Group */}
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 dark:text-primary/70">
                    E-mail de Acesso
                  </label>
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background/50 text-foreground text-sm placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-semibold shadow-xs duration-300"
                    placeholder="Ex: seu@email.com"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-11 bg-gradient-to-r from-primary via-violet-600 to-primary hover:from-primary/90 hover:to-violet-600/90 text-primary-foreground font-black tracking-[0.12em] uppercase rounded-xl transition-all shadow-[0_3px_15px_rgba(139,92,246,0.2)] hover:shadow-[0_3px_25px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 duration-300 transform hover:-translate-y-0.5 border border-primary/20"
                  >
                    {loading ? <BrainCircuit className="animate-spin text-primary-foreground" /> : "Gerar PIX - R$ 29,90"}
                  </Button>
                </div>
              </form>
            )}

            {step === "pix" && pixData && (
              <div className="flex flex-col items-center justify-center space-y-4 mt-2">
                {/* Premium QR Code Container */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border shadow-[0_0_20px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-2.5 bg-white rounded-lg shadow-xl relative z-10">
                    <QRCodeSVG value={pixData.qrCode} size={150} />
                  </div>
                </div>
                
                {/* Copy & Dev Simulator Action Controls */}
                <div className="w-full space-y-2">
                  <Button 
                    onClick={copyPix} 
                    variant="outline" 
                    className="w-full h-11 border-border hover:border-primary/40 bg-background text-foreground hover:bg-muted/50 font-bold uppercase tracking-[0.1em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    {copied ? "Chave Copiada!" : "Copiar Código Pix"}
                  </Button>

                  {(process.env.NODE_ENV === "development" || email.toLowerCase().trim() === "felipedutra@outlook.com") && (
                    <Button 
                      onClick={handleDevSimulatePaymentOnly} 
                      disabled={loading}
                      className="w-full h-10 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black tracking-wider uppercase rounded-xl transition-all text-xs flex items-center justify-center gap-2 duration-300 shadow-[0_0_10px_rgba(245,158,11,0.03)]"
                    >
                      <Zap size={13} className="text-amber-500 dark:text-amber-400 animate-pulse" />
                      Simular Confirmação do Pagamento (Dev)
                    </Button>
                  )}
                </div>

                {/* Waiting indicator */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 animate-pulse">
                  <BrainCircuit size={13} className="text-primary" />
                  <span>Aguardando pagamento...</span>
                </div>
              </div>
            )}

            {step === "success" && (
              <>
                <style dangerouslySetInnerHTML={{ __html: `
                  button[class*="absolute right-4 top-4"] {
                    display: none !important;
                  }
                ` }} />
                <div className="flex flex-col items-center justify-center space-y-6 py-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.1)] animate-bounce">
                    <CheckCircle2 size={32} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent uppercase tracking-[0.08em]">Pagamento Aprovado</h3>
                    <p className="text-xs text-muted-foreground font-medium">Sua minuta oficial foi totalmente liberada.</p>
                  </div>

                  <div className="w-full space-y-3 pt-2">
                    <Button 
                      onClick={onSuccess} 
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black tracking-[0.12em] uppercase rounded-xl transition-all shadow-[0_3px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 duration-300 transform hover:-translate-y-0.5 border border-emerald-500/20"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Contrato (.DOCX)
                    </Button>

                    <Button 
                      onClick={async () => {
                        const docId = pixData?.externalId.replace("paydoc_", "");
                        if (docId) {
                          setLoading(true);
                          try {
                            const res = await fetch("/api/billing/delete-doc", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ docId })
                            });
                            if (res.ok) {
                              toast.success("Contrato excluído! Preparando editor limpo...");
                              setTimeout(() => {
                                const newRoomId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                                window.location.href = `/editor?room=${newRoomId}`;
                              }, 1000);
                            } else {
                              throw new Error("Erro ao excluir contrato");
                            }
                          } catch (err: any) {
                            toast.error(err.message || "Erro ao iniciar novo contrato");
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          const newRoomId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                          window.location.href = `/editor?room=${newRoomId}`;
                        }
                      }}
                      disabled={loading}
                      variant="outline"
                      className="w-full h-11 border-border hover:border-red-500/40 bg-background text-muted-foreground hover:text-red-500 hover:bg-red-500/5 font-bold uppercase tracking-[0.1em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Criar Novo Contrato
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

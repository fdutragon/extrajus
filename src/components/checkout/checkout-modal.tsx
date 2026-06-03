"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { BrainCircuit, Copy, CheckCircle2, Lock, ArrowRight, Download, Zap, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  getDocumentContent?: () => string
  docType: string
  title: string
}

export function CheckoutModal({ isOpen, onClose, onSuccess, getDocumentContent, docType, title }: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "pix" | "success">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string, code: string, externalId: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const hasAutoChecked = useRef(false)
  const conversionFiredRef = useRef(false)
  const isProcessingRef = useRef(false)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("form")
      setPixData(null)
      setLoading(false)
      setEmail("")
      setName("Cliente")
      conversionFiredRef.current = false
      isProcessingRef.current = false
    }
  }, [isOpen])

  // Polling for payment status (Proteção contra Race Conditions e Memory Leaks)
  useEffect(() => {
    const isPollingEnabled = true;
    if (!isPollingEnabled || step !== "pix" || !pixData || !pixData.externalId) return;

    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/billing/status?externalId=${pixData.externalId}`, {
          signal: abortController.signal
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.status === "COMPLETE") {
            // Dispara o evento de conversão de compra do Google Ads no frontend
            if (typeof window !== "undefined" && (window as any).gtag && !conversionFiredRef.current) {
              conversionFiredRef.current = true;
              (window as any).gtag('event', 'conversion', {
                'send_to': 'AW-18191879169/eKl1CM-bnrQcEIGYyOJD',
                'value': 27.00,
                'currency': 'BRL',
                'transaction_id': pixData.externalId
              });
              console.log("[Google Ads] Conversão de compra de contrato disparada com sucesso!", pixData.externalId);
            }

            setStep("success");
            return; // Stop polling
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Polling error", err);
        }
      }

      // Agenda próxima verificação apenas se não estiver cancelado e não obteve sucesso
      if (!abortController.signal.aborted) {
        timeoutId = setTimeout(pollStatus, 4000); // 4s backoff conservador
      }
    };

    pollStatus(); // Start polling

    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [step, pixData]);

  const handleCheckout = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    if (!name.trim() || !email.trim() || isProcessingRef.current) return

    isProcessingRef.current = true
    setLoading(true)
    try {
      const res = await fetch("/api/billing/checkout-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Cliente",
          email,
          content: getDocumentContent ? getDocumentContent() : (document.querySelector(".notion-like-editor-content")?.innerHTML || ""),
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
      isProcessingRef.current = false
    }
  }

  // Developer simulation: Creates account and completes payment instantly
  const handleDevSimulateAll = async () => {
    if (!name.trim() || !email.trim() || isProcessingRef.current) {
      if (!isProcessingRef.current) toast.error("Por favor, preencha o Nome e o E-mail no formulário antes de clicar em simular!")
      return
    }

    isProcessingRef.current = true
    setLoading(true)
    try {
      // 1. Create transaction and account using the actual user inputted name and email
      const res = await fetch("/api/billing/checkout-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          content: getDocumentContent ? getDocumentContent() : (document.querySelector(".notion-like-editor-content")?.innerHTML || ""),
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
      // Dispara o evento de conversão de compra do Google Ads na simulação dev
      if (typeof window !== "undefined" && (window as any).gtag && !conversionFiredRef.current) {
        conversionFiredRef.current = true;
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-18191879169/eKl1CM-bnrQcEIGYyOJD',
          'value': 27.00,
          'currency': 'BRL',
          'transaction_id': data.externalId
        });
        console.log("[Google Ads] Conversão disparada via Simulação Dev (All)!", data.externalId);
      }

      setStep("success")

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      isProcessingRef.current = false
    }
  }

  // Developer simulation: Confirms the active PIX payment
  const handleDevSimulatePaymentOnly = async () => {
    if (!pixData?.externalId || isProcessingRef.current) return
    isProcessingRef.current = true
    setLoading(true)
    try {
      const res = await fetch("/api/billing/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: pixData.externalId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao simular confirmação de pagamento")

      // Dispara o evento de conversão de compra do Google Ads na simulação dev
      if (typeof window !== "undefined" && (window as any).gtag && !conversionFiredRef.current) {
        conversionFiredRef.current = true;
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-18191879169/eKl1CM-bnrQcEIGYyOJD',
          'value': 27.00,
          'currency': 'BRL',
          'transaction_id': pixData.externalId
        });
        console.log("[Google Ads] Conversão disparada via Simulação Dev (PaymentOnly)!", pixData.externalId);
      }

      toast.success("Confirmação de pagamento simulada com sucesso!")
      setStep("success")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
      isProcessingRef.current = false
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
      // Bloqueia qualquer saída além do botão programático (se houver)
      if (step === "success" && !open) onClose();
    }}>
    <DialogContent 
      className="w-full max-w-[92vw] md:max-w-[48rem] lg:max-w-[52rem] bg-background border border-border text-foreground rounded-[28px] max-sm:rounded-[24px] max-sm:!top-[50%] max-sm:!left-[50%] max-sm:!-translate-x-1/2 max-sm:!-translate-y-1/2 max-sm:w-[92vw] max-h-[95vh] overflow-y-auto flex flex-col shadow-[0_0_50px_rgba(234,179,8,0.18)] p-8 md:p-10 max-sm:p-6 transition-all duration-500 [&>button:last-child]:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Invisible Focus Target to prevent auto opening keyboard on mobile */}
      <button className="sr-only opacity-0 absolute w-0 h-0" tabIndex={0} aria-hidden="true" />

      {/* Soft Occult Ambient Highlights (Adaptive to Theme) */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-sm:gap-5 relative z-10 max-sm:px-0 max-sm:flex-1 max-sm:flex max-sm:flex-col max-sm:justify-start max-sm:h-auto max-sm:overflow-visible">

        {/* Painel Esquerdo: A Oferta Suprema (6 colunas) */}
        <div className="md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/60 pb-5 max-sm:pb-3 md:pb-0 md:pr-5 lg:pr-6 space-y-5 max-sm:space-y-4 shrink-0">
          <div className="space-y-4 max-sm:space-y-4 max-sm:pt-0 max-sm:flex max-sm:flex-col max-sm:items-center max-sm:text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 max-sm:py-1 max-sm:px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full max-sm:hidden">
              <CheckCircle2 size={14} className="text-emerald-500 animate-pulse max-sm:w-[13px] max-sm:h-[13px]" />
              <span className="text-[10px] max-sm:text-[10.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Minuta Revisada e Aprovada</span>
            </div>

            <h3 className="text-[1.65rem] max-sm:text-[1.6rem] font-black text-foreground leading-[1.1] tracking-tight whitespace-nowrap max-sm:mt-2">
              Baixe Agora Seu <span className="bg-gradient-to-r from-primary via-amber-500 to-primary dark:via-amber-400 bg-clip-text text-transparent">{docType === "notificacao" ? "Notificação" : "Contrato"}</span>
            </h3>

            <p className="text-[0.825rem] max-sm:text-[0.925rem] max-sm:leading-[1.5] text-muted-foreground leading-relaxed font-medium">
              Obtenha agora sua minuta profissional <strong className="text-foreground font-bold">100% editável em Word (.DOCX)</strong>. O documento é seu: use, replique e adapte com total segurança jurídica.
            </p>
          </div>

          {/* Prova Social de Elite (Depoimento de Vidro Fosco) */}
          <div className="bg-muted/30 dark:bg-card/40 border border-border/50 rounded-2xl p-3.5 space-y-2 text-left relative overflow-hidden backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-amber-500 text-[11px] leading-none">★</span>
              ))}
            </div>
            <p className="text-[0.75rem] max-sm:text-[0.85rem] leading-relaxed italic text-muted-foreground font-medium">
              "Meu contrato de prestação de serviços ficou impecável. Paguei no PIX e o Word editável abriu na hora. Economizei horas de trabalho e custos com advogados."
            </p>
            <div className="text-[9px] font-black uppercase tracking-widest text-foreground/70">
              — Marcos R., Empreendedor Digital
            </div>
          </div>

          {/* Box de Preço Único */}
          <div className="space-y-4 pt-1 max-sm:pt-1 max-sm:flex max-sm:flex-col max-sm:items-center">
            <div className="flex items-center justify-between w-full max-sm:justify-center max-sm:gap-3 border-t border-border/40 pt-3 max-sm:pt-2">
              <div>
                <div className="text-[0.625rem] max-sm:text-[0.7rem] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5">Investimento Único</div>
                <div className="flex items-baseline gap-1.5 max-sm:gap-1.5">
                  <span className="text-[1.75rem] max-sm:text-[1.8rem] font-black text-foreground">R$ 27,00</span>
                  <span className="text-[0.625rem] max-sm:text-[0.75rem] font-bold text-muted-foreground uppercase">/ download</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Formulário, PIX ou Sucesso (6 colunas) */}
        <div className="md:col-span-6 flex flex-col justify-center min-h-[260px] max-sm:min-h-0 max-sm:pt-1 max-sm:flex-1 max-sm:justify-start">
          
          {/* Título Principal Acima das Barras */}
          <DialogHeader className="mb-3.5 text-center flex flex-col items-center shrink-0">
            <DialogTitle className={cn(
              "flex items-center justify-center gap-2 text-[1.1rem] max-sm:text-[1.15rem] font-black tracking-[0.12em] bg-gradient-to-r from-primary via-amber-500 to-primary dark:via-amber-400 bg-clip-text text-transparent",
              step === "pix" && "max-sm:hidden"
            )}>
              <Lock size={18} className="text-primary animate-pulse filter drop-shadow-[0_0_6px_rgba(234,179,8,0.4)] max-sm:w-[16px] max-sm:h-[16px]" />
              {step === "form" ? "Acesso ao Documento" : step === "pix" ? "Finalizar Pagamento" : "Sucesso!"}
            </DialogTitle>
          </DialogHeader>

          {/* Barra de Progresso Líquida (UX de 3 etapas) */}
          <div className="w-full flex items-center justify-between gap-2 mb-5 max-sm:mb-3 px-1 shrink-0 select-none">
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-1 rounded-full transition-all duration-500 bg-primary" />
              <span className="text-[8px] font-black uppercase tracking-wider text-primary text-center">1. Identificação</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className={cn(
                "h-1 rounded-full transition-all duration-500",
                step === "pix" || step === "success" ? "bg-primary" : "bg-muted"
              )} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-wider text-center",
                step === "pix" || step === "success" ? "text-primary" : "text-muted-foreground"
              )}>2. Pagamento</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className={cn(
                "h-1 rounded-full transition-all duration-500",
                step === "success" ? "bg-emerald-500" : "bg-muted"
              )} />
              <span className={cn(
                "text-[8px] font-black uppercase tracking-wider text-center",
                step === "success" ? "text-emerald-500" : "text-muted-foreground"
              )}>3. Download</span>
            </div>
          </div>

          <div className={cn("mb-4 max-sm:mb-4 text-center flex flex-col items-center", step === "pix" && "max-sm:mb-2 max-sm:mt-0")}>
            <DialogDescription className={cn(
              "text-[0.825rem] max-sm:text-[0.85rem] max-sm:leading-[1.4] text-muted-foreground font-medium tracking-wide mt-1.5 max-sm:mt-2 leading-relaxed text-center",
              step === "pix" && "max-sm:mt-0"
            )}>
              {step === "form"
                ? "Informe o e-mail onde deseja receber o arquivo editável do seu documento e as instruções de acesso:"
                : step === "pix"
                ? "Efetue o pagamento via PIX para liberação instantânea do seu documento Word editável."
                : "Seu pagamento foi confirmado. O download está disponível abaixo."}
            </DialogDescription>
          </div>
          {step === "form" && (
            <div 
              onKeyDown={(e) => { if (e.key === 'Enter') handleCheckout(e) }} 
              className="flex flex-col space-y-4 max-sm:space-y-4.5 py-2 w-full max-sm:px-2"
            >
              <div className="flex flex-col">
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com" 
                  className="flex h-11 max-sm:h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm max-sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                />
                <Button 
                  type="button" 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full h-11 max-sm:h-12 mt-[18px] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.1em] rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                       <BrainCircuit size={18} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Gerar PIX de R$ 27,00
                    </>
                  )}
                </Button>
              </div>
              
              <button 
                type="button" 
                onClick={onClose}
                className="mx-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-1"
              >
                Voltar para o editor
              </button>
            </div>
          )}

          {step === "pix" && pixData && (
            <div className="flex flex-col items-center justify-center space-y-4 max-sm:space-y-2.5 mt-1 max-sm:mt-0 max-sm:text-center w-full">
              {/* Premium QR Code Container */}
              <div className="bg-muted/40 p-3 max-sm:p-2 rounded-xl border border-border shadow-[0_0_20px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-2 max-sm:p-1.5 bg-white rounded-lg shadow-xl relative z-10">
                  <QRCodeSVG value={pixData.qrCode} size={120} className="w-[7.5rem] h-[7.5rem] max-sm:w-[6rem] max-sm:h-[6rem] max-sm:!w-[6rem] max-sm:!h-[6rem]" style={{ display: "block" }} />
                </div>
              </div>
              
              {/* Copy & Dev Simulator Action Controls */}
              <div className="w-full space-y-3 max-sm:space-y-2 flex flex-col items-center">
                <Button 
                  onClick={copyPix} 
                  className={cn(
                    "w-full h-11 max-sm:h-12 max-sm:text-sm font-black uppercase tracking-[0.1em] rounded-xl transition-all duration-500 flex items-center justify-center gap-2 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)]",
                    copied 
                      ? "bg-emerald-700 hover:bg-emerald-800" 
                      : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={18} className="text-white animate-bounce max-sm:w-[16px] max-sm:h-[16px]" />
                      Chave Copiada!
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="max-sm:w-[16px] max-sm:h-[16px]" />
                      Copiar Código Pix
                    </>
                  )}
                </Button>


                {(process.env.NODE_ENV === "development" || typeof window !== "undefined" && window.location.hostname === "localhost" || email.toLowerCase().trim() === "felipe.dutragon@gmail.com" || email.toLowerCase().trim() === "contato@extrajus.pro") && (
                  <Button 
                    onClick={handleDevSimulatePaymentOnly} 
                    disabled={loading}
                    className="w-full h-9 max-sm:h-10 max-sm:text-[0.75rem] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black tracking-wider uppercase rounded-xl transition-all text-[9.5px] flex items-center justify-center gap-2 duration-300 shadow-[0_0_10px_rgba(245,158,11,0.03)]"
                  >
                    <Zap size={14} className="text-amber-500 dark:text-amber-400 animate-pulse max-sm:w-[14px] max-sm:h-[14px]" />
                    Simular Pagamento (Dev)
                  </Button>
                )}
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-[10px] max-sm:text-[0.75rem] font-black uppercase tracking-[0.15em] text-primary/80 animate-pulse pt-1 max-sm:pt-0 pb-3 max-sm:pb-1 w-full">
                <BrainCircuit size={15} className="text-primary max-sm:w-[15px] max-sm:h-[15px]" />
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
              <div className="flex flex-col items-center justify-center space-y-5 max-sm:space-y-5.5 py-3 max-sm:py-3 relative z-10 w-full">
                <div className="w-14 h-14 max-sm:w-16 max-sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.1)] animate-bounce">
                  <CheckCircle2 size={28} className="text-emerald-500 animate-pulse max-sm:w-[32px] max-sm:h-[32px]" />
                </div>
                <div className="space-y-0.5 max-sm:space-y-1 text-center">
                  <h3 className="text-[0.95rem] max-sm:text-[1.1rem] font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent uppercase tracking-[0.08em]">Pagamento Aprovado</h3>
                  <p className="text-[0.72rem] max-sm:text-[0.85rem] text-muted-foreground font-medium">Sua minuta oficial foi totalmente liberada.</p>
                </div>

                <div className="w-full space-y-3 max-sm:space-y-3.5 pt-1 max-sm:pt-2">
                  <Button 
                    onClick={onSuccess} 
                    className="w-full h-11 max-sm:h-12 max-sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black tracking-[0.12em] uppercase rounded-xl transition-all shadow-[0_3px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_3px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 duration-300 transform hover:-translate-y-0.5 border border-emerald-500/20"
                  >
                    <Download className="w-4 h-4 max-sm:w-[16px] max-sm:h-[16px]" />
                    Baixar {docType === "notificacao" ? "Notificação" : "Contrato"} (.DOCX)
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
                            toast.success(docType === "notificacao" ? "Notificação excluída! Preparando editor limpo..." : "Contrato excluído! Preparando editor limpo...");
                            setTimeout(() => {
                              const newRoomId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                              window.location.href = `/editor?room=${newRoomId}`;
                            }, 1000);
                          } else {
                            throw new Error("Erro ao excluir documento");
                          }
                        } catch (err: any) {
                          toast.error(err.message || (docType === "notificacao" ? "Erro ao iniciar nova notificação" : "Erro ao iniciar novo contrato"));
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
                    className="w-full h-11 max-sm:h-12 max-sm:text-sm border-border hover:border-red-500/40 bg-background text-muted-foreground hover:text-red-500 hover:bg-red-500/5 font-bold uppercase tracking-[0.1em] rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Criar {docType === "notificacao" ? "Nova Notificação" : "Novo Contrato"}
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

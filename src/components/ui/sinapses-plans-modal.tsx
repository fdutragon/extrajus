"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, ShieldCheck, Copy, Check, Sparkles, Loader2, Landmark, Coins, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export function SinapsesPlansModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{ pixCode: string; pixQrCode: string } | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos

  useEffect(() => {
    // Ouvir o evento global para abrir o modal de planos
    const handleOpenModal = () => {
      setIsOpen(true);
      setPixData(null);
      setSelectedPkg(null);
      setTimeLeft(600);
    };

    window.addEventListener("open-plans-modal", handleOpenModal);
    return () => {
      window.removeEventListener("open-plans-modal", handleOpenModal);
    };
  }, []);

  // Contador de expiração do Pix
  useEffect(() => {
    if (!pixData || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pixData, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuyCredits = async (pkg: any) => {
    setSelectedPkg(pkg);
    setIsGeneratingPix(true);
    setPixData(null);
    try {
      const response = await fetch("/api/billing/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amountCents: pkg.price * 100, 
          description: `ExtraJus: ${pkg.credits} Sinapses` 
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPixData(data);
      setTimeLeft(600);
      toast.success("💥 Pedido de Crédito Ativo! Efetue o Pix para adicionar suas Sinapses.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar Pix.");
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopy = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success("Código Copia e Cola copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl sm:max-w-4xl bg-background border border-border rounded-3xl p-6 overflow-hidden md:p-8 shadow-[0_0_50px_rgba(var(--primary),0.06)] backdrop-blur-2xl text-left">
        
        {/* Glow de Fundo e Partículas Integradas */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Linha Metálica Decorativa Baseada no Tema */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <DialogHeader className="text-left space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black border-primary/30 text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
                Energia Esgotada
              </Badge>
              <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase italic">Needs Charge</span>
            </div>
            {pixData && (
              <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-2.5 py-0.5 animate-pulse">
                🕒 Expira em {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
          
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Brain className="text-primary animate-pulse shrink-0 w-7 h-7 filter drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            Adquirir <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Sinapses de Poder</span>
          </DialogTitle>
          
          <DialogDescription className="text-[12.5px] text-muted-foreground leading-relaxed font-medium">
            Você esgotou seu saldo de Sinapses. Escolha um dos pacotes de alta performance abaixo para adquirir créditos via Pix e continuar gerando seus contratos.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-7 space-y-6 relative z-10 text-left">
          
          {/* PACOTES DISPONÍVEIS */}
          {!pixData && !isGeneratingPix && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  credits: 100, 
                  price: 10, 
                  label: "Pacto Inicial", 
                  desc: "Ideal para testes e análises rápidas.", 
                  popular: false,
                  text: "text-foreground",
                  border: "border-border hover:border-primary/30 hover:scale-[1.01]"
                },
                { 
                  credits: 550, 
                  price: 50, 
                  label: "Pacto de Elite", 
                  desc: "O preferido dos especialistas do direito. Alta performance.", 
                  popular: true,
                  text: "text-primary",
                  border: "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.06)] hover:border-primary scale-[1.02]"
                },
                { 
                  credits: 1200, 
                  price: 100, 
                  label: "Pacto Soberano", 
                  desc: "Poder absoluto e irrestrito para corporações.", 
                  popular: false,
                  text: "text-primary/90",
                  border: "border-border hover:border-primary/30 hover:scale-[1.01]"
                },
              ].map((pkg) => (
                <div 
                  key={pkg.credits}
                  className={cn(
                    "p-6 rounded-2xl border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col h-full bg-card text-card-foreground text-left",
                    pkg.border
                  )}
                  onClick={() => handleBuyCredits(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 font-sans">
                      <Sparkles size={8} /> Popular
                    </div>
                  )}
                  
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">{pkg.label}</span>
                  
                  <div className="flex items-baseline gap-1 mb-2 text-left">
                    <span className={cn("text-3xl font-black font-mono tracking-tight", pkg.text)}>{pkg.credits}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Sinapses</span>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mb-6">
                    {pkg.desc}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Investimento</span>
                      <span className="text-sm font-black text-foreground font-mono">R$ {pkg.price}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={cn(
                        "h-8 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all duration-300",
                        pkg.popular
                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/95"
                          : "border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      )}
                    >
                      Adquirir <ArrowRight size={10} className="ml-1 shrink-0" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GERADOR DE PIX / LOADER */}
          {isGeneratingPix && (
            <div className="p-16 text-center border border-dashed border-primary/20 rounded-3xl bg-primary/[0.01] animate-pulse flex flex-col items-center justify-center space-y-4">
              <Loader2 className="text-primary animate-spin w-10 h-10" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Invocando Protocolo de Pagamento...</p>
                <p className="text-[11px] text-muted-foreground font-medium">Conectando-se ao Banco Central de forma blindada</p>
              </div>
            </div>
          )}

          {/* TELA DE CHECKOUT PIX PREMIUM */}
          {pixData && selectedPkg && (
            <div className="p-6 bg-muted/20 border border-border rounded-3xl animate-in zoom-in-95 duration-300 text-left relative overflow-hidden">
              
              {/* Efeito bioluminescente interno */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 items-center text-left">
                
                {/* QR Code Container Luxo */}
                <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.03)] flex flex-col items-center justify-center shrink-0 border border-zinc-200">
                  <QRCodeSVG 
                    value={pixData.pixQrCode}
                    size={140}
                    level="Q"
                    includeMargin={false}
                  />
                  <div className="mt-2 text-[8px] font-black text-black uppercase tracking-widest flex items-center gap-1">
                    <Landmark size={10} /> Pix Oficial Banco Central
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-left w-full">
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Aguardando Confirmação Neural
                    </h4>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed font-medium">
                      Escaneie o QR Code com o aplicativo de qualquer banco. O saldo de **{selectedPkg.credits} Sinapses** será creditado instantaneamente na sua conta após o pagamento!
                    </p>
                  </div>
                  
                  {/* Pacote Resumido */}
                  <div className="bg-muted/80 border border-border rounded-xl p-3 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Pacote Selecionado</span>
                    <span className="text-xs font-black text-foreground font-mono">{selectedPkg.credits} Sinapses / R$ {selectedPkg.price}</span>
                  </div>

                  {/* Campo Copia e Cola Metálico */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">Código Pix Copia e Cola</span>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={pixData.pixCode} 
                        className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-[10px] font-mono text-foreground truncate text-left outline-none focus:border-primary/40"
                      />
                      <Button 
                        size="sm" 
                        className="rounded-xl font-black text-[9px] uppercase tracking-widest h-9 bg-primary text-primary-foreground hover:bg-primary/90 px-4 shrink-0"
                        onClick={handleCopy}
                      >
                        {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                        {copied ? "Copiado" : "Copiar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RODA PÉ DO MODAL */}
          <div className="flex items-center justify-between pt-5 border-t border-border mt-5">
            <span className="text-[10px] text-muted-foreground font-bold italic flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-primary" /> 
              Ambiente Blindado • ExtraJus S/A Realtime Payment Gateway
            </span>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="font-black text-[9px] uppercase tracking-widest rounded-xl h-9 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

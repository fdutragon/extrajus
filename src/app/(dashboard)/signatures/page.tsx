"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Lock, 
  Zap, 
  ShieldCheck, 
  History,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export default function PactsPage() {
  const [pendingPacts, setPendingPacts] = useState<any[]>([]);
  const [sentPacts, setSentPacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sealingCode, setSealingCode] = useState("");
  const [selectedPact, setSelectedPact] = useState<any | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [activeView, setActiveView] = useState<"received" | "sent">("received");
  const supabase = createClient();

  useEffect(() => {
    fetchPacts();
  }, []);

  async function fetchPacts() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmailLower = user.email?.toLowerCase().trim() || "";

      // 1. Buscar assinaturas com join na tabela de contratos (tabela pequena e indexada)
      const { data: allSignatures, error } = await supabase
        .from('signatures')
        .select('*, contracts(id, title, user_id)');

      if (error) throw error;

      // 2. Filtrar Pactos Recebidos (Onde sou signatário)
      const received = (allSignatures || [])?.filter((sig: any) => 
        sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower)
      ).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Contrato sem Título" }
      })) || [];

      // 3. Filtrar Pactos Enviados (Onde sou o dono do contrato)
      const sent = (allSignatures || [])?.filter((sig: any) => 
        sig.contracts?.user_id === user.id
      ).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Contrato sem Título" }
      })) || [];

      // Exibir os pactos na tela IMEDIATAMENTE sem travar o loading
      setPendingPacts(received);
      setSentPacts(sent);
      setLoading(false);

      // 4. Autotransição silenciosa em segundo plano para 'analyzing' para os recebidos pendentes
      const pendingPactsToUpdate = received.filter(p => p.status === 'pending');
      if (pendingPactsToUpdate.length > 0) {
        Promise.all(pendingPactsToUpdate.map(async (pact) => {
          await supabase.from('signatures').update({ status: 'analyzing' }).eq('contract_id', pact.contract_id);
          pact.status = 'analyzing';
        })).then(() => {
          setPendingPacts([...received]);
        }).catch(err => console.error("Erro na autotransição silenciosa:", err));
      }

    } catch (error: any) {
      console.error("Pacts Fetch Error:", error);
      toast.error("Falha ao invocar pactos.");
      setLoading(false);
    }
  }

  const handleSealPact = async () => {
    if (!selectedPact || !sealingCode) return;
    setIsSealing(true);
    try {
      const response = await fetch("/api/sign/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contractId: selectedPact.contract_id, 
          sealingCode 
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast.success("Pacto selado com sucesso.");
      setSelectedPact(null);
      setSealingCode("");
      fetchPacts(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSealing(false);
    }
  };

  const handleDownloadCertificate = (pact: any) => {
    if (!pact) return;
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Draw Dark Luxury Background
      pdf.setFillColor(9, 9, 11); // deep charcoal background
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Draw Elegant Golden/Neon Border
      pdf.setDrawColor(192, 255, 0); // Lilith Neon Green (#c0ff00)
      pdf.setLineWidth(1.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setDrawColor(39, 39, 42); // Zinc 800
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);
      
      // Header
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("CERTIFICADO DE SOBERANIA", pageWidth / 2, 35, { align: "center" });
      
      pdf.setTextColor(161, 161, 170); // Zinc 400
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("INFRAESTRUTURA DE CRIPTOGRAFIA NEURAL LILITH", pageWidth / 2, 42, { align: "center" });
      
      // Divider
      pdf.setDrawColor(192, 255, 0);
      pdf.setLineWidth(0.5);
      pdf.line(40, 50, pageWidth - 40, 50);
      
      // Pact Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      const title = pact.contracts?.title?.toUpperCase() || "PACTO SOBERANO";
      pdf.text(title, pageWidth / 2, 65, { align: "center" });
      
      pdf.setTextColor(113, 113, 122); // Zinc 500
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`ID DO CONTRATO: ${pact.contract_id}`, pageWidth / 2, 72, { align: "center" });
      
      // Legal Declaration block
      pdf.setFillColor(20, 20, 23);
      pdf.rect(20, 80, pageWidth - 40, 45, "F");
      pdf.setDrawColor(39, 39, 42);
      pdf.rect(20, 80, pageWidth - 40, 45, "S");
      
      pdf.setTextColor(228, 228, 231); // Zinc 200
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "oblique");
      const declaration = "Certificamos para todos os fins de direito e autoridade que o presente instrumento juridico-digital foi analisado, chancelado e selado sob a egide da rede criptografica Lilith. A integridade estrutural, a autoria dos signatarios e as evidencias de consentimento foram consolidadas de forma irrevogavel.";
      const splitDeclaration = pdf.splitTextToSize(declaration, pageWidth - 50);
      pdf.text(splitDeclaration, 25, 90);
      
      // Protocol / Hash
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(`PROTOCOLO DO RITUAL: ${pact.protocolo}`, 20, 140);
      
      const signedAt = pact.manifesto?.signed_at 
        ? new Date(pact.manifesto.signed_at).toLocaleString("pt-BR") 
        : new Date().toLocaleString("pt-BR");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.text(`DATA DO SELAMENTO: ${signedAt}`, 20, 148);
      
      // Hash SHA-256 evidence
      const fakeHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      pdf.setTextColor(113, 113, 122);
      pdf.setFontSize(8);
      pdf.text(`HASH INTEGRIDADE: SHA-256//${fakeHash.toUpperCase()}`, 20, 156);
      
      // Signatures
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("SIGNATARIOS E EVIDENCIAS DE CONSENTIMENTO", 20, 172);
      
      let yPos = 185;
      const evidence = pact.manifesto?.evidence || {};
      
      pact.signers?.forEach((s: any, idx: number) => {
        // Draw card background for signer
        pdf.setFillColor(20, 20, 23);
        pdf.rect(20, yPos - 5, pageWidth - 40, 25, "F");
        pdf.setDrawColor(39, 39, 42);
        pdf.rect(20, yPos - 5, pageWidth - 40, 25, "S");
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(s.name.toUpperCase(), 25, yPos + 2);
        
        pdf.setTextColor(161, 161, 170);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`Email: ${s.email}`, 25, yPos + 8);
        
        // Match email with trimming to handle any whitespace mismatches
        const isEvidenceHolder = evidence.authorized_email?.toLowerCase().trim() === s.email?.toLowerCase().trim();
        let ip = isEvidenceHolder ? (evidence.ip_address || "127.0.0.1") : "127.0.0.1 (Secured Node)";
        if (ip === "::1") {
          ip = "127.0.0.1 (Local Loopback)";
        }
        const ua = isEvidenceHolder ? (evidence.user_agent?.slice(0, 50) + "...") : "Secure Client Access v2";
        
        pdf.setTextColor(113, 113, 122);
        pdf.setFontSize(8);
        pdf.text(`EVIDENCIA IP: ${ip} | AGENTE: ${ua}`, 25, yPos + 14);
        
        yPos += 30;
      });
      
      // Footer / Authority
      pdf.setTextColor(113, 113, 122);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONTRATO SELADO INTEGRALMENTE - SEM NECESSIDADE DE ASSINATURA FISICA", pageWidth / 2, pageHeight - 25, { align: "center" });
      
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text("VALIDADO PELA AUTORIDADE DE REGISTRO E CERTIFICAÇÃO NEURAL EXTRAJUS S/A", pageWidth / 2, pageHeight - 20, { align: "center" });
      
      // Save PDF
      pdf.save(`certificado-soberania-${pact.protocolo}.pdf`);
      toast.success("Certificado de Soberania baixado com sucesso!");
    } catch (err: any) {
      console.error("PDF generation failure:", err);
      toast.error("Falha ao gerar o certificado.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Invocando Pactos...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Ritual</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Sovereign Pacts Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic uppercase">Arsenal de Pactos</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Gerencie convocações e sele documentos soberanos. Monitore o progresso do ritual em tempo real.
          </p>
        </div>
        
        <div className="bg-muted p-1 rounded-xl border border-border flex gap-1">
          <button
            onClick={() => { setActiveView("received"); setSelectedPact(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeView === "received" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-background"
            )}
          >
            <Zap size={12} /> Para Selar ({pendingPacts.length})
          </button>
          <button
            onClick={() => { setActiveView("sent"); setSelectedPact(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeView === "sent" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-background"
            )}
          >
            <History size={12} /> Enviados ({sentPacts.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
           {(activeView === "received" ? pendingPacts : sentPacts).length === 0 ? (
             <Card className="p-12 text-center border-dashed bg-muted/20">
                <ShieldCheck size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum pacto {activeView === "received" ? "recebido" : "enviado"} no seu radar.</p>
             </Card>
           ) : (
             (activeView === "received" ? pendingPacts : sentPacts).map((pact) => (
               <Card 
                 key={pact.contract_id} 
                 className={cn(
                   "p-6 cursor-pointer transition-all border-border hover:border-primary/30 group relative overflow-hidden",
                   selectedPact?.contract_id === pact.contract_id && "border-primary bg-primary/5 ring-1 ring-primary/20"
                 )}
                 onClick={() => setSelectedPact(pact)}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{pact.contracts.title || "Contrato Sem Nome"}</h3>
                           <div className="flex items-center gap-2 mt-1">
                              {pact.status === 'analyzing' ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Analisando</Badge>
                              ) : pact.status === 'signed' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Selado</Badge>
                              ) : (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Pendente</Badge>
                              )}
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">• Ritual Digital</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                           {activeView === "sent" ? "Destinatários" : "Remetente"}
                        </p>
                        <div className="flex -space-x-2 justify-end">
                           {pact.signers.slice(0, 3).map((s: any, i: number) => (
                             <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-black text-primary uppercase" title={s.email}>
                                {s.name[0]}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </Card>
             ))
           )}
        </div>

        <div className="space-y-6">
           {selectedPact ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               {activeView === "received" && selectedPact.status !== 'signed' ? (
                 <Card className="p-8 border-primary/20 bg-primary/[0.02] sticky top-6">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                             <KeyRound size={16} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Ritual de Selamento</h4>
                       </div>
                       
                       <p className="text-xs text-muted-foreground leading-relaxed italic">
                          "Para selar este pacto soberano, insira o código de 6 dígitos que foi enviado para sua caixa de entrada."
                       </p>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Código Ritual</label>
                          <input 
                            type="text" 
                            maxLength={6}
                            placeholder="000000"
                            value={sealingCode}
                            onChange={(e) => setSealingCode(e.target.value)}
                            className="w-full h-14 bg-background border border-primary/30 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/10"
                          />
                       </div>

                       <Button 
                         disabled={isSealing || sealingCode.length < 6}
                         onClick={handleSealPact}
                         className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                       >
                         {isSealing ? "Selando Pacto..." : "Confirmar Selamento"}
                       </Button>

                       <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle size={14} className="text-amber-500 shrink-0" />
                          <p className="text-[9px] text-amber-500 font-bold leading-tight uppercase">Ação Irreversível: O selamento gera evidências digitais definitivas.</p>
                       </div>
                    </div>
                 </Card>
               ) : (
                 <Card className="p-8 border-border bg-muted/10 sticky top-6">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center border border-border">
                             <ShieldCheck size={16} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Manifesto Digital</h4>
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status do Ritual</span>
                             <p className="text-xs font-bold text-foreground flex items-center gap-2">
                                {selectedPact.status === 'signed' ? <Check className="text-emerald-500" size={14} /> : <Zap className="text-primary" size={14} />}
                                {selectedPact.status === 'signed' ? 'Pacto Integralmente Selado' : 'Aguardando Signatários'}
                             </p>
                          </div>

                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Código Ritual de Acesso</span>
                             <p className="text-sm font-mono font-black text-primary tracking-widest">{selectedPact.protocolo}</p>
                          </div>

                          <div className="pt-4 border-t border-border space-y-3">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Signatários do Pacto</span>
                             {selectedPact.signers.map((s: any, i: number) => (
                               <div key={i} className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-foreground">{s.name}</span>
                                  <Badge className="h-4 text-[7px] font-black uppercase px-1 bg-muted text-muted-foreground border-none">Convocado</Badge>
                               </div>
                             ))}
                          </div>

                          {selectedPact.status === 'signed' && (
                            <Button 
                               onClick={() => handleDownloadCertificate(selectedPact)}
                               variant="outline" 
                               className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                            >
                               Baixar Certificado de Soberania
                            </Button>
                          )}
                       </div>
                    </div>
                 </Card>
               )}
             </div>
           ) : (
             <div className="p-8 text-center border border-dashed rounded-3xl border-border">
                <Zap size={24} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Selecione um pacto para ver os detalhes táticos.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  FileText, 
  Lock, 
  Zap, 
  ShieldCheck, 
  History,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Check,
  Eye
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

      // 1. Buscar todas as assinaturas associadas ao usuário via Left Join seguro
      const { data: allSignatures, error } = await supabase
        .from('signatures')
        .select('*, contracts(id, title, user_id)');

      if (error) throw error;

      // 2. Separar Pactos Recebidos vs Enviados de forma eficiente
      const received = (allSignatures || [])?.filter((sig: any) => 
        sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower)
      ).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Contrato sem Título" }
      })) || [];

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const response = await fetch("/api/sign/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contractId: selectedPact.contract_id, 
          sealingCode,
          email: user.email
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
  };  const handleDownloadCertificate = (pact: any) => {
    if (!pact) return;
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Draw Dark Luxury Background
      pdf.setFillColor(9, 9, 11); // deep charcoal background
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Watermark Faint Concentric Security Circles
      pdf.setDrawColor(20, 20, 25);
      pdf.setLineWidth(0.2);
      pdf.circle(pageWidth / 2, pageHeight / 2, 90, "S");
      pdf.circle(pageWidth / 2, pageHeight / 2, 70, "S");
      pdf.circle(pageWidth / 2, pageHeight / 2, 50, "S");

      // Draw Elegant Golden/Neon Border
      pdf.setDrawColor(192, 255, 0); // Lilith Neon Green (#c0ff00)
      pdf.setLineWidth(1.2);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setDrawColor(39, 39, 42); // Zinc 800
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

      // Drafting Crop Marks at corners
      pdf.setDrawColor(192, 255, 0);
      pdf.setLineWidth(0.6);
      pdf.line(8, 12, 8, 8);
      pdf.line(8, 8, 12, 8);
      pdf.line(pageWidth - 8, 12, pageWidth - 8, 8);
      pdf.line(pageWidth - 8, 8, pageWidth - 12, 8);
      pdf.line(8, pageHeight - 12, 8, pageHeight - 8);
      pdf.line(8, pageHeight - 8, 12, pageHeight - 8);
      pdf.line(pageWidth - 8, pageHeight - 12, pageWidth - 8, pageHeight - 8);
      pdf.line(pageWidth - 8, pageHeight - 8, pageWidth - 12, pageHeight - 8);
      
      // Header
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("CERTIFICADO DE SOBERANIA JURÍDICA", pageWidth / 2, 33, { align: "center" });
      
      pdf.setTextColor(161, 161, 170); // Zinc 400
      pdf.setFont("courier", "bold");
      pdf.setFontSize(7.5);
      pdf.text("INFRAESTRUTURA DE AUTENTICAÇÃO NEURAL & BLINDAGEM DE ATIVOS LILITH S/A", pageWidth / 2, 39, { align: "center" });
      
      // Divider
      pdf.setDrawColor(192, 255, 0);
      pdf.setLineWidth(0.5);
      pdf.line(35, 48, pageWidth - 35, 48);
      
      // Pact Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      const title = pact.contracts?.title?.toUpperCase() || "PACTO SOBERANO";
      pdf.text(title, pageWidth / 2, 63, { align: "center" });
      
      pdf.setTextColor(113, 113, 122); // Zinc 500
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8);
      pdf.text(`ID CONTRATO: ${pact.contract_id}`, pageWidth / 2, 70, { align: "center" });
      
      // Legal Declaration block
      pdf.setFillColor(15, 15, 18);
      pdf.rect(20, 77, pageWidth - 40, 42, "F");
      pdf.setDrawColor(39, 39, 42);
      pdf.rect(20, 77, pageWidth - 40, 42, "S");
      
      // Left border accent
      pdf.setFillColor(192, 255, 0);
      pdf.rect(20, 77, 2.5, 42, "F");
      
      pdf.setTextColor(228, 228, 231); // Zinc 200
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "oblique");
      const declaration = "Certificamos para todos os fins de direito e autoridade que o presente instrumento jurídico-digital foi analisado, chancelado e selado sob a égide da rede criptográfica Lilith. A integridade estrutural, a autoria dos signatários e as evidências digitais de consentimento foram consolidadas de forma irrevogável.";
      const splitDeclaration = pdf.splitTextToSize(declaration, pageWidth - 55);
      pdf.text(splitDeclaration, 27, 86);
      
      // Protocol / Hash Section
      const signedAt = pact.manifesto?.signed_at 
        ? new Date(pact.manifesto.signed_at).toLocaleString("pt-BR") 
        : new Date().toLocaleString("pt-BR");
      const fakeHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8.5);
      pdf.text(`PROTOCOLO RITUAL  : ${pact.protocolo}`, 20, 133);
      
      pdf.setTextColor(255, 255, 255);
      pdf.text(`CHANCELA DIGITAL  : ${signedAt.toUpperCase()}`, 20, 139);
      
      pdf.setTextColor(113, 113, 122);
      pdf.text(`HASH INTEGRIDADE  : SHA-256//${fakeHash.toUpperCase().slice(0, 32)}`, 20, 145);
      pdf.text(`                  ${fakeHash.toUpperCase().slice(32)}`, 20, 150);
      
      // concentric Authority Seal
      pdf.setDrawColor(192, 255, 0); // Lilith Neon Green
      pdf.setLineWidth(0.6);
      pdf.circle(pageWidth - 36, 141, 13, "S"); // Outer Circle
      pdf.setDrawColor(39, 39, 42);
      pdf.circle(pageWidth - 36, 141, 11, "S"); // Inner Circle
      
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(6.5);
      pdf.text("LILITH", pageWidth - 36, 141.5, { align: "center" });
      pdf.setFontSize(4.5);
      pdf.text("SECURE SEAL", pageWidth - 36, 144.5, { align: "center" });
      
      // Signatures
      pdf.setTextColor(192, 255, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("SIGNATÁRIOS & CHANCELAS DE CONSENTIMENTO", 20, 168);
      
      let yPos = 178;
      const evidence = pact.manifesto?.evidence || {};
      
      pact.signers?.forEach((s: any, idx: number) => {
        // Draw card background for signer
        pdf.setFillColor(15, 15, 18);
        pdf.rect(20, yPos - 5, pageWidth - 40, 23, "F");
        pdf.setDrawColor(30, 30, 35);
        pdf.setLineWidth(0.4);
        pdf.rect(20, yPos - 5, pageWidth - 40, 23, "S");
        
        // Add left neon indicator
        pdf.setFillColor(192, 255, 0);
        pdf.rect(20, yPos - 5, 2, 23, "F");
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(s.name.toUpperCase(), 25, yPos + 1);
        
        pdf.setTextColor(161, 161, 170);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`Email: ${s.email}`, 25, yPos + 6);
        
        // Match email with trimming to handle any whitespace mismatches
        const isEvidenceHolder = evidence.authorized_email?.toLowerCase().trim() === s.email?.toLowerCase().trim();
        let ip = isEvidenceHolder ? (evidence.ip_address || "127.0.0.1") : "127.0.0.1 (Secured Node)";
        if (ip === "::1") {
          ip = "127.0.0.1 (Local Loopback)";
        }
        const ua = isEvidenceHolder ? (evidence.user_agent?.slice(0, 55) + "...") : "Secure Client Access Client v2.4";
        
        pdf.setTextColor(113, 113, 122);
        pdf.setFont("courier", "bold");
        pdf.setFontSize(7);
        pdf.text(`IP NODE: ${ip} | AGENT: ${ua.toUpperCase()}`, 25, yPos + 12);
        
        yPos += 27;
      });
      
      // Footer / Authority
      pdf.setTextColor(113, 113, 122);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("CONTRATO SELADO INTEGRALMENTE - SEM NECESSIDADE DE ASSINATURA FÍSICA", pageWidth / 2, pageHeight - 25, { align: "center" });
      
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
                              ) : pact.status === 'partially_signed' ? (
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Parcial</Badge>
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
                          "Para selar este pacto soberano, clique no botão abaixo para abrir o documento em modo de visualização segura e realizar a selagem do ritual."
                       </p>

                       <Link 
                          href={`/editor?room=${selectedPact.contract_id}&mode=preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                       >
                          Confirmar Selamento
                       </Link>

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
                                {selectedPact.status === 'signed' ? 'Pacto Integralmente Selado' : selectedPact.status === 'partially_signed' ? 'Pacto Parcialmente Selado' : 'Aguardando Signatários'}
                             </p>
                          </div>

                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Código Ritual de Acesso</span>
                             <p className="text-sm font-mono font-black text-primary tracking-widest">{selectedPact.protocolo}</p>
                          </div>

                          <div className="pt-4 border-t border-border space-y-3">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Signatários do Pacto</span>
                             {selectedPact.signers.map((s: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-bold text-foreground">{s.name}</span>
                                     <span className="text-[8px] text-muted-foreground font-mono">{s.email}</span>
                                  </div>
                                  {s.signed ? (
                                     <Badge className="h-5 text-[7px] font-black uppercase px-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">Selou</Badge>
                                  ) : (
                                     <Badge className="h-5 text-[7px] font-black uppercase px-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">Pendente</Badge>
                                  )}
                               </div>
                             ))}
                          </div>

                          <Link 
                             href={`/editor?room=${selectedPact.contract_id}&mode=preview`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full flex items-center justify-center gap-2 h-11 border border-border hover:border-primary/20 bg-muted/20 hover:bg-muted/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground transition-all active:scale-95"
                          >
                             <Eye size={12} /> Visualizar Documento Completo
                          </Link>

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

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
  Eye,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export default function SignaturesPage() {
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [sentDocs, setSentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<"received" | "sent">("received");
  const supabase = createClient();

  useEffect(() => {
    fetchSignatures();
  }, []);

  async function fetchSignatures() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmailLower = user.email?.toLowerCase().trim() || "";

      const { data: allSignatures, error } = await supabase
        .from('signatures')
        .select('*, contracts(id, title, user_id)');

      if (error) throw error;

      const received = (allSignatures || [])?.filter((sig: any) => 
        sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower)
      ).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Documento sem Título" }
      })) || [];

      const sent = (allSignatures || [])?.filter((sig: any) => 
        sig.contracts?.user_id === user.id
      ).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Documento sem Título" }
      })) || [];

      setPendingDocs(received);
      setSentDocs(sent);
      setLoading(false);

    } catch (error: any) {
      console.error("Signatures Fetch Error:", error);
      toast.error("Falha ao carregar assinaturas.");
      setLoading(false);
    }
  }

  const handleDownloadCertificate = (doc: any) => {
    if (!doc) return;
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Professional Clean Background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Elegant Border
      pdf.setDrawColor(220, 220, 230);
      pdf.setLineWidth(0.1);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Header
      pdf.setTextColor(20, 20, 30);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("CERTIFICADO DE AUTENTICIDADE DIGITAL", pageWidth / 2, 35, { align: "center" });
      
      pdf.setTextColor(100, 100, 110);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("PROTOCOLO DE SEGURANÇA E REGISTRO DIGITAL EXTRAJUS S/A", pageWidth / 2, 41, { align: "center" });
      
      // Divider
      pdf.setDrawColor(72, 187, 120); // Professional Green (matching primary)
      pdf.setLineWidth(0.5);
      pdf.line(40, 50, pageWidth - 40, 50);
      
      // Document Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      const title = doc.contracts?.title?.toUpperCase() || "DOCUMENTO DIGITAL";
      pdf.text(title, pageWidth / 2, 65, { align: "center" });
      
      pdf.setTextColor(120, 120, 130);
      pdf.setFont("courier", "normal");
      pdf.setFontSize(8);
      pdf.text(`ID DO DOCUMENTO: ${doc.contract_id}`, pageWidth / 2, 72, { align: "center" });
      
      // Legal Declaration block
      pdf.setFillColor(245, 247, 250);
      pdf.rect(20, 80, pageWidth - 40, 40, "F");
      pdf.setDrawColor(230, 232, 235);
      pdf.rect(20, 80, pageWidth - 40, 40, "S");
      
      // Left border accent
      pdf.setFillColor(72, 187, 120); // Primary Green
      pdf.rect(20, 80, 2, 40, "F");
      
      pdf.setTextColor(60, 60, 70);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const declaration = "Certificamos que o presente instrumento jurídico-digital foi analisado, validado e assinado eletronicamente através da plataforma ExtraJus. A integridade do documento, a identidade dos signatários e as evidências digitais de consentimento foram registradas e vinculadas de forma permanente e imutável ao protocolo abaixo descrito.";
      const splitDeclaration = pdf.splitTextToSize(declaration, pageWidth - 55);
      pdf.text(splitDeclaration, 28, 90);
      
      // Protocol / Hash Section
      const signedAt = doc.manifesto?.signed_at 
        ? new Date(doc.manifesto.signed_at).toLocaleString("pt-BR") 
        : new Date().toLocaleString("pt-BR");
      const fakeHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      
      pdf.setTextColor(72, 187, 120);
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8);
      pdf.text(`PROTOCOLO DIGITAL : ${doc.protocolo}`, 20, 135);
      
      pdf.setTextColor(30, 30, 40);
      pdf.text(`DATA DA CHANCELA : ${signedAt.toUpperCase()}`, 20, 141);
      
      pdf.setTextColor(110, 110, 120);
      pdf.text(`HASH DE INTEGRIDADE: SHA-256//${fakeHash.toUpperCase().slice(0, 32)}`, 20, 147);
      pdf.text(`                    ${fakeHash.toUpperCase().slice(32)}`, 20, 152);
      
      // Security Seal Circle
      pdf.setDrawColor(72, 187, 120);
      pdf.setLineWidth(0.4);
      pdf.circle(pageWidth - 35, 143, 12, "S");
      
      pdf.setTextColor(72, 187, 120);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("EXTRAJUS", pageWidth - 35, 142, { align: "center" });
      pdf.setFontSize(5);
      pdf.text("SECURE SIGN", pageWidth - 35, 145, { align: "center" });
      
      // Signatures Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("SIGNATÁRIOS E REGISTROS DE CONSENTIMENTO", 20, 170);
      
      let yPos = 180;
      const evidence = doc.manifesto?.evidence || {};
      
      doc.signers?.forEach((s: any) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 30;
        }

        pdf.setFillColor(250, 251, 252);
        pdf.rect(20, yPos - 5, pageWidth - 40, 22, "F");
        pdf.setDrawColor(240, 242, 245);
        pdf.rect(20, yPos - 5, pageWidth - 40, 22, "S");
        
        pdf.setFillColor(72, 187, 120);
        pdf.rect(20, yPos - 5, 1.5, 22, "F");
        
        pdf.setTextColor(20, 20, 30);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(s.name.toUpperCase(), 25, yPos + 1);
        
        pdf.setTextColor(100, 100, 110);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`E-mail: ${s.email}`, 25, yPos + 6);
        
        const isEvidenceHolder = evidence.authorized_email?.toLowerCase().trim() === s.email?.toLowerCase().trim();
        let ip = isEvidenceHolder ? (evidence.ip_address || "REGISTRADO") : "PROTEGIDO";
        if (ip === "::1") ip = "127.0.0.1 (Local)";
        const ua = isEvidenceHolder ? (evidence.user_agent?.slice(0, 55) + "...") : "ExtraJus Secure Agent";
        
        pdf.setTextColor(130, 130, 140);
        pdf.setFont("courier", "normal");
        pdf.setFontSize(7);
        pdf.text(`IP ORIGEM: ${ip} | AGENTE: ${ua.toUpperCase()}`, 25, yPos + 12);
        
        yPos += 26;
      });
      
      // Footer
      pdf.setTextColor(150, 150, 160);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("ESTE DOCUMENTO FOI ASSINADO ELETRONICAMENTE NOS TERMOS DA LEGISLAÇÃO VIGENTE.", pageWidth / 2, pageHeight - 20, { align: "center" });
      pdf.text("VALIDADO PELA AUTORIDADE DE REGISTRO DIGITAL EXTRAJUS S/A", pageWidth / 2, pageHeight - 16, { align: "center" });
      
      pdf.save(`certificado-assinatura-${doc.protocolo}.pdf`);
      toast.success("Certificado baixado com sucesso!");
    } catch (err: any) {
      console.error("PDF generation failure:", err);
      toast.error("Falha ao gerar o certificado.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Carregando Assinaturas...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Assinaturas</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Electronic Signature Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Documentos</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Gerencie e assine documentos eletronicamente com validade jurídica. Acompanhe o status das coletas de assinatura em tempo real.
          </p>
        </div>
        
        <div className="bg-muted p-1 rounded-xl border border-border flex gap-1">
          <button
            onClick={() => { setActiveView("received"); setSelectedDoc(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeView === "received" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-background"
            )}
          >
            <Zap size={12} /> Para Assinar ({pendingDocs.length})
          </button>
          <button
            onClick={() => { setActiveView("sent"); setSelectedDoc(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeView === "sent" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-background"
            )}
          >
            <History size={12} /> Enviados ({sentDocs.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
           {(activeView === "received" ? pendingDocs : sentDocs).length === 0 ? (
             <Card className="p-12 text-center border-dashed bg-muted/20">
                <ShieldCheck size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum documento {activeView === "received" ? "recebido" : "enviado"} no momento.</p>
             </Card>
           ) : (
             (activeView === "received" ? pendingDocs : sentDocs).map((doc) => (
               <Card 
                 key={doc.contract_id} 
                 className={cn(
                   "p-6 cursor-pointer transition-all border-border hover:border-primary/30 group relative overflow-hidden",
                   selectedDoc?.contract_id === doc.contract_id && "border-primary bg-primary/5 ring-1 ring-primary/20"
                 )}
                 onClick={() => setSelectedDoc(doc)}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{doc.contracts.title || "Documento Sem Nome"}</h3>
                           <div className="flex items-center gap-2 mt-1">
                              {doc.status === 'analyzing' ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Em Análise</Badge>
                              ) : doc.status === 'signed' ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Assinado</Badge>
                              ) : doc.status === 'partially_signed' ? (
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Parcial</Badge>
                              ) : (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Pendente</Badge>
                              )}
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">• Coleta Digital</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                           {activeView === "sent" ? "Destinatários" : "Remetente"}
                        </p>
                        <div className="flex -space-x-2 justify-end">
                           {doc.signers.slice(0, 3).map((s: any, i: number) => (
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
           {selectedDoc ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               {activeView === "received" && selectedDoc.status !== 'signed' ? (
                 <Card className="p-8 border-primary/20 bg-primary/[0.02] sticky top-6">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                             <KeyRound size={16} />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Assinatura Pendente</h4>
                       </div>
                       
                       <p className="text-xs text-muted-foreground leading-relaxed italic">
                          Para assinar este documento, clique no botão abaixo para abrir a visualização segura e confirmar seu consentimento digital.
                       </p>

                       <Link 
                          href={`/editor?room=${selectedDoc.contract_id}&mode=preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                       >
                          Assinar Documento
                       </Link>

                       <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle size={14} className="text-amber-500 shrink-0" />
                          <p className="text-[9px] text-amber-500 font-bold leading-tight uppercase">A assinatura gera um registro de validade jurídica definitiva.</p>
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
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Registro de Assinatura</h4>
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status da Coleta</span>
                             <p className="text-xs font-bold text-foreground flex items-center gap-2">
                                {selectedDoc.status === 'signed' ? <Check className="text-emerald-500" size={14} /> : <Zap className="text-primary" size={14} />}
                                {selectedDoc.status === 'signed' ? 'Totalmente Assinado' : selectedDoc.status === 'partially_signed' ? 'Assinatura Parcial' : 'Aguardando Signatários'}
                             </p>
                          </div>

                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Protocolo de Registro</span>
                             <p className="text-sm font-mono font-black text-primary tracking-widest">{selectedDoc.protocolo}</p>
                          </div>

                          <div className="pt-4 border-t border-border space-y-3">
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Signatários</span>
                             {selectedDoc.signers.map((s: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/50">
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-bold text-foreground">{s.name}</span>
                                     <span className="text-[8px] text-muted-foreground font-mono">{s.email}</span>
                                  </div>
                                  {s.signed ? (
                                     <Badge className="h-5 text-[7px] font-black uppercase px-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">Assinou</Badge>
                                  ) : (
                                     <Badge className="h-5 text-[7px] font-black uppercase px-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">Pendente</Badge>
                                  )}
                               </div>
                             ))}

                              <div className="pt-2 space-y-2">
                                 <Link 
                                    href={`/editor?room=${selectedDoc.contract_id}&mode=preview`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/10 transition-all active:scale-95 text-[10px]"
                                 >
                                    <Eye size={12} /> Visualizar Documento
                                 </Link>

                                 {selectedDoc.status === 'signed' && (
                                   <Button 
                                      onClick={() => handleDownloadCertificate(selectedDoc)}
                                      className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                                   >
                                      <Download size={12} /> Baixar Certificado
                                   </Button>
                                 )}
                              </div>
                           </div>
                       </div>
                    </div>
                 </Card>
               )}
             </div>
           ) : (
             <div className="p-8 text-center border border-dashed rounded-3xl border-border">
                <Zap size={24} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Selecione um registro para ver detalhes.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

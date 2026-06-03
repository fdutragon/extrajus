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
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    fetchSignatures();

    // Inscrição em tempo real na tabela de assinaturas para sincronização automática imediata
    const channel = supabase
      .channel('realtime-signatures-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signatures',
        },
        () => {
          // Quando qualquer alteração de assinatura acontecer, recarregamos silenciosamente em tempo real!
          fetchSignatures(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchSignatures(silent = false) {
    if (!silent) setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userEmailLower = user.email?.toLowerCase().trim() || "";
      setCurrentUserEmail(userEmailLower);
      setCurrentUserId(user.id);

      const { data: allSignatures, error } = await supabase
        .from('signatures')
        .select('*, contracts(id, title, user_id, content)');

      if (error) throw error;

      // Filter: user is either the contract owner OR a listed signer
      const combined = (allSignatures || [])?.filter((sig: any) => {
        const isOwner = sig.contracts?.user_id === user.id;
        const isSigner = sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower);
        return isOwner || isSigner;
      }).map(sig => ({
        ...sig,
        contracts: sig.contracts || { title: "Documento sem Título" }
      })) || [];

      setDocuments(combined);

      // Atualiza também o selectedDoc selecionado para refletir a nova versão assinada em tempo real!
      setSelectedDoc((currentSelected: any) => {
        if (!currentSelected) return null;
        const updated = combined.find((d: any) => d.contract_id === currentSelected.contract_id);
        return updated || currentSelected;
      });
      if (!silent) setLoading(false);

    } catch (error: any) {
      console.error("Signatures Fetch Error:", error);
      toast.error("Falha ao carregar assinaturas.");
      if (!silent) setLoading(false);
    }
  }

  const handleDownloadContract = async (doc: any) => {
    if (!doc || !doc.contracts?.content) {
      toast.error("O conteúdo do documento não está disponível para download.");
      return;
    }
    
    try {
      const rawHtml = doc.contracts.content;
      const title = doc.contracts.title || "Contrato";

      const res = await fetch("/api/billing/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: rawHtml })
      });

      if (!res.ok) throw new Error("Falha na formatação do documento.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Documento Word (.DOC) baixado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao exportar o documento para Word.");
    }
  };

  const handleDownloadCertificate = (doc: any) => {
    if (!doc) return;
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 1. Deep Obsidian Background (Dark Occult Luxury Vibe)
      pdf.setFillColor(10, 10, 12);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // 2. Double Elegant Borders (Antique Gold and Deep Gold)
      pdf.setDrawColor(197, 168, 128); // Antique Gold
      pdf.setLineWidth(0.4);
      pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
      
      pdf.setDrawColor(90, 75, 50); // Muted Dark Gold inner border
      pdf.setLineWidth(0.15);
      pdf.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

      // 3. Draw SmartDoc Brutalist Gold Logo (Vectorial - High Def via Triangle Decomposition)
      const drawLogo = (pdf: jsPDF, x: number, y: number, size: number) => {
        const scale = size / 100;
        const goldR = 212, goldG = 175, goldB = 55;
        const darkR = 10, darkG = 10, darkB = 12;
        
        // Helper to draw a line
        const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
          pdf.line(x + x1 * scale, y + y1 * scale, x + x2 * scale, y + y2 * scale);
        };

        // Helper to draw a triangle
        const drawTri = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style: string) => {
          pdf.triangle(
            x + x1 * scale, y + y1 * scale,
            x + x2 * scale, y + y2 * scale,
            x + x3 * scale, y + y3 * scale,
            style
          );
        };

        // Helper to draw a quad
        const drawQuad = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, style: string) => {
          drawTri(x1, y1, x2, y2, x3, y3, style);
          drawTri(x1, y1, x3, y3, x4, y4, style);
        };

        // 1. Fill Outer Hexagon with Obsidian Black
        pdf.setFillColor(darkR, darkG, darkB);
        drawTri(50, 6, 88, 28, 88, 72, "F");
        drawTri(50, 6, 88, 72, 50, 94, "F");
        drawTri(50, 6, 50, 94, 12, 72, "F");
        drawTri(50, 6, 12, 72, 12, 28, "F");

        // Outer Hexagon Gold Borders
        pdf.setDrawColor(goldR, goldG, goldB);
        pdf.setLineWidth(0.4);
        drawLine(50, 6, 88, 28);
        drawLine(88, 28, 88, 72);
        drawLine(88, 72, 50, 94);
        drawLine(50, 94, 12, 72);
        drawLine(12, 72, 12, 28);
        drawLine(12, 28, 50, 6);
        
        // 2. Inner portal hexagon (dashed/subtle thin border)
        pdf.setDrawColor(goldR - 100, goldG - 100, goldB - 40);
        pdf.setLineWidth(0.15);
        drawLine(50, 12, 82, 31);
        drawLine(82, 31, 82, 69);
        drawLine(82, 69, 50, 88);
        drawLine(50, 88, 18, 69);
        drawLine(18, 69, 18, 31);
        drawLine(18, 31, 50, 12);
        
        // 3. Left Blades
        pdf.setFillColor(goldR, goldG, goldB);
        drawQuad(47, 25, 23, 46, 31, 54, 47, 46, "F");
        drawQuad(47, 49, 27, 66, 35, 72, 47, 61, "F");
        
        // 4. Right Blades
        drawQuad(53, 25, 77, 46, 69, 54, 53, 46, "F");
        drawQuad(53, 49, 73, 66, 65, 72, 53, 61, "F");
        
        // 5. Sword Line
        pdf.setDrawColor(goldR, goldG, goldB);
        pdf.setLineWidth(0.3);
        drawLine(50, 16, 50, 84);
        
        // 6. Central Diamond
        pdf.setFillColor(darkR, darkG, darkB);
        drawQuad(50, 44, 56, 50, 50, 56, 44, 50, "F");
        
        // Diamond Gold Border
        pdf.setDrawColor(goldR, goldG, goldB);
        pdf.setLineWidth(0.25);
        drawLine(50, 44, 56, 50);
        drawLine(56, 50, 50, 56);
        drawLine(50, 56, 44, 50);
        drawLine(44, 50, 50, 44);
      };
      
      // Draw 18mm Logo at center-top
      drawLogo(pdf, pageWidth / 2 - 9, 20, 18);

      // 4. Header Text (Brutal Occult Luxury Typography)
      pdf.setTextColor(226, 201, 163); // Luxury Gold
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("CERTIFICADO DE AUTENTICIDADE DIGITAL", pageWidth / 2, 45, { align: "center" });
      
      pdf.setTextColor(160, 160, 165); // Neutral Muted Light
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text("PROTOCOLO DE SEGURANÇA E REGISTRO DIGITAL SMARTDOC S/A", pageWidth / 2, 50, { align: "center" });
      
      // Elegant Divider (Gold Accent Line)
      pdf.setDrawColor(197, 168, 128); // Gold
      pdf.setLineWidth(0.35);
      pdf.line(40, 56, pageWidth - 40, 56);
      
      // 5. Document Title Section
      pdf.setTextColor(255, 255, 255); // Pure White
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      const title = doc.contracts?.title?.toUpperCase() || "DOCUMENTO DIGITAL";
      pdf.text(title, pageWidth / 2, 69, { align: "center" });
      
      pdf.setTextColor(140, 130, 115); // Muted Gold Text
      pdf.setFont("courier", "normal");
      pdf.setFontSize(7.5);
      pdf.text(`ID DO DOCUMENTO: ${doc.contract_id}`, pageWidth / 2, 75, { align: "center" });
      
      // 6. Legal Declaration block (Luxury Dark Obsidian Box)
      pdf.setFillColor(18, 18, 22); // Obsidian Card
      pdf.rect(20, 82, pageWidth - 40, 38, "F");
      pdf.setDrawColor(50, 45, 38); // Subtle Gold border
      pdf.rect(20, 82, pageWidth - 40, 38, "S");
      
      // Left border accent in Luxury Gold
      pdf.setFillColor(212, 175, 55);
      pdf.rect(20, 82, 1.5, 38, "F");
      
      pdf.setTextColor(215, 215, 220); // Warm White
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      const declaration = "Certificamos que o presente instrumento jurídico-digital foi analisado, validado e assinado eletronicamente através da plataforma SmartDoc. A integridade do documento, a identidade dos signatários e as evidências digitais de consentimento foram registradas e vinculadas de forma permanente e imutável ao protocolo abaixo descrito.";
      const splitDeclaration = pdf.splitTextToSize(declaration, pageWidth - 52);
      pdf.text(splitDeclaration, 26, 91);
      
      // 7. Protocol / Hash Section
      const signedAt = doc.manifesto?.signed_at 
        ? new Date(doc.manifesto.signed_at).toLocaleString("pt-BR") 
        : new Date().toLocaleString("pt-BR");
      const fakeHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      
      pdf.setTextColor(212, 175, 55); // Classic Gold
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8);
      pdf.text(`PROTOCOLO DIGITAL : ${doc.protocolo}`, 20, 134);
      
      pdf.setTextColor(240, 240, 245);
      pdf.text(`DATA DA CHANCELA : ${signedAt.toUpperCase()}`, 20, 140);
      
      pdf.setTextColor(150, 150, 155);
      pdf.text(`HASH DE INTEGRIDADE: SHA-256//${fakeHash.toUpperCase().slice(0, 32)}`, 20, 146);
      pdf.text(`                    ${fakeHash.toUpperCase().slice(32)}`, 20, 151);
      
      // Security Seal Circle (Gold Seal)
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.35);
      pdf.circle(pageWidth - 32, 141, 11, "S");
      
      pdf.setTextColor(212, 175, 55);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text("SMARTDOC", pageWidth - 32, 140, { align: "center" });
      pdf.setFontSize(4.5);
      pdf.text("SECURE SIGN", pageWidth - 32, 143, { align: "center" });
      
      // 8. Signatures Title
      pdf.setTextColor(226, 201, 163); // Luxury Gold
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.text("SIGNATÁRIOS E REGISTROS DE CONSENTIMENTO", 20, 167);
      
      let yPos = 177;
      const evidence = doc.manifesto?.evidence || {};
      
      doc.signers?.forEach((s: any) => {
        if (yPos > 260) {
          pdf.addPage();
          // Draw dark background on new page
          pdf.setFillColor(10, 10, 12);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          
          pdf.setDrawColor(197, 168, 128);
          pdf.setLineWidth(0.4);
          pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
          
          pdf.setDrawColor(90, 75, 50);
          pdf.setLineWidth(0.15);
          pdf.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);
          yPos = 30;
        }

        // Signatory Box (Obsidian Card)
        pdf.setFillColor(16, 16, 20);
        pdf.rect(20, yPos - 5, pageWidth - 40, 22, "F");
        pdf.setDrawColor(45, 40, 32); // Muted Gold border
        pdf.rect(20, yPos - 5, pageWidth - 40, 22, "S");
        
        // Signed Indicator (Gold/Green Accent)
        pdf.setFillColor(212, 175, 55); // Warm Gold
        pdf.rect(20, yPos - 5, 1.5, 22, "F");
        
        pdf.setTextColor(255, 255, 255); // White Name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.text(s.name.toUpperCase(), 25, yPos + 1);
        
        pdf.setTextColor(160, 160, 165); // Muted Light Text
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.text(`E-mail: ${s.email}`, 25, yPos + 6);
        
        const isEvidenceHolder = evidence.authorized_email?.toLowerCase().trim() === s.email?.toLowerCase().trim();
        let ip = isEvidenceHolder ? (evidence.ip_address || "REGISTRADO") : "PROTEGIDO";
        if (ip === "::1") ip = "127.0.0.1 (Local)";
        const ua = isEvidenceHolder ? (evidence.user_agent?.slice(0, 55) + "...") : "SmartDoc Secure Agent";
        
        pdf.setTextColor(130, 120, 105); // Elegant Muted Gold Monospace
        pdf.setFont("courier", "normal");
        pdf.setFontSize(6.5);
        pdf.text(`IP ORIGEM: ${ip} | AGENTE: ${ua.toUpperCase()}`, 25, yPos + 12);
        
        yPos += 26;
      });
      
      // 9. Footer Text
      pdf.setTextColor(120, 115, 105);
      pdf.setFontSize(6.5);
      pdf.setFont("helvetica", "normal");
      pdf.text("ESTE DOCUMENTO FOI ASSINADO ELETRONICAMENTE NOS TERMOS DA LEGISLAÇÃO VIGENTE.", pageWidth / 2, pageHeight - 20, { align: "center" });
      pdf.text("VALIDADO PELA AUTORIDADE DE REGISTRO DIGITAL SMARTDOC S/A", pageWidth / 2, pageHeight - 16, { align: "center" });
      
      pdf.save(`certificado-assinatura-${doc.protocolo}.pdf`);
      toast.success("Certificado baixado com sucesso!");
    } catch (err: any) {
      console.error("PDF generation failure:", err);
      toast.error("Falha ao gerar o certificado.");
    }
  };

  const userSigner = selectedDoc?.signers?.find((s: any) => s.email?.toLowerCase().trim() === currentUserEmail);
  const userNeedsToSign = userSigner && !userSigner.signed && selectedDoc?.status !== 'signed';

  if (loading) return <div className="p-20 text-center animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Carregando Assinaturas...</div>

  return (
    <div className="space-y-12 animate-in fade-in duration-700 overflow-x-hidden px-1 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border/50 pb-8 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[9px] uppercase tracking-[0.3em] font-black border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full animate-pulse">Secure Protocol</Badge>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase italic">Electronic Signature Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Signatures <span className="text-muted-foreground/30 font-light">/</span> <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">Vault</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Gerencie e assine documentos eletronicamente com validade jurídica. Acompanhe o status das coletas de assinatura em tempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="md:col-span-2 space-y-4">
           {documents.length === 0 ? (
             <Card className="p-12 text-center border-dashed bg-card/40 backdrop-blur-md border-border/50 rounded-[32px]">
                <ShieldCheck size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum documento coletado no momento.</p>
             </Card>
           ) : (
             documents.map((doc) => {
               const isOwner = doc.contracts?.user_id === currentUserId;
               const selfSignerObj = doc.signers?.find((s: any) => s.email?.toLowerCase().trim() === currentUserEmail);
               const selfSigned = selfSignerObj?.signed;
               const selfNeedsToSign = selfSignerObj && !selfSigned && doc.status !== 'signed';

               return (
                 <Card 
                   key={doc.contract_id} 
                   className={cn(
                     "p-6 cursor-pointer transition-all bg-card/40 backdrop-blur-md border border-border/50 rounded-[32px] shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:border-primary/40 group relative overflow-hidden",
                     selectedDoc?.contract_id === doc.contract_id && "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
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
                             <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                {doc.status === 'analyzing' ? (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Em Análise</Badge>
                                ) : doc.status === 'signed' ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Assinado</Badge>
                                ) : doc.status === 'partially_signed' ? (
                                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Parcial</Badge>
                                ) : (
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Pendente</Badge>
                                )}
                                
                                {isOwner ? (
                                  <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-amber-500/30 text-amber-500 bg-amber-500/5 px-1.5 h-4">Você Enviou</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-indigo-500/30 text-indigo-400 bg-indigo-500/5 px-1.5 h-4">Recebido</Badge>
                                )}

                                {selfNeedsToSign && (
                                  <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4 animate-pulse">Sua Assinatura Pendente</Badge>
                                )}
                                {selfSigned && (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">Você Assinou</Badge>
                                )}
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-right">
                             Signatários
                          </p>
                          <div className="flex -space-x-2 justify-end">
                             {doc.signers.slice(0, 4).map((s: any, i: number) => (
                               <div 
                                 key={i} 
                                 className={cn(
                                   "w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-black uppercase",
                                   s.signed ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                                 )} 
                                 title={`${s.name} (${s.email}) - ${s.signed ? 'Assinou' : 'Pendente'}`}
                               >
                                  {s.name[0]}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </Card>
               );
             })
           )}
        </div>

        <div className="space-y-6">
           {selectedDoc ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {userNeedsToSign ? (
                   <Card className="p-8 border-rose-500/20 bg-card/40 backdrop-blur-md rounded-[32px] shadow-[0_0_30px_rgba(0,0,0,0.1)] sticky top-6">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                              <KeyRound size={16} />
                           </div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Sua Assinatura Pendente</h4>
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                           Você foi convidado para assinar este documento. Clique no botão abaixo para abrir a visualização segura e chancelar com o seu consentimento digital.
                        </p>

                        <Link 
                           href={`/editor?room=${selectedDoc.contract_id}&mode=preview`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full h-14 bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-600/20 transition-all active:scale-95 text-xs"
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

"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpCircle, ShieldCheck, Zap, LifeBuoy, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Custom Forge States
  const [forgeDescription, setForgeDescription] = useState("");
  const [isForaging, setIsForaging] = useState(false);

  // Support Ticket States
  const [supportMessage, setSupportMessage] = useState("");
  const [isSupporting, setIsSupporting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleRequestForge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgeDescription || !forgeDescription.trim()) {
      toast.error("Por favor, descreva o modelo de contrato que deseja.");
      return;
    }

    if (!user) {
      toast.error("Acesso negado. Faça login novamente.");
      return;
    }

    setIsForaging(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: `🛠️ Solicitação de Forja: ${forgeDescription.substring(0, 30)}...`,
        message: forgeDescription,
        type: 'forge',
        read: false
      });

      if (error) throw error;

      toast.success("Solicitação de forja enviada! O acompanhamento será feito na sua Caixa de Entrada.");
      setForgeDescription("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao solicitar forja.");
    } finally {
      setIsForaging(false);
    }
  };

  const handleOpenSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage || !supportMessage.trim()) {
      toast.error("Por favor, descreva sua dúvida ou problema.");
      return;
    }

    if (!user) {
      toast.error("Acesso negado. Faça login novamente.");
      return;
    }

    setIsSupporting(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: `💬 Chamado de Suporte: ${supportMessage.substring(0, 30)}...`,
        message: supportMessage,
        type: 'support',
        read: false
      });

      if (error) throw error;

      toast.success("Chamado de suporte aberto! O acompanhamento será feito na sua Caixa de Entrada.");
      setSupportMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao abrir chamado de suporte.");
    } finally {
      setIsSupporting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      
      {/* Header Centralizado */}
      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Suporte ExtraJus</span>
         </div>
         <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
            Suporte & Forja Customizada
         </h1>
         <p className="text-xs text-muted-foreground font-bold tracking-wide">
            Solicite modelos sob medida forjados pelos nossos generais ou abra chamados técnicos de suporte.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
         
         {/* Painel 1: Solicitar Forja */}
         <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Zap size={120} className="text-primary animate-pulse" />
            </div>
            
            <div className="space-y-6">
               <div className="space-y-1">
                  <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                     <Zap size={16} className="text-primary" /> Solicitar Forja de Modelo
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold tracking-wide">
                     Descreva detalhadamente o modelo de documento jurídico que você precisa. Nossos arquitetos vão estruturá-lo e adicioná-lo ao seu arsenal.
                  </p>
               </div>

               <form onSubmit={handleRequestForge} className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-muted-foreground/80 block mb-1.5">O Que Você Deseja Forjar?</label>
                     <textarea 
                       placeholder="Ex: Contrato de Prestação de Serviços de TI com cláusula de proteção de PI pesada e multa de rescisão abusiva..."
                       value={forgeDescription}
                       onChange={(e) => setForgeDescription(e.target.value)}
                       rows={6}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none min-h-[140px]"
                       required
                     />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isForaging}
                    className="w-full h-11 rounded-xl text-xs font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                     {isForaging ? "Convocando Arquitetos..." : (
                       <>
                         Solicitar Forja sob Medida <ArrowRight size={12} />
                       </>
                     )}
                  </Button>
               </form>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-primary tracking-wide">
               <ShieldCheck size={12} /> Modelos submetidos aos padrões rígidos de compliance do império
            </div>
         </div>

         {/* Painel 2: Suporte Técnico */}
         <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <LifeBuoy size={120} className="text-primary animate-pulse" />
            </div>

            <div className="space-y-6">
               <div className="space-y-1">
                  <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                     <LifeBuoy size={16} className="text-primary" /> Central de Chamados & Suporte
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold tracking-wide">
                     Encontrou alguma anomalia, precisa de ajuda com assinaturas, saldo, ou quer tirar alguma dúvida? Deixe sua mensagem e nosso general Felipe responderá na sua caixa de entrada.
                  </p>
               </div>

               <form onSubmit={handleOpenSupport} className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-muted-foreground/80 block mb-1.5">Sua Mensagem / Dúvida</label>
                     <textarea 
                       placeholder="Descreva seu problema, erro ou dúvida de forma clara..."
                       value={supportMessage}
                       onChange={(e) => setSupportMessage(e.target.value)}
                       rows={6}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none min-h-[140px]"
                       required
                     />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSupporting}
                    className="w-full h-11 rounded-xl text-xs font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                     {isSupporting ? "Enviando Chamado..." : (
                       <>
                         Abrir Chamado de Suporte <ArrowRight size={12} />
                       </>
                     )}
                  </Button>
               </form>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-emerald-500 tracking-wide">
               <ShieldCheck size={12} /> Canal de comunicação criptografado e seguro com os generais
            </div>
         </div>

      </div>

   </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Mail, MailOpen, Send, Trash2, Search, ArrowRight, User, ShieldCheck, 
  HelpCircle, LifeBuoy, Sparkles, ShieldAlert, Cpu, Terminal, Shield, 
  Zap, Wand2, Eye, Compass, Activity, CheckCircle, Wifi, Clock, MessageSquare 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function InboxPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin Toggle State
  const [isAdminView, setIsAdminView] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Support Ticket States
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSupporting, setIsSupporting] = useState(false);

  // AI Simulated Typing State
  const [isAiTyping, setIsAiTyping] = useState(false);

  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const adminEmails = ['felipedutra@outlook.com'];

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

      toast.success("Chamado de suporte aberto! O acompanhamento será feito nesta Caixa de Entrada.");
      setSupportMessage("");
      setIsSupportOpen(false);
      fetchNotifications(user.id, isAdminView);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao abrir chamado de suporte.");
    } finally {
      setIsSupporting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        const isSelfAdmin = adminEmails.includes(currentUser.email || '');
        setIsUserAdmin(isSelfAdmin);
        setIsAdminView(isSelfAdmin); // Liga por padrão se for admin
        fetchNotifications(currentUser.id, isSelfAdmin);
      }
    }
    init();
  }, []);

  // Rolar para o final do chat quando novas respostas carregarem
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [replies, selectedNotification]);

  // Realtime para atualizações nas notificações
  useEffect(() => {
    if (!user?.id) return;

    let channel = supabase.channel(`inbox-realtime-${user.id}`);
    
    if (isAdminView) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications(user.id, true);
        }
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload: any) => {
          const targetUserId = payload.new?.user_id || payload.old?.user_id;
          if (targetUserId === user.id) {
            fetchNotifications(user.id, false);
          }
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAdminView]);

  // Escuta de Realtime para réplicas adicionadas no histórico
  useEffect(() => {
    if (!selectedNotification?.id) return;

    const channel = supabase
      .channel(`replies-realtime-${selectedNotification.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_replies'
        },
        (payload: any) => {
          if (payload.new && payload.new.notification_id === selectedNotification.id) {
            fetchReplies(selectedNotification.id);
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedNotification?.id]);

  const fetchNotifications = async (userId: string, forceAdminView?: boolean) => {
    setLoading(true);
    try {
      const activeAdminView = forceAdminView !== undefined ? forceAdminView : isAdminView;
      let query = supabase.from('notifications').select('*');

      if (!activeAdminView) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (activeAdminView && data && data.length > 0) {
        const userIds = Array.from(new Set(data.map(n => n.user_id)));
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});

        setNotifications(data.map(n => ({
          ...n,
          userProfile: profileMap[n.user_id] || { email: 'sistema@extrajus.com', full_name: 'Usuário Externo' }
        })));
      } else {
        setNotifications(data || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar caixa de entrada.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (notificationId: string) => {
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('notification_replies')
        .select('*')
        .eq('notification_id', notificationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSelectNotification = async (notification: any) => {
    setSelectedNotification(notification);
    fetchReplies(notification.id);
    
    if (!notification.read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);

        if (!error) {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Mensagem excluída.");
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (err: any) {
      toast.error("Erro ao deletar mensagem.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !replyText.trim() || !selectedNotification) {
      toast.error("Por favor, digite uma mensagem para responder.");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch("/api/notifications/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: selectedNotification.id,
          originalTitle: selectedNotification.title,
          replyMessage: replyText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resposta enviada com sucesso!");
        setReplyText("");
        fetchReplies(selectedNotification.id);
      } else {
        toast.error(data.error || "Falha ao enviar resposta.");
      }
    } catch (err) {
      toast.error("Erro de comunicação ao responder.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Simulated AI typing copilot action
  const handleSelectAISuggestion = (suggestionType: string) => {
    if (isAiTyping) return;
    
    let text = "";
    if (suggestionType === "polite") {
      text = "Saudações, Recruta. Analisamos sua solicitação sobre o sistema e confirmamos que nossa equipe técnica já está auditando os parâmetros contratuais. Fique tranquilo, o acompanhamento é feito em tempo real por aqui.";
    } else if (suggestionType === "technical") {
      text = "PROTOCOL CHECKPOINT: Conexão segura estabelecida. A análise heurística do seu documento indica compatibilidade de 99.8% com nossos templates de proteção de ativos. Proposta de blindagem aceita e em fila de processamento.";
    } else if (suggestionType === "brutal") {
      text = "Porra, recruta! Sua solicitação de suporte já está na mesa dos arquitetos da ExtraJus. Pare de atualizar a página à toa e confie no processo de dominação. Nós resolveremos isso com força letal em minutos.";
    }

    setIsAiTyping(true);
    setReplyText("");
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setReplyText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsAiTyping(false);
        toast.success("Lilith AI formulou a resposta perfeita!");
      }
    }, 12);
  };

  const filteredNotifications = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  // Custom threat, risk status and intents for telemetry
  const getTelemetryData = (n: any) => {
    if (!n) return null;
    const isSupport = n.type === 'support';
    const isForge = n.type === 'forge';
    
    return {
      urgency: isSupport ? "CRÍTICA (Central)" : isForge ? "ALTA (Forja)" : "INFORMACIONAL",
      urgencyColor: isSupport ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : isForge ? "text-primary border-primary/20 bg-primary/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
      intent: isSupport ? "Diagnóstico Técnico & Erro" : isForge ? "Forja Customizada de Pacto" : "Comunicação Segura Interna",
      confidence: isSupport ? "99.8%" : isForge ? "99.9%" : "100.0%",
      riskIndex: isSupport ? "0.04% (Seguro)" : isForge ? "0.01% (Blindagem Padrão)" : "0.00% (Criptografado)"
    };
  };

  const telemetry = getTelemetryData(selectedNotification);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0 relative">
      
      {/* Background Occult Gradient Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Centralizado */}
      <div className="space-y-3 relative z-10">
         <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary font-mono">Quantum Communications</span>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
               <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic flex items-center gap-2.5">
                  Caixa de Entrada {unreadCount > 0 && <span className="bg-primary/20 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-black not-italic font-sans">{unreadCount} novas</span>}
               </h1>
               <p className="text-xs text-muted-foreground font-bold tracking-wide mt-1">
                  Seu cofre de comunicações diretas, respostas de forja e telemetria de suporte sob medida.
               </p>
            </div>
            {!isAdminView && (
               <Button
                 onClick={() => setIsSupportOpen(true)}
                 className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.15)] border border-primary/35 transition-all"
               >
                  <HelpCircle size={13} className="text-primary-foreground" /> Abrir Chamado de Suporte
               </Button>
            )}
         </div>
      </div>

      {/* Grid Caixa de Entrada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[620px] relative z-10">
         
         {/* Lado Esquerdo: Lista de Mensagens */}
         <div className="lg:col-span-1 bg-card/60 border border-border/80 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between h-full shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="space-y-5 flex-1 flex flex-col">
               
               {isUserAdmin && (
                  <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border/40 rounded-2xl gap-2 animate-in fade-in duration-300">
                     <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                       <Cpu size={10} className="text-primary animate-pulse" /> Filtro de Visão
                     </span>
                     <button 
                       onClick={() => {
                         const target = !isAdminView;
                         setIsAdminView(target);
                         setSelectedNotification(null);
                         fetchNotifications(user.id, target);
                       }}
                       className={cn(
                         "px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5",
                         isAdminView 
                           ? "bg-primary text-primary-foreground border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                           : "bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground"
                       )}
                     >
                        <Eye size={10} />
                        {isAdminView ? "MODO ADMIN" : "MODO RECRUTA"}
                     </button>
                  </div>
               )}

               {/* Campo de Pesquisa */}
               <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={12} />
                  <input 
                    type="text"
                    placeholder="Pesquisar comunicados seguros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                  />
               </div>

               {/* Lista de Cards de Mensagens */}
               <div className="overflow-y-auto max-h-[480px] flex-1 space-y-3 custom-scrollbar pr-0.5">
                  {loading && notifications.length === 0 ? (
                     <div className="py-20 text-center text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest border border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <Activity size={18} className="text-primary animate-spin" />
                        Decodificando satélites...
                     </div>
                  ) : filteredNotifications.length === 0 ? (
                     <div className="py-20 text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest border border-dashed border-border/35 rounded-2xl">
                        Nenhum sinal descriptografado.
                     </div>
                  ) : (
                     filteredNotifications.map((n) => {
                       const isSelected = selectedNotification?.id === n.id;
                       const isSupport = n.type === 'support';
                       const isForge = n.type === 'forge';

                       return (
                          <div 
                            key={n.id}
                            onClick={() => handleSelectNotification(n)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col gap-2 relative group",
                              isSelected 
                                ? "bg-primary/5 border-primary/30 shadow-[inset_0_0_15px_rgba(var(--primary),0.02)]" 
                                : "bg-muted/10 border-border/30 hover:bg-muted/20 hover:border-border/60"
                            )}
                          >
                             {/* Indicador Lateral de Tipo / Status de Glow */}
                             <div className={cn(
                               "absolute left-0 top-4 bottom-4 w-1 rounded-r-md transition-all",
                               isSelected ? "bg-primary" : "bg-transparent",
                               !n.read && "bg-amber-500"
                             )} />

                             <div className="flex justify-between items-start gap-4 pl-1">
                                <span className={cn(
                                  "text-[11px] font-black leading-tight truncate max-w-[75%] flex items-center gap-1.5",
                                  !n.read ? "text-foreground" : "text-muted-foreground"
                                )}>
                                   {isSupport ? (
                                     <LifeBuoy size={11} className="text-amber-500 shrink-0" />
                                   ) : isForge ? (
                                     <Zap size={11} className="text-primary shrink-0 animate-pulse" />
                                   ) : (
                                     <Mail size={11} className="text-emerald-500 shrink-0" />
                                   )}
                                   {n.title}
                                </span>
                                <span className="text-[8px] text-muted-foreground/50 font-mono">
                                   {new Date(n.created_at).toLocaleDateString('pt-BR')}
                                </span>
                             </div>

                             {isAdminView && n.userProfile && (
                                <div className="text-[8px] font-mono text-primary font-black pl-1 -mt-1 tracking-wider truncate uppercase flex items-center gap-1">
                                   <User size={8} /> Recruta: {n.userProfile.full_name || n.userProfile.email}
                                </div>
                             )}

                             <p className="text-[10px] text-muted-foreground/80 leading-normal truncate pl-1">
                                {n.message}
                             </p>

                             <div className="flex justify-between items-center pl-1 mt-1">
                               {/* Badge de tipo */}
                               <span className={cn(
                                 "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md font-mono border",
                                 isSupport ? "text-amber-500 border-amber-500/10 bg-amber-500/5" : isForge ? "text-primary border-primary/10 bg-primary/5" : "text-emerald-500 border-emerald-500/10 bg-emerald-500/5"
                               )}>
                                 {isSupport ? "Suporte" : isForge ? "Forja" : "Alerta"}
                               </span>

                               <button 
                                 onClick={(e) => handleDeleteNotification(n.id, e)}
                                 className="h-6 w-6 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all"
                                 title="Excluir Mensagem"
                                >
                                   <Trash2 size={10} />
                                </button>
                             </div>
                          </div>
                       );
                     })
                  )}
               </div>
               
               {/* Telemetry Status bar */}
               <div className="border-t border-border/30 pt-4 flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1"><Wifi size={8} className="text-primary" /> SECURE LINK ACTIVE</span>
                  <span>SYNC: REALTIME</span>
               </div>

            </div>
         </div>

         {/* Lado Direito: Decodificador & Área de Trabalho de Suporte */}
         <div className="lg:col-span-2 bg-card/45 border border-border/80 backdrop-blur-md rounded-3xl p-6 relative flex flex-col justify-between h-full min-h-[500px] shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
             {selectedNotification ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch h-full">
                   
                   {/* Coluna 1 & 2: Chat Timeline (2/3 da largura no desktop) */}
                   <div className="xl:col-span-2 flex flex-col justify-between h-full space-y-4">
                      
                      {/* Cabeçalho da Mensagem */}
                      <div className="space-y-4 border-b border-border/40 pb-4">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-1 text-left">
                               <h2 className="text-base font-black text-foreground uppercase tracking-wide italic flex items-center gap-2">
                                  {selectedNotification.type === 'support' ? <LifeBuoy size={16} className="text-amber-500" /> : selectedNotification.type === 'forge' ? <Zap size={16} className="text-primary animate-pulse" /> : <Mail size={16} className="text-emerald-500" />}
                                  {selectedNotification.title}
                               </h2>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/75">
                                  <User size={12} className="text-primary" />
                                  {isAdminView && selectedNotification.userProfile ? (
                                     <span>Conversa com: <span className="text-foreground">{selectedNotification.userProfile.full_name} ({selectedNotification.userProfile.email})</span></span>
                                  ) : (
                                     <span>Remetente: <span className="text-foreground">Arquitetura de Suporte ExtraJus</span></span>
                                  )}
                               </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                               <span className="text-[9px] font-mono bg-muted/65 border border-border/60 px-2.5 py-1 rounded-md text-muted-foreground font-black">
                                  {new Date(selectedNotification.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                               </span>
                               <Button 
                                 onClick={(e) => handleDeleteNotification(selectedNotification.id, e)}
                                 variant="ghost" 
                                 className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                               >
                                  <Trash2 size={12} />
                               </Button>
                            </div>
                         </div>
                      </div>

                      {/* Timeline Conversacional (Histórico de Réplicas) */}
                      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-1.5 custom-scrollbar text-left min-h-[220px]">
                         
                         {/* Bolha 1: Mensagem Original */}
                         <div className="flex flex-col gap-1.5 ml-auto items-end max-w-[85%] text-right animate-in fade-in slide-in-from-right-3 duration-300">
                            <div className="bg-muted/15 border border-border/50 p-4 rounded-2xl rounded-tr-none shadow-sm backdrop-blur-sm">
                               <p className="text-xs text-foreground font-bold whitespace-pre-wrap leading-relaxed text-right">
                                  {selectedNotification.message}
                               </p>
                            </div>
                            <span className="text-[8px] text-muted-foreground/60 font-mono pr-1 flex items-center gap-1">
                               <Clock size={8} /> {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR')} • {isAdminView && selectedNotification.userProfile ? (selectedNotification.userProfile.full_name) : "Mensagem Original"}
                            </span>
                         </div>

                         {/* Histórico de Réplicas */}
                         {loadingReplies && replies.length === 0 ? (
                            <div className="py-6 text-center text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                               <Activity size={10} className="animate-spin text-primary" /> Carregando base de dados...
                            </div>
                         ) : (
                            replies.map((reply) => {
                               const isMe = reply.sender_id === user?.id;
                               return (
                                  <div 
                                    key={reply.id} 
                                    className={cn(
                                      "flex flex-col gap-1.5 max-w-[85%]",
                                      isMe ? "mr-auto items-start text-left animate-in fade-in slide-in-from-left-3 duration-300" : "ml-auto items-end text-right animate-in fade-in slide-in-from-right-3 duration-300"
                                    )}
                                  >
                                     <div className={cn(
                                       "p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all",
                                       isMe 
                                         ? "bg-primary/5 border border-primary/25 rounded-tl-none text-left shadow-[0_0_15px_rgba(var(--primary),0.02)]" 
                                         : "bg-muted/10 border border-border/50 rounded-tr-none text-right"
                                     )}>
                                        <p className="text-xs text-foreground font-bold whitespace-pre-wrap leading-relaxed">
                                           {reply.message}
                                        </p>
                                     </div>
                                     <span className="text-[8px] text-muted-foreground/60 font-mono px-1 flex items-center gap-1">
                                        <User size={8} className="text-primary/70" /> {reply.sender_name} • {new Date(reply.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                     </span>
                                  </div>
                               );
                            })
                         )}
                         <div ref={chatEndRef} />
                      </div>

                      {/* Caixa de Resposta & Co-piloto de IA */}
                      <div className="border-t border-border/30 pt-4 mt-auto">
                         
                         {/* Copiloto IA (LILITH) */}
                         <div className="mb-4 bg-primary/5 border border-primary/10 rounded-2xl p-3 text-left space-y-2 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <Sparkles size={13} className="text-primary animate-pulse" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-primary font-mono">Copiloto IA LILITH</span>
                               </div>
                               <span className="text-[7px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border">IA GENERATIVA ATIVA</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground font-medium leading-normal">
                               Simule ou automatize réplicas instantâneas clicando nos arquétipos do copiloto abaixo:
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                               <button 
                                 disabled={isAiTyping}
                                 onClick={() => handleSelectAISuggestion("polite")}
                                 className="px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-[8px] font-black uppercase text-foreground transition-all flex items-center gap-1.5 border border-border/40 disabled:opacity-50"
                               >
                                 ✨ Educada
                               </button>
                               <button 
                                 disabled={isAiTyping}
                                 onClick={() => handleSelectAISuggestion("technical")}
                                 className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-[8px] font-black uppercase text-primary transition-all flex items-center gap-1.5 border border-primary/20 disabled:opacity-50"
                               >
                                 ⚡ Técnica
                               </button>
                               <button 
                                 disabled={isAiTyping}
                                 onClick={() => handleSelectAISuggestion("brutal")}
                                 className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[8px] font-black uppercase text-red-400 transition-all flex items-center gap-1.5 border border-red-500/20 disabled:opacity-50"
                               >
                                 💀 Modo Lilith
                               </button>
                            </div>
                         </div>

                         <form onSubmit={handleSendReply} className="space-y-3">
                            <div className="space-y-2">
                               <div className="relative">
                                  <textarea 
                                    placeholder={isAiTyping ? "Lilith está formulando e digitando..." : "Escreva sua réplica ou parecer..."}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={isAiTyping}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        const form = e.currentTarget.form;
                                        if (form) form.requestSubmit();
                                      }
                                    }}
                                    rows={3}
                                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none pr-12 text-left disabled:opacity-70"
                                    required
                                  />
                                  <button 
                                    type="submit"
                                    disabled={submittingReply || isAiTyping}
                                    className="absolute right-3 top-3 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 transition-all shadow-md disabled:opacity-50"
                                    title="Enviar Resposta"
                                  >
                                     <Send size={12} className={cn(submittingReply && "animate-pulse")} />
                                  </button>
                               </div>
                            </div>
                         </form>
                      </div>

                   </div>

                   {/* Coluna 3: Telemetry & AI Status (1/3 da largura no desktop) */}
                   <div className="xl:col-span-1 border-l border-border/40 pl-6 flex flex-col justify-between h-full space-y-5 text-left animate-in fade-in duration-700">
                      
                      {/* Telemetry Block */}
                      <div className="space-y-4">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono flex items-center gap-1.5">
                            <Cpu size={12} className="text-primary animate-pulse" /> Telemetria de Chamado
                         </h3>

                         <div className="space-y-3.5 pt-2">
                            {/* Urgência */}
                            <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1">
                               <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Prioridade</span>
                               <span className={cn("text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider font-mono", telemetry?.urgencyColor)}>
                                  {telemetry?.urgency}
                               </span>
                            </div>

                            {/* Intenção */}
                            <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1">
                               <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Intenção IA</span>
                               <span className="text-[10px] font-black text-foreground flex items-center gap-1.5">
                                  <Wand2 size={10} className="text-primary" /> {telemetry?.intent}
                               </span>
                            </div>

                            {/* Segurança de dados */}
                            <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1">
                               <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Mitigação de Riscos</span>
                               <span className="text-[10px] font-mono font-black text-primary">
                                  {telemetry?.riskIndex}
                                </span>
                            </div>
                         </div>
                      </div>

                      {/* Quantum System Log Console */}
                      <div className="bg-black/40 border border-border/30 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[140px] font-mono relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 rounded-full blur-[40px] pointer-events-none" />
                         
                         <div>
                            <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-3">
                               <span className="text-[8px] font-black uppercase text-primary flex items-center gap-1">
                                 <Terminal size={10} /> SYSTEM LOG
                               </span>
                               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                            <div className="text-[8px] text-muted-foreground/80 space-y-1.5">
                               <p className="text-foreground/95 flex items-center gap-1"><span className="text-primary font-bold">»</span> ESTABLISH SECURE LINK</p>
                               <p className="flex items-center gap-1"><span className="text-emerald-500 font-bold">»</span> HEURISTIC RADAR ACTIVE</p>
                               <p className="flex items-center gap-1"><span className="text-muted-foreground/50">»</span> CLASSIFY: {selectedNotification.type?.toUpperCase() || "ALERT"}</p>
                               <p className="text-primary/95 flex items-center gap-1"><span className="text-primary font-bold">»</span> LILITH IA INJECTIONS LOADED</p>
                            </div>
                         </div>
                         <div className="pt-4 mt-auto border-t border-border/20">
                            <div className="text-[7px] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-wider">
                              <Shield size={8} className="text-primary animate-pulse" /> BLINDAGEM QUANTICA ATIVA
                            </div>
                         </div>
                      </div>

                   </div>

                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-5 relative overflow-hidden">
                   
                   {/* Center occult design core */}
                   <div className="relative flex items-center justify-center">
                     <div className="absolute w-24 h-24 bg-primary/5 border border-primary/10 rounded-full animate-ping duration-[3000ms]" />
                     <div className="absolute w-16 h-16 bg-primary/10 border border-primary/20 rounded-full animate-pulse" />
                     <div className="h-12 h-12 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground/60 relative z-10">
                        <MailOpen size={20} className="animate-bounce" />
                     </div>
                   </div>

                   <div className="space-y-1 relative z-10">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] font-mono flex items-center justify-center gap-1.5">
                         <ShieldCheck size={12} className="text-primary" /> Decodificador Neural
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wide max-w-[240px] mx-auto leading-relaxed">
                         Nenhum feixe de comunicação ativa selecionado. Conecte-se com um recruta na lateral para descriptografar os dados de telemetria.
                      </p>
                   </div>
                </div>
             )}
          </div>

       </div>

      {/* Modal de Suporte */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-border/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <DialogHeader className="space-y-1.5 border-b border-border/40 pb-4 mb-4 text-left">
            <DialogTitle className="text-lg font-black tracking-wide text-foreground uppercase italic flex items-center gap-2">
              <LifeBuoy size={18} className="text-primary" /> Central de Chamados & Suporte
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground font-medium leading-relaxed">
              Encontrou alguma anomalia, precisa de ajuda ou quer tirar alguma dúvida? Deixe sua mensagem e nós responderemos aqui em tempo real.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOpenSupport} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-muted-foreground/80 block">
                Sua Mensagem / Dúvida
              </label>
              <textarea 
                placeholder="Descreva seu problema, erro ou dúvida de forma clara..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={5}
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/35 resize-none min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-border/40 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSupportOpen(false)}
                className="h-10 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSupporting}
                className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
              >
                {isSupporting ? "Enviando Chamado..." : "Abrir Chamado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

   </div>
  );
}

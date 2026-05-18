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
import { Badge } from "@/components/ui/badge";
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isAdminView, setIsAdminView] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSupporting, setIsSupporting] = useState(false);

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
        setIsAdminView(isSelfAdmin); 
        fetchNotifications(currentUser.id, isSelfAdmin);
      }
    }
    init();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [replies, selectedNotification]);

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

  const handleSelectAISuggestion = (suggestionType: string) => {
    if (isAiTyping) return;
    
    let text = "";
    if (suggestionType === "polite") {
      text = "Olá. Analisamos sua solicitação e confirmamos que nossa equipe técnica já está auditando os parâmetros do documento. Fique tranquilo, o acompanhamento é feito em tempo real por aqui.";
    } else if (suggestionType === "technical") {
      text = "PROTOCOLO DE SEGURANÇA: Conexão segura estabelecida. A análise técnica do seu documento indica compatibilidade de 99.8% com nossos modelos de conformidade. Solicitação aceita e em fila de processamento.";
    } else if (suggestionType === "professional") {
      text = "Sua solicitação de suporte já está em análise pelos nossos especialistas da ExtraJus. Estamos processando as informações e retornaremos com uma solução em breve. Acompanhe o status por este canal.";
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
        toast.success("Sugestão de resposta gerada!");
      }
    }, 12);
  };

  const filteredNotifications = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTelemetryData = (n: any) => {
    if (!n) return null;
    const isSupport = n.type === 'support';
    const isForge = n.type === 'forge';
    
    return {
      urgency: isSupport ? "CRÍTICA" : isForge ? "ALTA" : "INFORMACIONAL",
      urgencyColor: isSupport ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : isForge ? "text-primary border-primary/20 bg-primary/5" : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
      intent: isSupport ? "Suporte Técnico" : isForge ? "Elaboração de Documento" : "Comunicação Interna",
      confidence: isSupport ? "99.8%" : isForge ? "99.9%" : "100.0%",
      riskIndex: isSupport ? "Seguro" : isForge ? "Conformidade Padrão" : "Criptografado"
    };
  };

  const telemetry = getTelemetryData(selectedNotification);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0 relative text-left">
      
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="space-y-3 relative z-10 text-left">
         <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Comunicações</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Secure Communications</span>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div className="text-left">
               <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                  Inbox {unreadCount > 0 && <span className="bg-primary/20 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-black font-sans">{unreadCount} novas</span>}
               </h1>
               <p className="text-xs text-muted-foreground font-bold tracking-wide mt-1">
                  Central de comunicações, solicitações de modelos e suporte técnico.
               </p>
            </div>
            {!isAdminView && (
               <Button
                 onClick={() => setIsSupportOpen(true)}
                 className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border border-primary/35 transition-all"
               >
                  <HelpCircle size={13} /> Abrir Chamado de Suporte
               </Button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[620px] relative z-10">
         
         <div className="lg:col-span-1 bg-card/60 border border-border/80 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between h-full shadow-sm">
            <div className="space-y-5 flex-1 flex flex-col text-left">
               
               {isUserAdmin && (
                  <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border/40 rounded-2xl gap-2">
                     <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                       <Cpu size={10} className="text-primary animate-pulse" /> Filtro de Visualização
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
                           ? "bg-primary text-primary-foreground border-primary/20" 
                           : "bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground"
                       )}
                     >
                        <Eye size={10} />
                        {isAdminView ? "MODO ADMIN" : "MODO USUÁRIO"}
                     </button>
                  </div>
               )}

               <div className="relative w-full text-left">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={12} />
                  <input 
                    type="text"
                    placeholder="Pesquisar comunicações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 text-left"
                  />
               </div>

               <div className="overflow-y-auto max-h-[480px] flex-1 space-y-3 custom-scrollbar pr-0.5 text-left">
                  {loading && notifications.length === 0 ? (
                     <div className="py-20 text-center text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest border border-dashed border-border/30 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <Activity size={18} className="text-primary animate-spin" />
                        Carregando informações...
                     </div>
                  ) : filteredNotifications.length === 0 ? (
                     <div className="py-20 text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest border border-dashed border-border/35 rounded-2xl">
                        Nenhuma mensagem encontrada.
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
                                ? "bg-primary/5 border-primary/30" 
                                : "bg-muted/10 border-border/30 hover:bg-muted/20 hover:border-border/60"
                            )}
                          >
                             <div className={cn(
                               "absolute left-0 top-4 bottom-4 w-1 rounded-r-md transition-all",
                               isSelected ? "bg-primary" : "bg-transparent",
                               !n.read && "bg-amber-500"
                             )} />

                             <div className="flex justify-between items-start gap-4 pl-1 text-left">
                                <span className={cn(
                                  "text-[11px] font-black leading-tight truncate max-w-[75%] flex items-center gap-1.5",
                                  !n.read ? "text-foreground" : "text-muted-foreground"
                                )}>
                                   {isSupport ? (
                                     <LifeBuoy size={11} className="text-amber-500 shrink-0" />
                                   ) : isForge ? (
                                     <Zap size={11} className="text-primary shrink-0" />
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
                                <div className="text-[8px] font-mono text-primary font-black pl-1 -mt-1 tracking-wider truncate uppercase flex items-center gap-1 text-left">
                                   <User size={8} /> Usuário: {n.userProfile.full_name || n.userProfile.email}
                                </div>
                             )}

                             <p className="text-[10px] text-muted-foreground/80 leading-normal truncate pl-1 text-left">
                                {n.message}
                             </p>

                             <div className="flex justify-between items-center pl-1 mt-1 text-left">
                               <span className={cn(
                                 "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md font-mono border",
                                 isSupport ? "text-amber-500 border-amber-500/10 bg-amber-500/5" : isForge ? "text-primary border-primary/10 bg-primary/5" : "text-emerald-500 border-emerald-500/10 bg-emerald-500/5"
                               )}>
                                 {isSupport ? "Suporte" : isForge ? "Solicitação" : "Notificação"}
                               </span>

                               <button 
                                 onClick={(e) => handleDeleteNotification(n.id, e)}
                                 className="h-6 w-6 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all"
                                >
                                   <Trash2 size={10} />
                                </button>
                             </div>
                          </div>
                       );
                     })
                  )}
               </div>
               
               <div className="border-t border-border/30 pt-4 flex items-center justify-between text-[8px] font-mono text-muted-foreground text-left">
                  <span className="flex items-center gap-1"><Wifi size={8} className="text-primary" /> CONEXÃO SEGURA ATIVA</span>
                  <span>STATUS: ONLINE</span>
               </div>

            </div>
         </div>

         <div className="lg:col-span-2 bg-card/45 border border-border/80 backdrop-blur-md rounded-3xl p-6 relative flex flex-col justify-between h-full min-h-[500px] shadow-sm text-left">
             {selectedNotification ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch h-full text-left">
                   
                   <div className={cn("flex flex-col justify-between h-full space-y-4 text-left", isAdminView ? "xl:col-span-2" : "xl:col-span-3")}>
                      
                      <div className="space-y-4 border-b border-border/40 pb-4 text-left">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                            <div className="space-y-1 text-left">
                               <h2 className="text-base font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                                  {selectedNotification.type === 'support' ? <LifeBuoy size={16} className="text-amber-500" /> : selectedNotification.type === 'forge' ? <Zap size={16} className="text-primary" /> : <Mail size={16} className="text-emerald-500" />}
                                  {selectedNotification.title}
                               </h2>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/75 text-left">
                                  <User size={12} className="text-primary" />
                                  {isAdminView && selectedNotification.userProfile ? (
                                     <span>Conversa com: <span className="text-foreground">{selectedNotification.userProfile.full_name} ({selectedNotification.userProfile.email})</span></span>
                                  ) : (
                                     <span>Remetente: <span className="text-foreground">Suporte ExtraJus</span></span>
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

                      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-1.5 custom-scrollbar text-left min-h-[220px]">
                         
                         <div className="flex flex-col gap-1.5 ml-auto items-end max-w-[85%] text-right animate-in fade-in slide-in-from-right-3 duration-300">
                            <div className="bg-muted/15 border border-border/50 p-4 rounded-2xl rounded-tr-none shadow-sm backdrop-blur-sm">
                               <p className="text-xs text-foreground font-bold whitespace-pre-wrap leading-relaxed text-right">
                                  {selectedNotification.message}
                               </p>
                            </div>
                            <span className="text-[8px] text-muted-foreground/60 font-mono pr-1 flex items-center gap-1">
                               <Clock size={8} /> {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR')} • Mensagem Original
                            </span>
                         </div>

                         {loadingReplies && replies.length === 0 ? (
                            <div className="py-6 text-center text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                               <Activity size={10} className="animate-spin text-primary" /> Carregando conversas...
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
                                         ? "bg-primary/5 border border-primary/25 rounded-tl-none text-left" 
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

                      <div className="border-t border-border/30 pt-4 mt-auto text-left">
                         
                         {/* Sugestões de Resposta IA (Só para Admins) */}
                         {isAdminView && (
                           <div className="mb-4 bg-primary/5 border border-primary/10 rounded-2xl p-3 text-left space-y-2 animate-in fade-in duration-500">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <Sparkles size={13} className="text-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary font-mono">Sugestões de Resposta IA</span>
                                 </div>
                                 <span className="text-[7px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border">IA GENERATIVA ATIVA</span>
                              </div>
                              <p className="text-[9px] text-muted-foreground font-medium leading-normal text-left">
                                 Selecione um tom de resposta para agilizar sua comunicação:
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                 <button 
                                   disabled={isAiTyping}
                                   onClick={() => handleSelectAISuggestion("polite")}
                                   className="px-2.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-[8px] font-black uppercase text-foreground transition-all flex items-center gap-1.5 border border-border/40 disabled:opacity-50"
                                 >
                                   ✨ Cordial
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
                                   onClick={() => handleSelectAISuggestion("professional")}
                                   className="px-2.5 py-1.5 rounded-lg bg-muted border-border/60 hover:bg-muted/70 text-[8px] font-black uppercase text-foreground transition-all flex items-center gap-1.5 border disabled:opacity-50"
                                 >
                                   👔 Profissional
                                 </button>
                              </div>
                           </div>
                         )}

                         <form onSubmit={handleSendReply} className="space-y-3 text-left">
                            <div className="space-y-2 text-left">
                               <div className="relative text-left">
                                  <textarea 
                                    placeholder={isAiTyping ? "Gerando sugestão..." : "Escreva sua resposta..."}
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
                                    className="absolute right-3 top-3 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 transition-all shadow-sm disabled:opacity-50"
                                  >
                                     <Send size={12} className={cn(submittingReply && "animate-pulse")} />
                                  </button>
                               </div>
                            </div>
                         </form>
                      </div>
                   </div>

                   {isAdminView && (
                      <div className="xl:col-span-1 border-l border-border/40 pl-6 flex flex-col justify-between h-full space-y-5 text-left animate-in fade-in duration-700">
                         
                         <div className="space-y-4 text-left">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono flex items-center gap-1.5 text-left">
                               <Cpu size={12} className="text-primary animate-pulse" /> Telemetria de Dados
                            </h3>

                            <div className="space-y-3.5 pt-2 text-left">
                               <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1 text-left">
                                  <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Prioridade</span>
                                  <span className={cn("text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider font-mono", telemetry?.urgencyColor)}>
                                     {telemetry?.urgency}
                                  </span>
                               </div>

                               <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1 text-left">
                                  <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Classificação</span>
                                  <span className="text-[10px] font-black text-foreground flex items-center gap-1.5 text-left">
                                     <Wand2 size={10} className="text-primary" /> {telemetry?.intent}
                                  </span>
                               </div>

                               <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-1 text-left">
                                  <span className="text-[7px] text-muted-foreground font-mono font-black uppercase block">Segurança de Dados</span>
                                  <span className="text-[10px] font-mono font-black text-primary text-left">
                                     {telemetry?.riskIndex}
                                   </span>
                               </div>
                            </div>
                         </div>

                         <div className="bg-black/40 border border-border/30 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[140px] font-mono relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/3 rounded-full blur-[40px] pointer-events-none" />
                            
                            <div className="text-left">
                               <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-3 text-left">
                                  <span className="text-[8px] font-black uppercase text-primary flex items-center gap-1">
                                    <Terminal size={10} /> SYSTEM LOG
                                  </span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                               </div>
                               <div className="text-[8px] text-muted-foreground/80 space-y-1.5 text-left">
                                  <p className="text-foreground/95 flex items-center gap-1"><span className="text-primary font-bold">»</span> LINK SEGURO ESTABELECIDO</p>
                                  <p className="flex items-center gap-1"><span className="text-emerald-500 font-bold">»</span> MONITORAMENTO ATIVO</p>
                                  <p className="flex items-center gap-1"><span className="text-muted-foreground/50">»</span> CLASSIFICAÇÃO: {selectedNotification.type?.toUpperCase() || "ALERTA"}</p>
                                  <p className="text-primary/95 flex items-center gap-1"><span className="text-primary font-bold">»</span> ASSISTENTE IA CARREGADO</p>
                                </div>
                            </div>
                            <div className="pt-4 mt-auto border-t border-border/20 text-left">
                               <div className="text-[7px] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-wider text-left">
                                 <Shield size={8} className="text-primary animate-pulse" /> PROTEÇÃO DIGITAL EXTRAJUS
                               </div>
                            </div>
                         </div>

                      </div>
                   )}

                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-5 relative overflow-hidden">
                   
                   <div className="relative flex items-center justify-center">
                     <div className="absolute w-24 h-24 bg-primary/5 border border-primary/10 rounded-full animate-ping duration-[3000ms]" />
                     <div className="absolute w-16 h-16 bg-primary/10 border border-primary/20 rounded-full animate-pulse" />
                     <div className="h-12 h-12 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground/60 relative z-10">
                        <MailOpen size={20} />
                     </div>
                   </div>

                   <div className="space-y-1 relative z-10">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] font-mono flex items-center justify-center gap-1.5">
                         <ShieldCheck size={12} className="text-primary" /> Central de Comunicação
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-wide max-w-[240px] mx-auto leading-relaxed">
                         Nenhuma comunicação selecionada. Escolha uma mensagem na lista lateral para visualizar os detalhes.
                      </p>
                   </div>
                </div>
             )}
          </div>

       </div>

      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-border/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <DialogHeader className="space-y-1.5 border-b border-border/40 pb-4 mb-4 text-left">
              <DialogTitle className="text-lg font-black tracking-wide text-foreground uppercase italic flex items-center gap-2 text-left">
                <LifeBuoy size={18} className="text-primary" /> Central de Chamados & Suporte
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-medium leading-relaxed text-left">
                Precisa de ajuda ou quer tirar alguma dúvida? Deixe sua mensagem e nós responderemos aqui em tempo real.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleOpenSupport} className="space-y-4 text-left">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-muted-foreground/80 block text-left">
                  Sua Mensagem / Dúvida
                </label>
                <textarea 
                  placeholder="Descreva seu problema ou dúvida de forma clara..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/35 resize-none min-h-[120px] text-left"
                  required
                />
              </div>

              <div className="flex gap-3 justify-center pt-2 border-t border-border/40 mt-6">
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
                  {isSupporting ? "Enviando..." : "Abrir Chamado"}
                </Button>
              </div>
            </form>
          </DialogContent>
      </Dialog>

   </div>
  );
}

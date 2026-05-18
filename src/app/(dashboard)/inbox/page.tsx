"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, Send, Trash2, Search, ArrowRight, User, ShieldCheck, HelpCircle, LifeBuoy } from "lucide-react";
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

  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const adminEmails = ['felipedutra@outlook.com'];

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
      // Escuta TUDO de notificações em tempo real no Modo Admin
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
      // Escuta apenas as próprias notificações no Modo Pessoal
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
        // Encontrar os user_ids únicos para mapear os e-mails e nomes na Caixa Geral
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
    
    // Se não estiver lida, marcar como lida no Supabase
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
        toast.success("Resposta enviada de volta aos generais!");
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

  const filteredNotifications = notifications.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      
      {/* Header Centralizado */}
      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mensagens Seguras</span>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
               <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic flex items-center gap-2.5">
                  Caixa de Entrada {unreadCount > 0 && <span className="bg-primary/20 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-black not-italic font-sans">{unreadCount} novas</span>}
               </h1>
               <p className="text-xs text-muted-foreground font-bold tracking-wide mt-1">
                  Seu cofre de comunicações diretas, respostas de forja e alertas do sistema.
               </p>
            </div>
            {!isAdminView && (
               <Button
                 onClick={() => setIsSupportOpen(true)}
                 className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(var(--primary),0.1)] border border-primary/20"
               >
                  <HelpCircle size={13} /> Abrir Chamado de Suporte
               </Button>
            )}
         </div>
      </div>

      {/* Grid Caixa de Entrada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[580px]">
         
         {/* Lado Esquerdo: Lista de Mensagens */}
         <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 flex flex-col justify-between h-full">
            <div className="space-y-5 flex-1 flex flex-col">
               
               {isUserAdmin && (
                  <div className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/50 rounded-2xl gap-2 animate-in fade-in duration-300">
                     <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Filtro de Visão</span>
                     <button 
                       onClick={() => {
                         const target = !isAdminView;
                         setIsAdminView(target);
                         setSelectedNotification(null);
                         fetchNotifications(user.id, target);
                       }}
                       className={cn(
                         "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                         isAdminView 
                           ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary),0.05)]" 
                           : "bg-muted/40 border-border text-muted-foreground"
                       )}
                     >
                        {isAdminView ? "👁️ MODO ADMIN" : "👤 MODO RECRUTA"}
                     </button>
                  </div>
               )}

               {/* Campo de Pesquisa */}
               <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                  <input 
                    type="text"
                    placeholder="Pesquisar comunicados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/35"
                  />
               </div>

               {/* Lista de Cards de Mensagens */}
               <div className="overflow-y-auto max-h-[460px] flex-1 space-y-3 custom-scrollbar pr-0.5">
                  {loading && notifications.length === 0 ? (
                     <div className="py-16 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-dashed border-border rounded-2xl">
                        Decodificando mensagens...
                     </div>
                  ) : filteredNotifications.length === 0 ? (
                     <div className="py-16 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-dashed border-border rounded-2xl">
                        Nenhum comunicado encontrado.
                     </div>
                  ) : (
                     filteredNotifications.map((n) => {
                       const isSelected = selectedNotification?.id === n.id;
                       return (
                          <div 
                            key={n.id}
                            onClick={() => handleSelectNotification(n)}
                            className={cn(
                              "p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col gap-2 relative group",
                              isSelected 
                                ? "bg-primary/5 border-primary/20 shadow-md" 
                                : "bg-muted/15 border-border/60 hover:bg-muted/30 hover:border-border"
                            )}
                          >
                             {/* Indicador de Unread */}
                             {!n.read && (
                               <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                             )}

                             <div className="flex justify-between items-start gap-4 pl-1">
                                <span className={cn(
                                  "text-[11px] font-black leading-tight truncate max-w-[80%]",
                                  !n.read ? "text-foreground" : "text-muted-foreground"
                                )}>
                                   {n.title}
                                </span>
                                <span className="text-[8px] text-muted-foreground/60 font-mono">
                                   {new Date(n.created_at).toLocaleDateString('pt-BR')}
                                </span>
                             </div>

                             {isAdminView && n.userProfile && (
                                <div className="text-[8px] font-mono text-primary font-bold pl-1 -mt-1 tracking-wide truncate">
                                   De: {n.userProfile.email}
                                </div>
                             )}

                             <p className="text-[10px] text-muted-foreground leading-normal truncate pl-1">
                                {n.message}
                             </p>

                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => handleDeleteNotification(n.id, e)}
                                  className="h-6 w-6 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
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

            </div>
         </div>
         {/* Lado Direito: Visualizador de Mensagens */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 relative flex flex-col justify-between h-full min-h-[480px]">
             {selectedNotification ? (
                <div className="flex flex-col justify-between h-full space-y-6">
                   
                   {/* Cabeçalho da Mensagem */}
                   <div className="space-y-4 border-b border-border pb-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div className="space-y-1">
                            <h2 className="text-base font-black text-foreground">{selectedNotification.title}</h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                               <User size={12} className="text-primary" />
                               {isAdminView && selectedNotification.userProfile ? (
                                  <span>Conversa com: <span className="text-foreground">{selectedNotification.userProfile.email} ({selectedNotification.userProfile.full_name || 'Recruta'})</span></span>
                               ) : (
                                  <span>Remetente: <span className="text-foreground">Arquitetura Central ExtraJus</span></span>
                               )}
                            </div>
                         </div>

                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-muted/60 border border-border px-2.5 py-1 rounded-md text-muted-foreground font-black">
                               {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedNotification.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
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
                   <div className="flex-1 overflow-y-auto max-h-[320px] space-y-4 pr-1.5 custom-scrollbar text-left">
                      
                      {/* Bolha 1: Mensagem Original do Sistema/Admin */}
                      <div className="flex flex-col gap-1.5 ml-auto items-end max-w-[85%] text-right animate-in fade-in slide-in-from-right-3 duration-300">
                         <div className="bg-muted/20 border border-border/50 p-4 rounded-2xl rounded-tr-none shadow-sm">
                            <p className="text-xs text-foreground font-bold whitespace-pre-wrap leading-relaxed text-right">
                               {selectedNotification.message}
                            </p>
                         </div>
                         <span className="text-[8px] text-muted-foreground/60 font-mono pr-1">
                            {new Date(selectedNotification.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} • {isAdminView && selectedNotification.userProfile ? (selectedNotification.userProfile.full_name || selectedNotification.userProfile.email) : "Mensagem Original"}
                         </span>
                      </div>

                      {/* Histórico de Réplicas */}
                      {loadingReplies && replies.length === 0 ? (
                         <div className="py-4 text-center text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            Carregando histórico...
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
                                    "p-4 rounded-2xl shadow-sm",
                                    isMe 
                                      ? "bg-primary/10 border border-primary/20 rounded-tl-none text-left" 
                                      : "bg-muted/30 border border-border/70 rounded-tr-none text-right"
                                  )}>
                                     <p className="text-xs text-foreground font-bold whitespace-pre-wrap leading-relaxed">
                                        {reply.message}
                                     </p>
                                  </div>
                                  <span className="text-[8px] text-muted-foreground/60 font-mono px-1">
                                     {reply.sender_name} • {new Date(reply.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                               </div>
                            );
                         })
                      )}
                      <div ref={chatEndRef} />
                   </div>

                   {/* Caixa de Resposta */}
                   <div className="border-t border-border pt-6 mt-auto">
                      <form onSubmit={handleSendReply} className="space-y-3">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground/80 block uppercase tracking-wider text-left">Responder Comunicado</label>
                            <div className="relative">
                               <textarea 
                                 placeholder={`Escreva sua réplica ou mensagem de acompanhamento... (Pressione Enter para enviar)`}
                                 value={replyText}
                                 onChange={(e) => setReplyText(e.target.value)}
                                 onKeyDown={(e) => {
                                   if (e.key === "Enter" && !e.shiftKey) {
                                     e.preventDefault();
                                     const form = e.currentTarget.form;
                                     if (form) form.requestSubmit();
                                   }
                                 }}
                                 rows={3}
                                 className="w-full bg-muted/30 border border-border rounded-2xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none pr-12 text-left"
                                 required
                               />
                               <button 
                                 type="submit"
                                 disabled={submittingReply}
                                 className="absolute right-3.5 bottom-3.5 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
                                 title="Enviar Resposta"
                               >
                                  <Send size={12} className={cn(submittingReply && "animate-pulse")} />
                               </button>
                            </div>
                         </div>
                      </form>
                   </div>

                </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted/30 border border-border flex items-center justify-center text-muted-foreground/45 animate-pulse">
                     <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Nenhuma Mensagem Selecionada</h3>
                     <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
                        Selecione um comunicado no painel esquerdo para descriptografar os dados.
                     </p>
                  </div>
               </div>
            )}
         </div>

      </div>

      {/* Modal de Suporte */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-border backdrop-blur-md rounded-2xl shadow-2xl p-6">
          <DialogHeader className="space-y-1.5 border-b border-border pb-4 mb-4">
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
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-border mt-6">
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
                className="h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
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

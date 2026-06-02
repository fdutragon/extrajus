"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Mail, MailOpen, Send, Trash2, Search, User, ShieldCheck, 
  HelpCircle, LifeBuoy, Sparkles, Cpu, Terminal, Shield, 
  Zap, Wand2, Eye, Activity, Wifi, Clock, MessageSquare,
  Plus, Minus
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

  const adminEmails = ['felipe.dutragon@gmail.com'];

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
      toast.success("Chamado aberto! Acompanhe aqui na Inbox.");
      setSupportMessage("");
      setIsSupportOpen(false);
      fetchNotifications(user.id, isAdminView);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao abrir chamado.");
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

  // Remove scroll/padding do main pai enquanto inbox está ativa
  useEffect(() => {
    const mainEl = document.querySelector('main') as HTMLElement | null;
    const wrapperEl = mainEl?.firstElementChild as HTMLElement | null;
    if (mainEl) {
      mainEl.style.overflow = 'hidden';
      mainEl.style.padding = '0';
    }
    if (wrapperEl) {
      wrapperEl.style.maxWidth = 'none';
      wrapperEl.style.height = '100%';
    }
    return () => {
      if (mainEl) {
        mainEl.style.overflow = '';
        mainEl.style.padding = '';
      }
      if (wrapperEl) {
        wrapperEl.style.maxWidth = '';
        wrapperEl.style.height = '';
      }
    };
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
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications(user.id, true);
      });
    } else {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload: any) => {
        const targetUserId = payload.new?.user_id || payload.old?.user_id;
        if (targetUserId === user.id) fetchNotifications(user.id, false);
      });
    }
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, isAdminView]);

  useEffect(() => {
    if (!selectedNotification?.id) return;
    const channel = supabase
      .channel(`replies-realtime-${selectedNotification.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_replies' }, (payload: any) => {
        if (payload.new && payload.new.notification_id === selectedNotification.id) {
          fetchReplies(selectedNotification.id);
        }
      });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedNotification?.id]);

  const fetchNotifications = async (userId: string, forceAdminView?: boolean) => {
    setLoading(true);
    try {
      const activeAdminView = forceAdminView !== undefined ? forceAdminView : isAdminView;
      let query = supabase.from('notifications').select('*');
      if (!activeAdminView) query = query.eq('user_id', userId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (activeAdminView && data && data.length > 0) {
        const userIds = Array.from(new Set(data.map(n => n.user_id)));
        const { data: profiles } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);
        const profileMap = (profiles || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});
        setNotifications(data.map(n => ({ ...n, userProfile: profileMap[n.user_id] || { email: 'sistema@extrajus.com', full_name: 'Usuário Externo' } })));
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
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notification.id);
        if (!error) setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      toast.success("Mensagem excluída.");
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) setSelectedNotification(null);
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
        body: JSON.stringify({ notificationId: selectedNotification.id, originalTitle: selectedNotification.title, replyMessage: replyText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resposta enviada!");
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
    if (suggestionType === "polite") text = "Olá. Analisamos sua solicitação e confirmamos que nossa equipe técnica já está auditando os parâmetros do documento. Fique tranquilo, o acompanhamento é feito em tempo real por aqui.";
    else if (suggestionType === "technical") text = "PROTOCOLO DE SEGURANÇA: Conexão segura estabelecida. A análise técnica do seu documento indica compatibilidade de 99.8% com nossos modelos de conformidade. Solicitação aceita e em fila de processamento.";
    else if (suggestionType === "professional") text = "Sua solicitação de suporte já está em análise pelos nossos especialistas da ExtraJus. Estamos processando as informações e retornaremos com uma solução em breve. Acompanhe o status por este canal.";
    setIsAiTyping(true);
    setReplyText("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) { setReplyText((prev) => prev + text.charAt(index)); index++; }
      else { clearInterval(interval); setIsAiTyping(false); toast.success("Sugestão gerada!"); }
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
      riskIndex: isSupport ? "Seguro" : isForge ? "Conformidade Padrão" : "Criptografado"
    };
  };

  const telemetry = getTelemetryData(selectedNotification);

  if (!mounted) return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-background animate-in fade-in duration-500 relative">

      {/* Ambient glows */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/2 rounded-full blur-[120px] pointer-events-none" />

      {/* ── LEFT PANEL: Message List ── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border h-full bg-background/95 backdrop-blur-md">

        {/* List header */}
        <div className="px-5 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-primary font-mono mb-1">Secure Comms</p>
              <h1 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
                Inbox
                {unreadCount > 0 && (
                  <span className="text-[9px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              {isUserAdmin && (
                <button
                  onClick={() => {
                    const target = !isAdminView;
                    setIsAdminView(target);
                    setSelectedNotification(null);
                    fetchNotifications(user.id, target);
                  }}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-lg border transition-all cursor-pointer",
                    isAdminView
                      ? "bg-primary/20 text-primary border-primary/45"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                  )}
                  title={isAdminView ? "Admin View" : "My Messages"}
                >
                  <Eye size={11} />
                </button>
              )}
              {!isAdminView && (
                <button
                  onClick={() => setIsSupportOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
                  title="Open Support Ticket"
                >
                  <HelpCircle size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={11} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-border pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary/60 outline-none transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground/60">
              <Activity size={16} className="text-primary/75 animate-spin" />
              <span className="text-[8px] uppercase tracking-widest font-black">Loading...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground/60">
              <MailOpen size={16} />
              <span className="text-[8px] uppercase tracking-widest font-black">No messages</span>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isSelected = selectedNotification?.id === n.id;
              const isSupport = n.type === 'support';
              const isForge = n.type === 'forge';
              const TypeIcon = isSupport ? LifeBuoy : isForge ? Zap : Mail;
              const typeColor = isSupport ? 'text-amber-500 font-bold' : isForge ? 'text-primary font-bold' : 'text-emerald-500 font-bold';

              return (
                <div
                  key={n.id}
                  onClick={() => handleSelectNotification(n)}
                  className={cn(
                    "relative flex flex-col gap-1 px-5 py-3.5 cursor-pointer transition-all border-b border-border/30 group",
                    isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                  )}
                >
                  {/* Active / unread bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[2px] transition-all",
                    isSelected ? "bg-primary" : !n.read ? "bg-amber-500" : "bg-transparent"
                  )} />

                  {/* Unread dot */}
                  {!n.read && !isSelected && (
                    <span className="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}

                  <div className="flex items-center gap-1.5 pr-4 min-w-0">
                    <TypeIcon size={10} className={cn(typeColor, "shrink-0")} />
                    <span className={cn(
                      "text-xs truncate leading-snug flex-1",
                      !n.read && !isSelected ? "text-foreground font-black" : "text-foreground/90 font-semibold"
                    )}>
                      {n.title}
                    </span>
                  </div>

                  {isAdminView && n.userProfile && (
                    <span className="text-[9px] font-mono text-primary truncate pl-3 font-semibold">
                      {n.userProfile.full_name || n.userProfile.email}
                    </span>
                  )}

                  <p className="text-[11px] text-muted-foreground/80 truncate leading-snug pl-3 font-medium">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between pl-3 mt-0.5">
                    <span className={cn("text-[8px] uppercase tracking-widest font-mono font-black", typeColor)}>
                      {isSupport ? "Support" : isForge ? "Request" : "System"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground/75 font-mono font-medium">
                        {new Date(n.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <button
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded flex items-center justify-center text-muted-foreground/60 hover:text-destructive transition-all cursor-pointer"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Status bar */}
        <div className="px-5 py-2.5 border-t border-border shrink-0 flex items-center justify-between">
          <span className="text-[9px] font-mono text-muted-foreground/70 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Encrypted · Online
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/60 font-semibold">
            {filteredNotifications.length} msgs
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat / Detail ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedNotification ? (
          <div className={cn("flex h-full", isAdminView ? "flex-row" : "flex-col")}>

            {/* Chat area */}
            <div className={cn("flex flex-col h-full", isAdminView ? "flex-1 border-r border-border/30" : "w-full")}>

              {/* Chat header */}
              <div className="px-7 py-4 border-b border-border shrink-0 flex items-center justify-between gap-4 bg-background/95">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {selectedNotification.type === 'support'
                      ? <LifeBuoy size={12} className="text-amber-500 shrink-0 font-bold" />
                      : selectedNotification.type === 'forge'
                      ? <Zap size={12} className="text-primary shrink-0 font-bold" />
                      : <Mail size={12} className="text-emerald-500 shrink-0 font-bold" />}
                    <h2 className="text-base font-black text-foreground truncate">{selectedNotification.title}</h2>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 font-semibold flex items-center gap-1.5 mt-0.5 pl-0.5">
                    <User size={8} className="text-primary/70 shrink-0" />
                    {isAdminView && selectedNotification.userProfile
                      ? <>{selectedNotification.userProfile.full_name} · {selectedNotification.userProfile.email}</>
                      : <>From: ExtraJus Support</>}
                    <span className="opacity-60 font-black">·</span>
                    <Clock size={7} className="opacity-60" />
                    <span className="opacity-60 font-semibold">{new Date(selectedNotification.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(selectedNotification.id, e)}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4 custom-scrollbar">
                {/* Original message bubble */}
                <div className={cn("flex flex-col gap-1 max-w-[72%]", isAdminView ? "mr-auto" : "ml-auto items-end")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed text-foreground font-semibold shadow-sm",
                    isAdminView
                      ? "bg-muted/75 border border-border/80 rounded-tl-none"
                      : "bg-primary/15 border border-primary/30 rounded-tr-none"
                  )}>
                    {selectedNotification.message}
                  </div>
                  <span className="text-[9px] text-muted-foreground/70 font-mono flex items-center gap-1 px-1 font-semibold">
                    <Clock size={8} /> {new Date(selectedNotification.created_at).toLocaleDateString('pt-BR')} · Original
                  </span>
                </div>

                {/* Replies */}
                {loadingReplies && replies.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest animate-pulse">
                    <Activity size={9} className="animate-spin text-primary/60" /> Loading...
                  </div>
                ) : (
                  replies.map((reply) => {
                    const isMe = reply.sender_id === user?.id;
                    return (
                      <div
                        key={reply.id}
                        className={cn(
                          "flex flex-col gap-1 max-w-[72%]",
                          isMe ? "ml-auto items-end animate-in fade-in slide-in-from-right-2 duration-300" : "mr-auto animate-in fade-in slide-in-from-left-2 duration-300"
                        )}
                      >
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed text-foreground font-semibold shadow-sm",
                          isMe
                            ? "bg-primary/15 border border-primary/30 rounded-tr-none"
                            : "bg-muted/75 border border-border/80 rounded-tl-none"
                        )}>
                          {reply.message}
                        </div>
                        <span className="text-[9px] text-muted-foreground/70 font-mono flex items-center gap-1 px-1 font-semibold">
                          <User size={8} className="text-primary/70" /> {reply.sender_name} · {new Date(reply.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-7 py-4 border-t border-border shrink-0 space-y-2.5 bg-background/95">
                {/* AI tone chips (admin only) */}
                {isAdminView && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Sparkles size={10} className="text-primary/75" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 font-mono">AI tone:</span>
                    {[
                      { key: "polite", label: "✨ Polite" },
                      { key: "technical", label: "⚡ Technical" },
                      { key: "professional", label: "👔 Pro" },
                    ].map(s => (
                      <button
                        key={s.key}
                        disabled={isAiTyping}
                        onClick={() => handleSelectAISuggestion(s.key)}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border border-border bg-muted/40 hover:bg-primary/15 hover:border-primary/45 hover:text-primary text-muted-foreground/80 transition-all disabled:opacity-30 cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendReply} className="flex items-end gap-2">
                  <textarea
                    placeholder={isAiTyping ? "Generating..." : "Reply... (↵ send · ⇧↵ newline)"}
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
                    rows={2}
                    className="flex-1 bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 resize-none disabled:opacity-40"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || isAiTyping}
                    className="shrink-0 h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 mb-px cursor-pointer"
                  >
                    <Send size={13} className={cn(submittingReply && "animate-pulse")} />
                  </button>
                </form>
              </div>
            </div>

            {/* Admin telemetry sidebar */}
            {isAdminView && (
              <div className="w-52 shrink-0 flex flex-col px-5 pt-6 pb-4 overflow-y-auto custom-scrollbar border-l border-border bg-background/60 shadow-sm">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 font-mono flex items-center gap-1.5 mb-5">
                  <Cpu size={8} className="text-primary/70" /> Telemetry
                </h3>

                <div className="space-y-1.5 flex-1">
                  {[
                    { label: "Priority", value: <span className={cn("text-[10px] font-black uppercase tracking-wider font-mono shadow-sm", telemetry?.urgencyColor)}>{telemetry?.urgency}</span> },
                    { label: "Type", value: <span className="text-[10px] font-bold text-foreground/90 flex items-center gap-1"><Wand2 size={9} className="text-primary/70" />{telemetry?.intent}</span> },
                    { label: "Security", value: <span className="text-[10px] font-mono font-black text-primary/80">{telemetry?.riskIndex}</span> },
                  ].map(item => (
                    <div key={item.label} className="py-2.5 border-b border-border space-y-1">
                      <p className="text-[7px] text-muted-foreground/60 uppercase tracking-widest font-mono font-black">{item.label}</p>
                      {item.value}
                    </div>
                  ))}
                </div>

                {/* Terminal log */}
                <div className="mt-4 bg-black/45 border border-border/30 rounded-xl p-3 font-mono space-y-1.5">
                  <div className="flex items-center justify-between border-b border-border/30 pb-1.5 mb-2">
                    <span className="text-[8px] font-black uppercase text-primary/80 flex items-center gap-1"><Terminal size={7} /> Log</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  {[
                    { c: "text-primary/80 font-semibold", t: "SECURE LINK OK" },
                    { c: "text-emerald-500/80 font-semibold", t: "MONITORING ACTIVE" },
                    { c: "text-muted-foreground/60", t: `TYPE: ${selectedNotification.type?.toUpperCase()}` },
                    { c: "text-primary/75 font-semibold", t: "AI LOADED" },
                  ].map((l, i) => (
                    <p key={i} className={cn("text-[8px] flex items-center gap-1", l.c)}>
                      <span className="opacity-70">»</span> {l.t}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative">
              <div className="absolute w-20 h-20 bg-primary/10 border border-primary/30 rounded-full animate-ping duration-[3000ms] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-14 h-14 bg-primary/15 rounded-full animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 w-12 h-12 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground/60">
                <MailOpen size={20} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 font-mono flex items-center justify-center gap-1.5 mb-1.5">
                <ShieldCheck size={9} className="text-primary/50" /> Communication Center
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-[180px] leading-relaxed font-semibold">
                Select a message to start.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── SUPPORT DIALOG ── */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="max-w-md bg-card border border-border/60 rounded-[28px] shadow-2xl p-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="p-7">
            <DialogHeader className="space-y-1 border-b border-border/40 pb-5 mb-5">
              <DialogTitle className="text-sm font-black tracking-wide text-foreground uppercase flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <LifeBuoy size={13} className="text-primary" />
                </div>
                Support Ticket
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed font-semibold">
                Describe your issue clearly and we'll respond here in real time.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleOpenSupport} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-muted-foreground/75 uppercase tracking-widest block">Message</label>
                <textarea
                  placeholder="Describe your problem..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-xs text-foreground focus:ring-1 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/60 resize-none min-h-[110px]"
                  required
                />
              </div>
              <div className="flex gap-3 pt-1 border-t border-border/30">
                <Button type="button" variant="ghost" onClick={() => setIsSupportOpen(false)}
                  className="flex-1 h-10 rounded-2xl text-[10px] font-black text-muted-foreground/80 hover:bg-muted/50 uppercase tracking-widest cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSupporting}
                  className="flex-1 h-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
                  {isSupporting ? "Sending..." : "Open Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

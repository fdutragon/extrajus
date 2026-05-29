"use client"

import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  PenTool,
  Zap,
  Command,
  Brain,
  Mail,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef, useTransition } from "react";
import { signOut } from "../(auth)/login/actions";
import { createClient } from "@/utils/supabase/client";
import { createContractAction } from "@/app/actions";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [contractCount, setContractCount] = useState<number | null>(null);
  const [signatureCount, setSignatureCount] = useState<number | null>(null);
  const profileRef = useRef<any>(null);
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Reset zoom styles if previously applied
  useEffect(() => {
    document.documentElement.style.fontSize = "";
    localStorage.removeItem('extrajus-zoom');
  }, []);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // 1. Buscar o perfil inicialmente e ouvir atualizações locais
  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    }

    fetchProfile();

    // Ouvir atualizações locais do settings
    window.addEventListener('profile-updated', fetchProfile);
    
    return () => {
      window.removeEventListener('profile-updated', fetchProfile);
    };
  }, []);

  // Buscar contagens em tempo real
  useEffect(() => {
    if (!profile?.id) return;
    
    async function fetchCounts() {
      try {
        const userEmailLower = profile.email?.toLowerCase().trim() || "";
        
        // Buscar contratos
        const { data: contractsData } = await supabase
          .from('contracts')
          .select('id')
          .eq('user_id', profile.id);
        
        const contractsList = contractsData || [];
        setContractCount(contractsList.length);

        // Buscar assinaturas
        const { data: sigsData } = await supabase
          .from('signatures')
          .select('id, contract_id, signers');
        
        if (sigsData) {
          const filtered = sigsData.filter((sig: any) => {
            const isOwner = contractsList.some((c: any) => c.id === sig.contract_id);
            const isSigner = sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower);
            return isOwner || isSigner;
          });
          setSignatureCount(filtered.length);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchCounts();

    // Recarregar em eventos de atualização de perfil
    window.addEventListener('profile-updated', fetchCounts);
    return () => {
      window.removeEventListener('profile-updated', fetchCounts);
    };
  }, [profile?.id, profile?.email]);

  // Atalho de teclado global: Alt + C ou Alt + N para criar novo contrato
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignorar se o usuário estiver focado em inputs, textareas ou editores
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable") ||
          activeEl.closest(".ProseMirror"))
      ) {
        return;
      }

      // Atalho: Alt + C ou Alt + N
      if (e.altKey && (e.key === "c" || e.key === "C" || e.key === "n" || e.key === "N")) {
        e.preventDefault();
        
        toast.loading("⚔️ Criando novo contrato via atalho...", { id: "shortcut-creation" });
        startTransition(async () => {
          try {
            // Obter sessão do usuário de forma segura e rápida
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              toast.error("Acesso negado. Usuário não autenticado.", { id: "shortcut-creation" });
              return;
            }

            // Inserir contrato diretamente pelo Supabase Client-Side (Mais rápido e blindado contra erros de redirecionamento)
            const { data, error } = await supabase
              .from('contracts')
              .insert({
                user_id: user.id,
                title: `Novo Contrato - ${new Date().toLocaleDateString('pt-BR')}`,
                status: 'draft'
              })
              .select()
              .single();

            if (error) throw error;

            toast.success("⚔️ Contrato criado com sucesso!", { id: "shortcut-creation" });
            router.push(`/editor?room=${data.id}`);
            
            // Disparar recarga de estatísticas das sidebars
            window.dispatchEvent(new Event('profile-updated'));
          } catch (err) {
            console.error("Erro ao criar contrato por atalho:", err);
            toast.error("Erro ao criar contrato via atalho.", { id: "shortcut-creation" });
          }
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  // Atalhos Globais de Navegação Rápida (Alt+H/D/I/S/A/K) e Escape para fechar
  useEffect(() => {
    function handleNavigationKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.hasAttribute("contenteditable") ||
          activeEl.closest(".ProseMirror"))
      ) {
        return;
      }

      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "h" || key === "d") {
          e.preventDefault();
          router.push("/dashboard");
        } else if (key === "i") {
          e.preventDefault();
          router.push("/inbox");
        } else if (key === "s") {
          e.preventDefault();
          router.push("/brain");
        } else if (key === "a") {
          e.preventDefault();
          router.push("/modelos");
        } else if (key === "k") {
          e.preventDefault();
          setIsShortcutsOpen(prev => !prev);
        }
      }

      if (e.key === "Escape") {
        setIsShortcutsOpen(false);
      }
    }

    window.addEventListener("keydown", handleNavigationKeyDown);
    return () => {
      window.removeEventListener("keydown", handleNavigationKeyDown);
    };
  }, [router]);

  // 2. Conexão isolada e blindada para o Realtime (Tempo Real)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile-realtime-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload: any) => {
          const newProfile = payload.new;
          const oldProfile = profileRef.current;

          setProfile(newProfile);
          window.dispatchEvent(new Event('profile-updated'));

          // Notificação visual de recarga
          if (oldProfile && newProfile.credits > oldProfile.credits) {
            const added = newProfile.credits - oldProfile.credits;
            toast.success(`💥 Créditos Adicionados! +${added} novos créditos adicionados!`, {
              description: `Confirmado via Pix. Seu novo saldo é de ${newProfile.credits} créditos.`,
              duration: 10000,
            });
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // 3. Notificações em Tempo Real (Sino de Notificações)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    async function fetchNotifications() {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        }
      } catch (err) {
        console.error("Notifications Fetch error:", err);
      }
    }

    fetchNotifications();

    const channel = supabase
      .channel(`notifications-realtime-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload: any) => {
          const targetUserId = payload.new?.user_id || payload.old?.user_id;
          if (targetUserId === profile.id) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Notificação marcada como lida.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile.id);

      if (!error) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success("Todas as notificações foram limpas com sucesso.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Projetos Recentes Dinâmicos em Tempo Real
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    async function fetchRecentProjects() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const userEmailLower = user.email?.toLowerCase().trim() || "";

        // A. Buscar as assinaturas pendentes de selamento para este usuário
        const { data: pendingSigs } = await supabase
          .from('signatures')
          .select('id, contract_id, signers, status, created_at, contracts(id, title)')
          .eq('status', 'pending');

        const pendingList = (pendingSigs || [])
          .filter((sig: any) => 
            sig.signers?.some((s: any) => s.email?.toLowerCase().trim() === userEmailLower && !s.signed)
          )
          .map((sig: any) => ({
            id: sig.contracts?.id || sig.contract_id,
            name: sig.contracts?.title || "Contrato Sem Título",
            isPending: true
          }))
          .slice(0, 3);

        if (pendingList.length > 0) {
          setRecentProjects(pendingList);
        } else {
          // B. Caso não haja pendentes, carregar os 3 últimos contratos editados/criados pelo usuário
          const { data: editedContracts } = await supabase
            .from('contracts')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(3);

          const editedList = (editedContracts || []).map((c: any) => ({
            id: c.id,
            name: c.title,
            isPending: false
          }));

          setRecentProjects(editedList);
        }
      } catch (err) {
        console.error("Error loading recent projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    }

    fetchRecentProjects();

    // Ouvir alterações em tempo real de contratos ou assinaturas para atualizar na hora!
    const channel = supabase
      .channel('sidebar-projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        fetchRecentProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signatures' }, () => {
        fetchRecentProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Persist sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const adminEmails = ["felipedutra@outlook.com"];
  const isAdmin = adminEmails.includes(profile?.email || '');

  const baseNavItems = [
    { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Caixa de Entrada", href: "/inbox", icon: Mail },
    { name: "Contratos", href: "/contracts", icon: FileText },
    { name: "Assinaturas", href: "/signatures", icon: PenTool },
    { name: "Modelos", href: "/modelos", icon: Zap },
    { name: "Créditos de IA", href: "/brain", icon: Brain },
  ];

  const navItems = isAdmin
    ? [{ name: "Painel de Comando", href: "/admin", icon: Command }, ...baseNavItems]
    : baseNavItems;

  const secondaryItems = [
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden font-sans p-1 md:p-1.5 gap-1 transition-colors duration-500 relative">
      {/* Sidebar Backdrop (Mobile Only) */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar Island */}
      <aside className={cn(
        "bg-card border-border flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50 overflow-hidden shrink-0",
        // Mobile (Default)
        "fixed inset-y-1 left-1 rounded-xl",
        isCollapsed ? "-translate-x-full w-0 opacity-0" : "translate-x-0 w-64 opacity-100",
        // Desktop (lg)
        "lg:static lg:translate-x-0 lg:opacity-100 lg:w-64 lg:rounded-l-xl lg:rounded-r-none lg:border border-r-0 lg:inset-auto",
        isCollapsed ? "lg:w-12" : "lg:w-64"
      )}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        {/* Organization Switcher / Logo Area */}
        <div className="h-12 px-3 flex items-center overflow-hidden shrink-0 border-b border-border relative z-10">
          <div className={cn(
            "flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500",
            isCollapsed && "justify-center w-full"
          )}>
            <Logo showText={!isCollapsed} iconSize={22} variant="chrome" />
          </div>
        </div>

        <div className="flex-1 px-2.5 py-4 space-y-8 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar-sidebar">
          {/* System Stats Widget - Only visible when not collapsed */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn(
              "px-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-700",
              isCollapsed && "hidden lg:hidden"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.18em]">Painel de Operações</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                </div>
              </div>

              {/* Glowing Sinapses Credit Card */}
              <Link 
                href="/settings"
                className="block bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-xl p-3 border border-primary/25 hover:border-primary/50 transition-all text-left shadow-lg relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Brain size={10} className="text-primary animate-pulse" /> Sinapses Ativas
                  </span>
                  <span className="text-[7px] font-black text-primary/70 group-hover:text-primary transition-colors uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">RECARREGAR</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[16px] font-mono font-black text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]">
                    {profile?.credits !== undefined ? profile.credits : "30"}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium font-mono">disponíveis</span>
                </div>
                <p className="text-[9px] text-muted-foreground/80 mt-1 leading-normal">
                  Crie contratos (100) ou refine com IA (10).
                </p>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-lg p-2 border border-border hover:bg-muted/70 transition-all text-left">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Contratos</div>
                  <div className="text-sm font-mono font-bold text-foreground/80">
                    {contractCount !== null ? contractCount : "..."}
                  </div>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 border border-border hover:bg-muted/70 transition-all text-left">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">Assinaturas</div>
                  <div className="text-sm font-mono font-bold text-foreground/80">
                    {signatureCount !== null ? signatureCount : "..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className={cn("px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] animate-in fade-in duration-700", isCollapsed && "lg:hidden")}>Geral</div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const collapsedOnDesktop = isCollapsed;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) setIsCollapsed(true); }}
                  className={cn(
                    "flex items-center gap-2.5 py-2 text-[12.5px] font-medium transition-all group rounded-lg overflow-hidden",
                    collapsedOnDesktop ? "lg:justify-center lg:px-0" : "px-2.5",
                    !collapsedOnDesktop && "px-2.5",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  )}
                  title={collapsedOnDesktop ? item.name : ""}
                >
                  <Icon size={15} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors shrink-0")} />
                  <span className={cn(
                    "truncate animate-in fade-in slide-in-from-left-1 duration-300",
                    collapsedOnDesktop && "lg:hidden"
                  )}>{item.name}</span>
                  {item.name === "Contratos" && !collapsedOnDesktop && (
                    <kbd className="hidden lg:group-hover:inline-block ml-auto text-[8px] bg-muted border border-border px-1 py-0.5 rounded font-mono text-muted-foreground/80 scale-90 animate-in fade-in duration-300">
                      Alt+C
                    </kbd>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Recent Projects - New Section */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn("space-y-3 animate-in fade-in duration-1000 delay-300", isCollapsed && "lg:hidden")}>
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Projetos Recentes</div>
              <div className="space-y-1">
                {loadingProjects ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-6 mx-2 bg-muted/20 rounded animate-pulse mb-1.5" />
                  ))
                ) : recentProjects.length === 0 ? (
                  <div className="px-2.5 py-1.5 text-xs text-muted-foreground/60 italic leading-normal">
                    Nenhum projeto ativo ou pendente.
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={project.isPending ? "/signatures" : `/editor?room=${project.id}`}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11.5px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all group"
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform",
                        project.isPending ? "bg-amber-500 animate-pulse" : "bg-primary"
                      )} />
                      <span className="truncate flex-1 text-left">{project.name}</span>
                      {project.isPending && (
                        <span className="text-[7.5px] h-3.5 px-1 border border-amber-500/30 text-amber-500 bg-amber-500/10 rounded font-black shrink-0 uppercase tracking-wider flex items-center justify-center leading-none">SELO</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className={cn("px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] animate-in fade-in duration-700", isCollapsed && "lg:hidden")}>Sistema</div>
            )}
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              const collapsedOnDesktop = isCollapsed;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 1024) setIsCollapsed(true); }}
                  className={cn(
                    "flex items-center gap-2.5 py-2 text-[12.5px] font-medium transition-all group rounded-lg overflow-hidden",
                    collapsedOnDesktop ? "lg:justify-center lg:px-0" : "px-2.5",
                    !collapsedOnDesktop && "px-2.5",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  )}
                  title={collapsedOnDesktop ? item.name : ""}
                >
                  <Icon size={15} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors shrink-0")} />
                  <span className={cn(
                    "truncate animate-in fade-in slide-in-from-left-1 duration-300",
                    collapsedOnDesktop && "lg:hidden"
                  )}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ExtraJus Pulse - AI Live Activity Feed */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn("px-2 pt-4 border-t border-border space-y-3 animate-in fade-in duration-1000", isCollapsed && "lg:hidden")}>
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute inset-0" />
                   <div className="w-2 h-2 rounded-full bg-primary relative" />
                 </div>
                 <span className="text-xs font-bold text-primary uppercase tracking-widest">ExtraJus Pulse</span>
               </div>
               <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                 <p className="text-xs text-primary/80 leading-tight italic font-medium font-mono">
                   "Análise de cláusulas ativa em todos os contratos."
                 </p>
               </div>
            </div>
          )}
        </div>

        {/* User / Footer */}
        <div className="p-2 border-t border-border space-y-1 shrink-0 relative z-10">
          <button 
            className={cn(
              "flex items-center gap-2.5 w-full py-2 rounded-lg hover:bg-muted transition-colors group overflow-hidden border border-transparent",
              isCollapsed ? "lg:justify-center lg:px-0" : "px-2.5"
            )}
            onClick={async () => await signOut()}
          >
            <LogOut size={15} className="text-muted-foreground group-hover:text-destructive transition-colors shrink-0" />
            <span className={cn(
              "text-[12.5px] font-medium text-muted-foreground group-hover:text-foreground truncate animate-in fade-in slide-in-from-left-1 duration-300",
              isCollapsed && "lg:hidden"
            )}>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Island */}
      <div className="flex-1 flex flex-col min-w-0 bg-background border border-border rounded-r-xl rounded-l-none lg:rounded-l-none shadow-sm overflow-hidden relative transition-all duration-500">
        {/* Top Navigation Bar Integrated into Content Island */}
        <header className="h-14 md:h-12 border-b border-border/50 flex items-center justify-between px-3 md:px-4 shrink-0 bg-background/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-2.5 flex-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 md:p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px] md:w-[15px] md:h-[15px]" /> : <PanelLeftClose className="w-[18px] h-[18px] md:w-[15px] md:h-[15px]" />}
            </button>
            
            <div className="h-4 w-px bg-border/60 mx-0.5" />
 
            {/* Shortcuts button */}
            <button 
              onClick={() => setIsShortcutsOpen(true)}
              className="relative group flex items-center gap-1.5 bg-muted/40 hover:bg-muted border border-border/40 hover:border-primary/20 rounded-lg pl-6 pr-2 md:pr-3 py-1 md:py-1.5 text-muted-foreground hover:text-foreground transition-all outline-none cursor-pointer whitespace-nowrap h-8 md:h-auto"
            >
              <Zap className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 w-[12px] h-[12px] md:w-[10px] md:h-[10px]" />
              <span className="font-medium text-[11px] hidden sm:block">Atalhos</span>
              <kbd className="flex items-center gap-0.5 text-[8px] bg-background/80 border border-border/60 px-1.5 py-0.5 rounded font-mono font-bold group-hover:text-primary transition-colors shrink-0">
                Alt+K
              </kbd>
            </button>
          </div>
 
          <div className="flex items-center gap-2">
            {/* User */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm font-semibold leading-tight italic text-foreground/70">
                  {new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite"},{" "}
                  {(() => {
                    const name = profile?.full_name?.split(' ')[0] || 'Usuário';
                    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                  })()}!
                </span>
              </div>
              <Avatar className="h-8 w-8 md:h-7 md:w-7 rounded-full border border-border ring-0 group-hover:ring-2 ring-primary/20 transition-all">
                <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                <AvatarFallback className="text-xs">{profile?.full_name?.slice(0,2).toUpperCase() || "US"}</AvatarFallback>
              </Avatar>
            </div>
 
            <div className="h-3 w-px bg-border/50 mx-0.5" />
 
            {/* Notifications bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 md:p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <Bell className="w-[18px] h-[18px] md:w-[16px] md:h-[16px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-250 p-4">
                  <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                    <span className="text-sm font-bold text-foreground uppercase tracking-wider">Notificações</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                      >
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2.5 custom-scrollbar pr-0.5">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => n.link && router.push(n.link)}
                          className={cn(
                            "p-2.5 rounded-xl border transition-all text-left flex flex-col gap-1 cursor-pointer",
                            n.read 
                              ? "bg-transparent border-transparent hover:bg-muted/30" 
                              : "bg-primary/5 border-primary/10 hover:bg-primary/10"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={cn("text-sm font-bold leading-tight", !n.read ? "text-foreground" : "text-muted-foreground")}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <button 
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="w-1.5 h-1.5 rounded-full bg-primary hover:scale-125 transition-transform" 
                                title="Marcar como lida"
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-normal">{n.message}</p>
                          <span className="text-[8px] text-muted-foreground/60 font-mono mt-1">
                            {new Date(n.created_at).toLocaleDateString('pt-BR')} às {new Date(n.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-border/50 mx-0.5" />

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Shortcuts Help Modal */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsShortcutsOpen(false)}
          />
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col text-left">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Zap size={14} className="text-primary animate-pulse" /> Teclas de Atalho
                </h3>
                <p className="text-sm text-muted-foreground">
                  Acelere sua navegação jurídica global via teclado.
                </p>
              </div>
              <button 
                onClick={() => setIsShortcutsOpen(false)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Ações Globais</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Criar Novo Contrato</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-primary font-bold shadow-sm">Alt + C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Abrir este Menu de Atalhos</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-primary font-bold shadow-sm">Alt + K</kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block">Navegação Rápida</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Painel (Dashboard)</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-muted-foreground font-bold shadow-sm">Alt + H</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Inbox (Notificações)</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-muted-foreground font-bold shadow-sm">Alt + I</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Rede de Conexões (Grafo)</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-muted-foreground font-bold shadow-sm">Alt + S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 transition-colors">
                    <span className="text-[11.5px] font-medium text-foreground">Modelos (Biblioteca de Modelos)</span>
                    <kbd className="text-xs font-mono bg-background border border-border/80 px-1.5 py-0.5 rounded text-muted-foreground font-bold shadow-sm">Alt + A</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-center gap-1">
              <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">ExtraJus v2 • Modo Operacional de Elite</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

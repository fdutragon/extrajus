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
  Brain
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { signOut } from "../(auth)/login/actions";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const profileRef = useRef<any>(null);
  const supabase = createClient();

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
            toast.success(`💥 Arsenal Recarregado! +${added} Créditos adicionados!`, {
              description: `Confirmado via Pix. Seu novo saldo é de ${newProfile.credits} créditos de poder.`,
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

  const navItems = [
    { name: "Painel Principal", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contratos", href: "/contracts", icon: FileText },
    { name: "Assinaturas", href: "/signatures", icon: PenTool },
    { name: "Arsenal", href: "/arsenal", icon: Zap },
    { name: "Cérebro", href: "/brain", icon: Brain },
  ];

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
        isCollapsed ? "-translate-x-full w-0 opacity-0" : "translate-x-0 w-72 opacity-100",
        // Desktop (lg)
        "lg:static lg:translate-x-0 lg:opacity-100 lg:w-72 lg:rounded-l-xl lg:rounded-r-none lg:border border-r-0 lg:inset-auto",
        isCollapsed ? "lg:w-12" : "lg:w-72"
      )}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        {/* Organization Switcher / Logo Area */}
        <div className="h-12 px-3 flex items-center overflow-hidden shrink-0 border-b border-border relative z-10">
          <div className={cn(
            "flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500",
            isCollapsed && "justify-center w-full"
          )}>
            <Logo showText={!isCollapsed} iconSize={22} />
          </div>
        </div>

        <div className="flex-1 px-2.5 py-4 space-y-8 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar-sidebar">
          {/* System Health Widget - Only visible when not collapsed */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn(
              "px-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-700",
              isCollapsed && "hidden lg:hidden"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Status da Nave</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted rounded-lg p-2.5 border border-border">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Synapse</div>
                  <div className="text-[12px] font-mono font-bold text-primary">98.4%</div>
                </div>
                <div className="bg-muted rounded-lg p-2.5 border border-border">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Uptime</div>
                  <div className="text-[12px] font-mono font-bold text-foreground/80">14d</div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className={cn("px-2 mb-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em] animate-in fade-in duration-700", isCollapsed && "lg:hidden")}>Geral</div>
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
                </Link>
              );
            })}
          </nav>

          {/* Recent Projects - New Section */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn("space-y-3 animate-in fade-in duration-1000 delay-300", isCollapsed && "lg:hidden")}>
              <div className="px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Projetos Recentes</div>
              <div className="space-y-1">
                {[
                  { name: "Holding Imperial", color: "bg-primary" },
                  { name: "Projeto Skynet", color: "bg-primary/70" },
                  { name: "M&A Alpha Group", color: "bg-primary/40" }
                ].map((project) => (
                  <button key={project.name} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] text-muted-foreground hover:text-foreground transition-colors group">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform", project.color)} />
                    <span className="truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className={cn("px-2 mb-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em] animate-in fade-in duration-700", isCollapsed && "lg:hidden")}>Sistema</div>
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

          {/* Lilith Pulse - AI Live Activity Feed */}
          {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
            <div className={cn("px-2 pt-4 border-t border-border space-y-3 animate-in fade-in duration-1000", isCollapsed && "lg:hidden")}>
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute inset-0" />
                   <div className="w-2 h-2 rounded-full bg-primary relative" />
                 </div>
                 <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Lilith Pulse</span>
               </div>
               <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                 <p className="text-[10px] text-primary/80 leading-tight italic font-medium font-mono">
                   "Auditoria de risco ativa em todos os contratos."
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
        <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            
            <div className="h-4 w-[1px] bg-border mx-1" />

            <div className="relative max-w-[280px] w-full group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={12} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full bg-muted border border-border rounded-md pl-9 pr-4 py-1 text-[12px] focus:ring-1 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-0 transition-opacity">
                <Command size={9} />
                <span className="text-[9px] font-bold">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-3 w-[1px] bg-border mx-1" />
            <div className="flex items-center gap-2 pl-1 cursor-pointer group">
              <Avatar className="h-6 w-6 rounded-full border border-border ring-0 group-hover:ring-2 ring-primary/20 transition-all">
                <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                <AvatarFallback className="text-[10px]">{profile?.full_name?.slice(0,2).toUpperCase() || "AI"}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-bold leading-tight tracking-tight uppercase italic">{profile?.full_name || 'Arquiteto'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

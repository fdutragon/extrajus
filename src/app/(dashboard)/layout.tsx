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
import { useState, useEffect } from "react";
import { signOut } from "../(auth)/login/actions";
import { BrandSVG } from "@/components/brand-svg";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    <div className="h-screen bg-[#f4f4f5] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 flex overflow-hidden font-sans p-1 md:p-1.5 gap-1 md:gap-1.5 transition-colors duration-500">
      {/* Sidebar Island */}
      <aside className={cn(
        "bg-white dark:bg-[#09090b] border border-zinc-200/50 dark:border-white/5 flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) relative rounded-l-xl rounded-r-none shadow-sm overflow-hidden shrink-0",
        isCollapsed ? "w-12" : "w-72"
      )}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        {/* Organization Switcher / Logo Area */}
        <div className="h-12 px-3 flex items-center gap-2.5 overflow-hidden shrink-0 border-b border-zinc-100 dark:border-white/5 relative z-10">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <BrandSVG className="w-full h-full text-orange-500" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-[13px] font-bold tracking-tight truncate">ExtraJus</span>
            </div>
          )}
        </div>

        <div className="flex-1 px-2.5 py-4 space-y-8 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar-sidebar">
          {/* System Health Widget - Only visible when not collapsed */}
          {!isCollapsed && (
            <div className="px-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.15em]">Status da Nave</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-50 dark:bg-white/5 rounded-lg p-2.5 border border-zinc-100 dark:border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Synapse</div>
                  <div className="text-[12px] font-mono font-bold text-orange-500">98.4%</div>
                </div>
                <div className="bg-zinc-50 dark:bg-white/5 rounded-lg p-2.5 border border-zinc-100 dark:border-white/5">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Uptime</div>
                  <div className="text-[12px] font-mono font-bold text-zinc-700 dark:text-zinc-300">14d</div>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {!isCollapsed && <div className="px-2 mb-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.15em] animate-in fade-in duration-700">Geral</div>}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 py-2 text-[12.5px] font-medium transition-all group rounded-lg overflow-hidden",
                    isCollapsed ? "justify-center px-0" : "px-2.5",
                    isActive
                      ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-zinc-200/50 dark:border-white/5"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon size={15} className={cn(isActive ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0")} />
                  {!isCollapsed && <span className="truncate animate-in fade-in slide-in-from-left-1 duration-300">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Recent Projects - New Section */}
          {!isCollapsed && (
            <div className="space-y-3 animate-in fade-in duration-1000 delay-300">
              <div className="px-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.15em]">Projetos Recentes</div>
              <div className="space-y-1">
                {[
                  { name: "Holding Imperial", color: "bg-orange-500" },
                  { name: "Projeto Skynet", color: "bg-blue-500" },
                  { name: "M&A Alpha Group", color: "bg-purple-500" }
                ].map((project) => (
                  <button key={project.name} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[11.5px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform", project.color)} />
                    <span className="truncate">{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <nav className="space-y-0.5">
            {!isCollapsed && <div className="px-2 mb-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.15em] animate-in fade-in duration-700">Sistema</div>}
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 py-2 text-[12.5px] font-medium transition-all group rounded-lg overflow-hidden",
                    isCollapsed ? "justify-center px-0" : "px-2.5",
                    isActive
                      ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-zinc-200/50 dark:border-white/5"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 border border-transparent"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon size={15} className={cn(isActive ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0")} />
                  {!isCollapsed && <span className="truncate animate-in fade-in slide-in-from-left-1 duration-300">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Lilith Pulse - AI Live Activity Feed */}
          {!isCollapsed && (
            <div className="px-2 pt-4 border-t border-zinc-100 dark:border-white/5 space-y-3 animate-in fade-in duration-1000">
               <div className="flex items-center gap-2">
                 <div className="relative">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping absolute inset-0" />
                   <div className="w-2 h-2 rounded-full bg-orange-500 relative" />
                 </div>
                 <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Lilith Pulse</span>
               </div>
               <div className="bg-orange-500/5 rounded-lg p-2.5 border border-orange-500/10">
                 <p className="text-[10px] text-orange-500/80 leading-tight italic font-medium font-mono">
                   "Auditoria de risco ativa em todos os contratos."
                 </p>
               </div>
            </div>
          )}
        </div>

        {/* User / Footer */}
        <div className="p-2 border-t border-zinc-100 dark:border-white/5 space-y-1 shrink-0 relative z-10">
          <button 
            className={cn(
              "flex items-center gap-2.5 w-full py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group overflow-hidden border border-transparent",
              isCollapsed ? "justify-center px-0" : "px-2.5"
            )}
            onClick={async () => await signOut()}
          >
            <LogOut size={15} className="text-zinc-500 group-hover:text-red-500 transition-colors shrink-0" />
            {!isCollapsed && <span className="text-[12.5px] font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 truncate animate-in fade-in slide-in-from-left-1 duration-300">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Island */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#08080a] border border-zinc-200/50 dark:border-white/5 rounded-r-xl rounded-l-none shadow-sm overflow-hidden relative transition-all duration-500">
        {/* Top Navigation Bar Integrated into Content Island */}
        <header className="h-12 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-[#08080a]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-md text-zinc-400 transition-colors"
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10 mx-1" />

            <div className="relative max-w-[280px] w-full group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={12} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full bg-zinc-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md pl-9 pr-4 py-1 text-[12px] focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-focus-within:opacity-0 transition-opacity">
                <Command size={9} />
                <span className="text-[9px] font-bold">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-3 w-[1px] bg-zinc-200 dark:bg-white/10 mx-1" />
            <div className="flex items-center gap-2 pl-1 cursor-pointer group">
              <Avatar className="h-6 w-6 rounded-full border border-zinc-100 dark:border-white/10 ring-0 group-hover:ring-2 ring-orange-500/20 transition-all">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="text-[10px]">CI</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-bold leading-tight tracking-tight">Cadelo</span>
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

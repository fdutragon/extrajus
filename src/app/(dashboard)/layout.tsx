"use client"

import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Search,
  ChevronRight,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  PenTool,
  Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contratos", href: "/contracts", icon: FileText },
    { name: "Assinaturas", href: "/signatures", icon: PenTool },
    { name: "Arsenal", href: "/arsenal", icon: Zap },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 flex transition-colors duration-500">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hidden md:flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold shrink-0">E</div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tighter uppercase italic whitespace-nowrap">ExtraJus</span>}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 py-3 text-sm font-medium transition-all group rounded-none",
                  isCollapsed ? "justify-center px-0" : "px-4",
                  pathname === item.href
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
                title={isCollapsed ? item.name : ""}
              >
                <Icon size={18} className={cn(pathname === item.href ? "text-orange-500" : "group-hover:text-orange-500 transition-colors")} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button variant="ghost" className={cn("w-full gap-3 text-zinc-500 hover:text-red-500 rounded-none", isCollapsed ? "justify-center px-0" : "justify-start px-4")} render={<Link href="/" />} nativeButton={false}>
            <LogOut size={18} />
            {!isCollapsed && <span className="whitespace-nowrap">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-none border border-zinc-200 dark:border-zinc-800 hidden md:flex"
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={18} />
            </Button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar no arsenal..." 
                className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-none pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="icon" className="rounded-none border-zinc-200 dark:border-zinc-800">
              <Bell size={18} className="text-zinc-500" />
            </Button>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold uppercase tracking-tighter">Cadelo Imperial</div>
                <div className="text-[10px] text-zinc-500 font-mono">ADMIN // Lvl 99</div>
              </div>
              <Avatar className="h-10 w-10 rounded-none border border-zinc-200 dark:border-zinc-800">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CI</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

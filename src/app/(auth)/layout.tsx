import { Shield } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-600/5 dark:bg-orange-600/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        <Link href="/" className="flex items-center gap-1.5 relative z-10 group">
          <span className="text-xl font-bold tracking-tight text-orange-500 uppercase italic drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">ExtraJus</span>
        </Link>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-3xl font-medium tracking-tight leading-snug dark:text-zinc-200 text-zinc-800 italic">
              "A melhor forma de prever o futuro é redigir o contrato que o dita."
            </p>
            <footer className="text-sm font-mono text-orange-600 dark:text-orange-500 uppercase tracking-widest">
              — Lilith OS // Protocolo de Dominação
            </footer>
          </blockquote>
        </div>

        <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600 relative z-10">
          © 2026 IMPÉRIO DO CADELO // ALL RIGHTS RESERVED
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background transition-colors duration-500">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/20 dark:bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />

        <Link href="/" className="flex items-center relative z-10 group">
          <Logo iconSize={48} showText={true} variant="quartz" />
        </Link>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-3xl font-medium tracking-tight leading-snug text-foreground italic opacity-90">
              &quot;A melhor forma de prever o futuro é redigir o contrato que o dita.&quot;
            </p>
            <footer className="text-sm font-mono text-primary dark:text-primary uppercase tracking-widest">
              — ExtraJus Engine // Inteligência Jurídica
            </footer>
          </blockquote>
        </div>

        <div className="text-xs font-mono text-muted-foreground dark:text-muted-foreground relative z-10">
          © 2026 EXTRAJUS — TODOS OS DIREITOS RESERVADOS
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ArrowRight, Globe, AlertTriangle } from "lucide-react";
import { login } from "./actions";

import { BrandSVG } from "@/components/brand-svg";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="pt-8">

      <form className="space-y-4" action={login}>
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-500">Erro de Autenticação</h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">E-mail Corporativo</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="seu@email.com" 
            type="email" 
            required
            className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card transition-all text-base"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Senha de Acesso</Label>
            <Link 
              href="/forgot-password" 
              className="text-[10px] text-primary dark:text-primary hover:underline font-black normal-case"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required
            className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card transition-all text-base"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" className="border-muted-foreground dark:border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
          >
            Manter sessão ativa
          </label>
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black h-12 rounded-2xl group transition-all shadow-xl shadow-primary/10">
          ENTRAR NA PLATAFORMA <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>



      <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground pt-6">
        Novo por aqui?{" "}
        <Link href="/register" className="text-primary dark:text-primary font-black hover:underline">
          Criar conta agora
        </Link>
      </p>
    </div>
  );
}

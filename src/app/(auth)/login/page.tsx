import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
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
          <div className="p-3 text-sm text-destructive-foreground bg-destructive font-bold border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">E-mail de Guerra</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="cadelo@imperio.com" 
            type="email" 
            required
            className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Senha Criptografada</Label>
            <Link 
              href="/forgot-password" 
              className="text-[10px] text-primary dark:text-primary hover:underline font-black uppercase"
            >
              Esqueceu a chave?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required
            className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base"
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
          ACESSAR COMANDO <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border opacity-50" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-background px-6 text-muted-foreground">Ou use sua identidade digital</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-2xl font-black border-border hover:bg-muted transition-all shadow-sm">
        <Globe className="mr-2 h-4 w-4" /> GITHUB
      </Button>

      <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground pt-6">
        Novo por aqui?{" "}
        <Link href="/register" className="text-primary dark:text-primary font-black hover:underline">
          Recrute-se agora
        </Link>
      </p>
    </div>
  );
}

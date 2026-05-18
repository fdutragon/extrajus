import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signup } from "./actions";

import { BrandSVG } from "@/components/brand-svg";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="pt-8">

      <form className="space-y-4" action={signup}>
        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive font-bold border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Primeiro Nome</Label>
            <Input id="firstName" name="firstName" required placeholder="Felipe" className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Sobrenome</Label>
            <Input id="lastName" name="lastName" required placeholder="Silva" className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">E-mail Corporativo</Label>
          <Input id="email" name="email" required placeholder="seu@email.com" type="email" className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Senha de Acesso</Label>
          <Input id="password" name="password" required type="password" placeholder="••••••••" className="h-12 px-4 rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all text-base" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" name="terms" required className="border-muted-foreground dark:border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
          <label
            htmlFor="terms"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
          >
            Aceito os <Link href="#" className="text-primary hover:underline">Termos de Uso</Link> e Política de Privacidade.
          </label>
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black h-12 rounded-2xl transition-all shadow-xl shadow-primary/10">
          CRIAR MINHA CONTA <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground pt-6">
        Já possui acesso?{" "}
        <Link href="/login" className="text-primary dark:text-primary font-black hover:underline">
          Acessar Plataforma
        </Link>
      </p>
    </div>
  );
}

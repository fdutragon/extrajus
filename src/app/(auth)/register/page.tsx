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
          <div className="p-3 text-sm text-white bg-red-600 font-bold border border-red-800">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Primeiro Nome</Label>
            <Input id="firstName" name="firstName" required placeholder="Cadelo" className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Sobrenome</Label>
            <Input id="lastName" name="lastName" required placeholder="Imperial" className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">E-mail de Guerra</Label>
          <Input id="email" name="email" required placeholder="cadelo@imperio.com" type="email" className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Criar Senha Forte</Label>
          <Input id="password" name="password" required type="password" className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" name="terms" required className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
          <label
            htmlFor="terms"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-500"
          >
            Aceito os <Link href="#" className="text-orange-500 hover:underline">termos de dominação</Link> e privacidade.
          </label>
        </div>
        <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-black h-12 rounded-2xl transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
          FORJAR MINHA CONTA <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-6">
        Já possui acesso?{" "}
        <Link href="/login" className="text-orange-600 dark:text-orange-500 font-black hover:underline">
          Acesse o arsenal
        </Link>
      </p>
    </div>
  );
}

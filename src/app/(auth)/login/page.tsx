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
          <div className="p-3 text-sm text-white bg-red-600 font-bold border border-red-800">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">E-mail de Guerra</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="cadelo@imperio.com" 
            type="email" 
            required
            className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Senha Criptografada</Label>
            <Link 
              href="/forgot-password" 
              className="text-[10px] text-orange-600 dark:text-orange-500 hover:underline font-black uppercase"
            >
              Esqueceu a chave?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required
            className="h-12 px-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all text-base"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-500"
          >
            Manter sessão ativa
          </label>
        </div>
        <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-black h-12 rounded-2xl group transition-all shadow-xl shadow-black/10 dark:shadow-white/5">
          ACESSAR COMANDO <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800 opacity-50" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-white dark:bg-[#050505] px-6 text-zinc-400">Ou use sua identidade digital</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-2xl font-black border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-sm">
        <Globe className="mr-2 h-4 w-4" /> GITHUB
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-6">
        Novo por aqui?{" "}
        <Link href="/register" className="text-orange-600 dark:text-orange-500 font-black hover:underline">
          Recrute-se agora
        </Link>
      </p>
    </div>
  );
}

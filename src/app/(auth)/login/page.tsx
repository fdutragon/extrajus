import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter dark:text-white text-zinc-900">BEM-VINDO AO ARSENAL</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Insira suas credenciais para acessar o comando central.</p>
      </div>

      <form className="space-y-4" action={login}>
        {error && (
          <div className="p-3 text-sm text-white bg-red-600 font-bold border border-red-800">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Guerra</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="cadelo@imperio.com" 
            type="email" 
            required
            className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha Criptografada</Label>
            <Link 
              href="/forgot-password" 
              className="text-xs text-orange-600 dark:text-orange-500 hover:underline font-bold"
            >
              Esqueceu a chave?
            </Link>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required
            className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all"
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
        <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black h-12 rounded-none group transition-all">
          ACESSAR COMANDO <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#050505] px-2 text-zinc-500">Ou use sua identidade digital</span>
        </div>
      </div>

      <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
        <Globe className="mr-2 h-4 w-4" /> GITHUB
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Novo por aqui?{" "}
        <Link href="/register" className="text-orange-600 dark:text-orange-500 font-black hover:underline">
          Recrute-se agora
        </Link>
      </p>
    </div>
  );
}

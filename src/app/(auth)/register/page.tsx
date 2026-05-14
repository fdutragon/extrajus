import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signup } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter dark:text-white text-zinc-900">RECRUTAMENTO</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Junte-se à elite da redação jurídica de guerra.</p>
      </div>

      <form className="space-y-4" action={signup}>
        {error && (
          <div className="p-3 text-sm text-white bg-red-600 font-bold border border-red-800">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Primeiro Nome</Label>
            <Input id="firstName" name="firstName" required placeholder="Cadelo" className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input id="lastName" name="lastName" required placeholder="Imperial" className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Guerra</Label>
          <Input id="email" name="email" required placeholder="cadelo@imperio.com" type="email" className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Criar Senha Forte</Label>
          <Input id="password" name="password" required type="password" className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all" />
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
        <Button type="submit" className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black h-12 rounded-none transition-all">
          FORJAR MINHA CONTA <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já possui acesso?{" "}
        <Link href="/login" className="text-orange-600 dark:text-orange-500 font-black hover:underline">
          Acesse o arsenal
        </Link>
      </p>
    </div>
  );
}

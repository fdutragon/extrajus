"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter dark:text-white text-zinc-900">RECUPERAR CHAVE</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Enviaremos um link de descriptografia para o seu e-mail.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de Guerra</Label>
          <Input 
            id="email" 
            placeholder="cadelo@imperio.com" 
            type="email" 
            className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-orange-500 transition-all"
          />
        </div>
        <Button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black h-12 rounded-none group transition-all">
          ENVIAR LINK <Send className="ml-2 h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/login" className="flex items-center justify-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors font-bold">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Login
        </Link>
      </p>
    </div>
  );
}

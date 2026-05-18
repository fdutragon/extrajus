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
        <h1 className="text-3xl font-black tracking-tighter dark:text-white text-muted uppercase">Recuperar Senha</h1>
        <p className="text-muted-foreground dark:text-muted-foreground">Enviaremos um link de recuperação para o seu e-mail corporativo.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">E-mail Corporativo</Label>
          <Input 
            id="email" 
            placeholder="seu@email.com" 
            type="email" 
            className="rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all h-12 px-4"
          />
        </div>
        <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black h-12 rounded-2xl group transition-all shadow-xl shadow-primary/10">
          ENVIAR LINK <Send className="ml-2 h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground">
        <Link href="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Login
        </Link>
      </p>
    </div>
  );
}

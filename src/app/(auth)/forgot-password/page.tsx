"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const supabase = createClient();

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    setIsSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error("[ForgotPassword] Error resetting password:", err);
      setErrorMsg(err.message || "Não foi possível enviar o link de recuperação. Verifique o e-mail informado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-black tracking-tighter text-foreground">
          Recuperar senha
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enviaremos um link seguro para o seu e-mail para você redefinir seu acesso.
        </p>
      </div>

      <form onSubmit={handleRecoverPassword} className="space-y-5 text-left">
        {/* Premium Success Alert */}
        {isSuccess && (
          <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">Link enviado com sucesso!</h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Verifique a sua caixa de entrada e a pasta de spam. Clique no link recebido para ser redirecionado para a tela de alteração de senha.
              </p>
            </div>
          </div>
        )}

        {/* Premium Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-500">Falha na solicitação</h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
            E-mail
          </Label>
          <Input 
            id="email" 
            placeholder="seu@email.com" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-2xl border-border bg-background dark:bg-card focus:border-primary transition-all h-12 px-4 text-base"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-black h-12 rounded-2xl group transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              ENVIANDO... <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              ENVIAR LINK <Send className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-[11px] uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Login
        </Link>
      </p>
    </div>
  );
}

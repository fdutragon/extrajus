"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Sparkles, 
  CreditCard, 
  Cpu, 
  Zap, 
  Check,
  ChevronRight,
  FileText,
  Command,
  ShieldCheck,
  Shield,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [aiRigor, setAiRigor] = useState<number>(8);
  const [aiMode, setAiMode] = useState<string>("Inovador");
  const [aiRealtime, setAiRealtime] = useState<boolean>(true);
  const [isMaster, setIsMaster] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      setOccupation(user.user_metadata?.occupation || "");
      setAiRigor(user.user_metadata?.ai_rigor ?? 8);
      setAiMode(user.user_metadata?.ai_mode ?? "Inovador");
      setAiRealtime(user.user_metadata?.ai_realtime ?? true);

      if (user.email === "felipedutra@outlook.com") {
        setIsMaster(true);
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        if (data.occupation) {
          setOccupation(data.occupation);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleBuyCredits = (pkg: any) => {
    const event = new CustomEvent("open-plans-modal", {
      detail: { pkg }
    });
    window.dispatchEvent(event);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          occupation: occupation,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: metaError } = await supabase.auth.updateUser({
        data: { occupation: occupation }
      });
      if (metaError) throw metaError;

      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName,
        occupation: occupation
      }));

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("Confirme o novo email na sua caixa de entrada.");
      }

      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
        setPassword("");
        toast.success("Senha atualizada.");
      }

      toast.success("Configurações salvas com sucesso.");
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      toast.error(error.message || "Falha ao salvar configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAi = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ai_rigor: aiRigor,
          ai_mode: aiMode,
          ai_realtime: aiRealtime
        }
      });
      if (error) throw error;
      toast.success("Configurações de IA salvas com sucesso.");
    } catch (error: any) {
      toast.error(error.message || "Falha ao salvar configurações de IA.");
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { id: "perfil", name: "Perfil de Usuário", icon: User },
    ...(isMaster ? [{ id: "ai", name: "Configuração de IA", icon: Sparkles }] : []),
    { id: "faturamento", name: "Faturamento & Créditos", icon: CreditCard },
  ];

  if (loading) return <div className="p-20 text-center text-muted-foreground font-black text-xs animate-pulse">Carregando Configurações...</div>

  return (
    <div className="space-y-12 animate-in fade-in duration-700 overflow-x-hidden px-1">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border/50 pb-8 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[9px] uppercase tracking-[0.3em] font-black border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full animate-pulse">System Config</Badge>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase italic">Account Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Settings <span className="text-muted-foreground/30 font-light">/</span> <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Gerencie as preferências da sua conta, parâmetros de inteligência artificial e faturamento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        <div className="lg:col-span-3 space-y-2 sticky top-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                )}
              >
                <Icon size={13} className={cn(isActive ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary transition-colors")} />
                {item.name}
                {isActive && <ChevronRight size={11} className="ml-auto opacity-40" />}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-9 space-y-6 text-left">
          {activeTab === "perfil" && (
            <div className="animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[24px] overflow-hidden text-left shadow-[0_0_40px_rgba(0,0,0,0.08)]">
                <div className="h-20 w-full bg-gradient-to-r from-primary/10 via-card to-background pt-3 pr-4 flex justify-end items-start relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[10px] uppercase tracking-widest">Sessão Ativa</Badge>
                </div>
                <div className="px-6 pb-6 -mt-10 relative z-10 text-left">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
                    <div className="flex items-end gap-4 text-left">
                      <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                        <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="bg-muted text-muted-foreground font-black text-xl">{fullName?.slice(0,2).toUpperCase() || "US"}</AvatarFallback>
                      </Avatar>
                      <div className="mb-1 text-left">
                        <h2 className="text-xl font-black tracking-tight text-foreground">{fullName || 'Usuário'}</h2>
                        <p className="text-xs text-muted-foreground font-medium italic">Perfil Profissional ExtraJus</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/50 pb-1.5 text-left">Identidade</h3>
                      <div className="space-y-3 text-left">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 text-left">
                            <FileText size={9} /> Nome Completo
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-xs transition-all outline-none focus:border-primary/30 text-left"
                            placeholder="Seu nome..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 text-left">
                            <Briefcase size={9} /> Ocupação
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-xs transition-all outline-none focus:border-primary/30 text-left"
                            placeholder="Ex: Advogado(a), Diretor(a) Jurídico(a), etc."
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/50 pb-1.5 text-left">Segurança</h3>
                      <div className="space-y-3 text-left">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 text-left">
                            <FileText size={9} /> E-mail Principal
                          </label>
                          <input 
                            type="email" 
                            className="w-full bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-xs opacity-50 cursor-not-allowed text-left"
                            value={profile?.email || ''}
                            disabled
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 text-left">
                            <Zap size={9} /> Nova Senha
                          </label>
                          <input 
                            type="password" 
                            className="w-full bg-muted/30 border border-border/60 rounded-lg px-3 py-2 text-xs transition-all outline-none focus:border-primary/30 text-left"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <p className="text-[10px] text-muted-foreground/60 italic text-left">Deixe em branco para manter a senha atual.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
                    <div className="flex items-center gap-3 text-muted-foreground text-left">
                       <Shield size={14} className="opacity-20 shrink-0" />
                       <p className="text-[10px] font-medium leading-relaxed max-w-xs text-left">Alterações sensíveis podem exigir revalidação via e-mail para garantir a segurança da conta.</p>
                    </div>
                    <Button 
                      disabled={isSaving}
                      onClick={handleSave}
                      className="bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-8 h-10 text-[10px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none shrink-0"
                    >
                      {isSaving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "ai" && isMaster && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="rounded-[20px] p-5 relative overflow-hidden text-left border border-border/50 bg-card/40 backdrop-blur-md">
                 <div className="relative z-10 space-y-5 text-left">
                   <div className="flex items-center gap-3 text-left">
                     <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <Cpu size={16} className="text-primary" />
                     </div>
                     <div className="text-left">
                       <h3 className="text-base font-bold text-foreground tracking-tight">Configuração de IA</h3>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ajuste os parâmetros da inteligência analítica</p>
                     </div>
                   </div>

                   <div className="space-y-5 text-left">
                     <div className="space-y-3 text-left">
                        <div className="flex justify-between items-end text-left">
                          <div className="text-left">
                            <span className="text-xs font-bold text-foreground">Rigor de Análise</span>
                            <p className="text-[10px] text-muted-foreground">Define o nível de profundidade das auditorias contratuais.</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-primary text-left">NÍVEL {aiRigor.toString().padStart(2, '0')}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={aiRigor} 
                          onChange={(e) => setAiRigor(Number(e.target.value))}
                          className="w-full accent-primary bg-muted rounded-lg h-1.5 cursor-pointer appearance-none border border-border/50"
                        />
                     </div>

                     <div className="space-y-3 text-left">
                        <div className="flex justify-between items-center text-left">
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-bold text-foreground">Modo de Sugestão</span>
                            <p className="text-[10px] text-muted-foreground">Define o estilo de redação e argumentação da IA.</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[9px]">
                            {aiMode === "Conservador" ? "Alto Rigor" : aiMode === "Inovador" ? "Alta Agilidade" : "Equilibrado"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-left">
                          {["Conservador", "Equilibrado", "Inovador"].map((mode) => (
                            <button 
                              key={mode}
                              onClick={() => setAiMode(mode)}
                              className={cn(
                                "py-2 px-3 rounded-lg text-[10px] font-bold border transition-all active:scale-95",
                                mode === aiMode 
                                  ? "bg-primary/10 border-primary/30 text-primary" 
                                  : "bg-muted/40 border-border/50 text-muted-foreground hover:border-primary/20"
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="h-px bg-border/40" />

                     <div className="flex items-center justify-between text-left">
                        <div className="text-left">
                           <span className="text-xs font-bold text-foreground">Análise de Risco em Tempo Real</span>
                           <p className="text-[10px] text-muted-foreground text-left">Ativa o monitoramento constante de cláusulas sensíveis durante a edição.</p>
                        </div>
                        <button 
                          onClick={() => setAiRealtime(!aiRealtime)}
                          className={cn(
                            "w-10 h-5 rounded-full relative border transition-all duration-300 shrink-0 ml-4",
                            aiRealtime 
                              ? "bg-primary/20 border-primary/30" 
                              : "bg-muted border-border"
                          )}
                        >
                           <div className={cn(
                             "absolute top-0.5 w-3.5 h-3.5 bg-primary rounded-full transition-all duration-300",
                             aiRealtime ? "right-0.5" : "left-0.5"
                           )} />
                        </button>
                     </div>
                     
                     <div className="pt-4 border-t border-border/40 flex justify-end text-left">
                       <Button 
                         disabled={isSaving}
                         onClick={handleSaveAi}
                         className="bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-6 h-9 text-[10px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                       >
                         {isSaving ? "Salvando..." : "Salvar IA"}
                       </Button>
                     </div>
                    </div>
                  </div>
               </Card>
             </div>
           )}

           {activeTab === "faturamento" && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="rounded-[20px] p-5 relative overflow-hidden text-left border border-border/50 bg-card/40 backdrop-blur-md">
                <div className="relative z-10 space-y-5 text-left">
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                         <CreditCard size={16} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-bold text-foreground tracking-tight">Faturamento &amp; Créditos</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-left">Gerencie seu saldo de processamento IA</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Saldo Atual</span>
                       <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-2xl font-black text-primary">{profile?.credits || 0}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">CRÉDITOS</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                    {[
                      { credits: 150, price: 19.90, label: "Pacote Operacional", desc: "Ideal para testes, com volume seguro de Sinapses.", popular: false, text: "text-foreground" },
                      { credits: 500, price: 49.90, label: "Arsenal Avançado", desc: "O preferido. Bônus de Sinapses e alta performance.", popular: true, text: "text-primary" },
                      { credits: 1200, price: 99.90, label: "Arsenal Supremo", desc: "Poder irrestrito. Alto bônus de Sinapses para escalar.", popular: false, text: "text-primary/90" },
                    ].map((pkg) => (
                      <div 
                        key={pkg.credits}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col bg-card text-card-foreground text-left",
                          pkg.popular
                            ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.05)] hover:border-primary scale-[1.02]"
                            : "border-border/60 hover:border-primary/30 hover:scale-[1.01]"
                        )}
                        onClick={() => handleBuyCredits(pkg)}
                      >
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[7px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 font-sans">
                            <Sparkles size={7} /> Popular
                          </div>
                        )}
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1.5">{pkg.label}</span>
                        <div className="flex items-baseline gap-1 mb-1.5">
                           <span className={cn("text-xl font-black font-mono tracking-tight", pkg.text)}>{pkg.credits}</span>
                           <span className="text-[10px] font-bold text-muted-foreground">Sinapses</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-4 flex-1">
                          {pkg.desc}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                           <div className="flex flex-col">
                             <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Investimento</span>
                             <span className="text-xs font-black text-foreground font-mono">R$ {pkg.price.toFixed(2).replace('.', ',')}</span>
                           </div>
                           <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg border border-border/60 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">Adquirir</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

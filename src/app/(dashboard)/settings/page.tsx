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
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{ pixCode: string, pixQrCode: string } | null>(null);
  const [aiRigor, setAiRigor] = useState<number>(8);
  const [aiMode, setAiMode] = useState<string>("Inovador");
  const [aiRealtime, setAiRealtime] = useState<boolean>(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      setUsername(user.user_metadata?.username || "");
      setAiRigor(user.user_metadata?.ai_rigor ?? 8);
      setAiMode(user.user_metadata?.ai_mode ?? "Inovador");
      setAiRealtime(user.user_metadata?.ai_realtime ?? true);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleBuyCredits = async (amountCents: number) => {
    setIsGeneratingPix(true);
    setPixData(null);
    try {
      const response = await fetch("/api/billing/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, description: "Compra de Créditos ExtraJus" })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPixData(data);
      toast.success("Pix gerado. Aguardando confirmação do pagamento.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar Pix.");
    } finally {
      setIsGeneratingPix(false);
    }
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
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: metaError } = await supabase.auth.updateUser({
        data: { username: username }
      });
      if (metaError) throw metaError;

      setProfile((prev: any) => ({
        ...prev,
        full_name: fullName,
        username: username
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
    { id: "ai", name: "Configuração de IA", icon: Sparkles },
    { id: "faturamento", name: "Faturamento & Créditos", icon: CreditCard },
  ];

  if (loading) return <div className="p-20 text-center text-muted-foreground font-black text-xs animate-pulse">Carregando Configurações...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Preferências</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">System Configuration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Gerencie as preferências da sua conta, parâmetros de inteligência artificial e faturamento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-2 sticky top-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={16} className={cn(isActive ? "text-primary-foreground" : "group-hover:text-primary transition-colors")} />
                {item.name}
                {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-9 space-y-6 text-left">
          {activeTab === "perfil" && (
            <div className="animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="rounded-xl overflow-hidden text-left">
                <div className="h-32 w-full bg-gradient-to-r from-primary/10 via-card to-background pt-4 pr-4 flex justify-end items-start relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[9px] uppercase tracking-widest">Sessão Ativa</Badge>
                </div>
                <div className="px-8 pb-8 -mt-12 relative z-10 text-left">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
                    <div className="flex items-end gap-6 text-left">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="bg-muted text-muted-foreground font-black text-2xl">{fullName?.slice(0,2).toUpperCase() || "US"}</AvatarFallback>
                      </Avatar>
                      <div className="mb-2 text-left">
                        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">{fullName || 'Usuário'}</h2>
                        <p className="text-sm text-muted-foreground font-medium italic">Perfil Profissional ExtraJus</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="space-y-6 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 text-left">Identidade</h3>
                      <div className="space-y-4 text-left">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-left">
                            <FileText size={10} /> Nome Completo
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-left"
                            placeholder="Seu nome..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-left">
                            <Command size={10} /> Nome de Usuário
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-left"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 text-left">Segurança</h3>
                      <div className="space-y-4 text-left">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-left">
                            <FileText size={10} /> E-mail Principal
                          </label>
                          <input 
                            type="email" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm opacity-50 cursor-not-allowed text-left"
                            value={profile?.email || ''}
                            disabled
                          />
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-left">
                            <Zap size={10} /> Nova Senha
                          </label>
                          <input 
                            type="password" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-left"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <p className="text-[9px] text-muted-foreground italic text-left">Deixe em branco para manter a senha atual.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-left">
                    <div className="flex items-center gap-4 text-muted-foreground text-left">
                       <Shield size={20} className="opacity-20" />
                       <p className="text-[10px] font-medium leading-relaxed max-w-xs text-left">Alterações sensíveis podem exigir revalidação via e-mail para garantir a segurança da conta.</p>
                    </div>
                    <Button 
                      disabled={isSaving}
                      onClick={handleSave}
                      className="bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-10 h-14 text-xs transition-all active:scale-95"
                    >
                      {isSaving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="rounded-xl p-8 relative overflow-hidden text-left">
                 <div className="relative z-10 space-y-8 text-left">
                   <div className="flex items-center gap-4 text-left">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Cpu size={24} className="text-primary" />
                     </div>
                     <div className="text-left">
                       <h3 className="text-xl font-bold text-foreground tracking-tight">Configuração de IA</h3>
                       <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ajuste os parâmetros da inteligência analítica</p>
                     </div>
                   </div>

                   <div className="space-y-8 text-left">
                     <div className="space-y-4 text-left">
                        <div className="flex justify-between items-end text-left">
                          <div className="text-left">
                            <span className="text-sm font-bold text-foreground">Rigor de Análise</span>
                            <p className="text-xs text-muted-foreground">Define o nível de profundidade das auditorias contratuais.</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary text-left">NÍVEL {aiRigor.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-left">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={aiRigor} 
                            onChange={(e) => setAiRigor(Number(e.target.value))}
                            className="w-full accent-primary bg-muted rounded-lg h-2 cursor-pointer appearance-none border border-border"
                          />
                        </div>
                     </div>

                     <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center text-left">
                          <div className="space-y-0.5 text-left">
                            <span className="text-sm font-bold text-foreground">Modo de Sugestão</span>
                            <p className="text-xs text-muted-foreground">Define o estilo de redação e argumentação da IA.</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                            {aiMode === "Conservador" ? "Alto Rigor" : aiMode === "Inovador" ? "Alta Agilidade" : "Equilibrado"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-left">
                          {["Conservador", "Equilibrado", "Inovador"].map((mode) => (
                            <button 
                              key={mode}
                              onClick={() => setAiMode(mode)}
                              className={cn(
                                "py-3 px-4 rounded-xl text-xs font-bold border transition-all active:scale-95",
                                mode === aiMode 
                                  ? "bg-primary/10 border-primary/30 text-primary" 
                                  : "bg-muted border-border text-muted-foreground hover:border-primary/20"
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="h-[1px] bg-border" />

                     <div className="flex items-center justify-between text-left">
                        <div className="text-left">
                           <span className="text-sm font-bold text-foreground">Análise de Risco em Tempo Real</span>
                           <p className="text-xs text-muted-foreground text-left">Ativa o monitoramento constante de cláusulas sensíveis durante a edição.</p>
                        </div>
                        <button 
                          onClick={() => setAiRealtime(!aiRealtime)}
                          className={cn(
                            "w-12 h-6 rounded-full relative border transition-all duration-300",
                            aiRealtime 
                              ? "bg-primary/20 border-primary/30" 
                              : "bg-muted border-border"
                          )}
                        >
                           <div className={cn(
                             "absolute top-1 w-4 h-4 bg-primary rounded-full transition-all duration-300",
                             aiRealtime ? "right-1" : "left-1"
                           )} />
                        </button>
                     </div>
                     
                     <div className="mt-8 pt-6 border-t flex justify-end text-left">
                       <Button 
                         disabled={isSaving}
                         onClick={handleSaveAi}
                         className="bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-10 h-14 text-xs transition-all active:scale-95"
                       >
                         {isSaving ? "Salvando..." : "Salvar Configurações de IA"}
                       </Button>
                     </div>
                   </div>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "faturamento" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 text-left">
              <Card className="rounded-xl p-8 relative overflow-hidden text-left">
                <div className="relative z-10 space-y-8 text-left">
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                         <CreditCard size={24} className="text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Faturamento & Créditos</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold text-left">Gerencie seu saldo de processamento IA</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Saldo Atual</span>
                       <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-3xl font-black text-primary">{profile?.credits || 0}</span>
                          <span className="text-xs font-bold text-muted-foreground">CRÉDITOS</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    {[
                      { credits: 100, price: 10, label: "Básico", color: "text-blue-500" },
                      { credits: 550, price: 50, label: "Profissional", color: "text-primary", popular: true },
                      { credits: 1200, price: 100, label: "Corporativo", color: "text-amber-500" },
                    ].map((pkg) => (
                      <div 
                        key={pkg.credits}
                        className={cn(
                          "p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full text-left",
                          pkg.popular ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border hover:border-primary/20"
                        )}
                        onClick={() => handleBuyCredits(pkg.price * 100)}
                      >
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Destaque</div>
                        )}
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2 text-left">{pkg.label}</span>
                        <div className="flex items-baseline gap-1 mb-4 text-left">
                           <span className={cn("text-2xl font-black", pkg.color)}>{pkg.credits}</span>
                           <span className="text-[10px] font-bold text-muted-foreground">créditos</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 text-left">
                           <span className="text-sm font-bold text-foreground">R$ {pkg.price}</span>
                           <Button size="sm" variant="ghost" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-primary-foreground">Adquirir</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isGeneratingPix && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl animate-pulse">
                       <Zap size={32} className="mx-auto text-primary mb-4" />
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gerando QR Code de Pagamento...</p>
                    </div>
                  )}

                  {pixData && (
                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl animate-in zoom-in-95 duration-500 text-left">
                       <div className="flex flex-col md:flex-row gap-8 items-center text-left">
                          <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                             <QRCodeSVG 
                               value={pixData.pixQrCode}
                               size={180}
                               level="L"
                               includeMargin={false}
                             />
                          </div>
                          <div className="flex-1 space-y-4 text-left">
                             <div className="space-y-1 text-left">
                                <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 text-left">
                                   <ShieldCheck size={16} /> Pagamento Seguro via Pix
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed text-left">
                                   Aponte a câmera do seu banco para o QR Code ou utilize o código copia e cola. Os créditos serão liberados imediatamente após a confirmação.
                                </p>
                             </div>
                             <div className="space-y-2 text-left">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-left">Código Copia e Cola</span>
                                <div className="flex gap-2 text-left">
                                   <input 
                                     readOnly 
                                     value={pixData.pixCode} 
                                     className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-[10px] font-mono truncate text-left"
                                   />
                                   <Button 
                                     size="sm" 
                                     className="rounded-xl font-black text-[9px] uppercase tracking-widest"
                                     onClick={() => {
                                        navigator.clipboard.writeText(pixData.pixCode);
                                        toast.success("Código copiado com sucesso!");
                                     }}
                                   >Copiar</Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

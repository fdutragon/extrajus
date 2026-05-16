"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Shield, 
  Sparkles, 
  Bell, 
  CreditCard, 
  Cpu, 
  Zap, 
  Lock, 
  Fingerprint,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Database,
  FileText,
  Command,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setUsername(data.username || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update Profile Table (using upsert to ensure row exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 2. Update Auth Email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info("Confirme o novo email na sua caixa de entrada.");
      }

      // 3. Update Password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
        setPassword("");
        toast.success("Senha atualizada.");
      }

      toast.success("Protocolos sincronizados com sucesso.");
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      toast.error(error.message || "Falha na sincronização.");
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { id: "perfil", name: "Perfil do Arquiteto", icon: User },
    { id: "lilith", name: "Calibração da Lilith", icon: Sparkles },
    { id: "seguranca", name: "Protocolos de Segurança", icon: Shield },
    { id: "visual", name: "Interface & Estética", icon: Monitor },
    { id: "faturamento", name: "Faturamento & Créditos", icon: CreditCard },
  ];

  if (loading) return <div className="p-20 text-center text-muted-foreground uppercase font-black text-xs animate-pulse">Sincronizando Sistemas...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Geral</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Spacecraft Configuration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic uppercase">Configurações do Sistema</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Calibre os parâmetros da sua infraestrutura. Ajuste a agressividade da Lilith, gerencie chaves de acesso e protocolos de segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
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
                    ? "bg-primary text-primary-foreground shadow-md" 
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

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "perfil" && (
            <div className="animate-in slide-in-from-bottom-2 duration-500">
              <Card className="rounded-xl overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-r from-primary/20 via-card to-background pt-4 pr-4 flex justify-end items-start relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                  <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-[9px] uppercase tracking-widest">Protocolo Ativo</Badge>
                </div>
                <div className="px-8 pb-8 -mt-12 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-end gap-6">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                        <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="bg-muted text-muted-foreground font-black text-2xl">{fullName?.slice(0,2).toUpperCase() || "AI"}</AvatarFallback>
                      </Avatar>
                      <div className="mb-2">
                        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic">{fullName || 'Arquiteto'}</h2>
                        <p className="text-sm text-muted-foreground font-medium italic">Fundador & Arquiteto Chefe da Infraestrutura ExtraJus</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">Identidade Central</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText size={10} /> Nome Completo
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                            placeholder="Seu nome de guerra..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Command size={10} /> Chave de Acesso (Username)
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>

                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">Canais de Acesso</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText size={10} /> Email de Comunicação
                          </label>
                          <input 
                            type="email" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm opacity-50 cursor-not-allowed"
                            value={profile?.email || ''}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Zap size={10} /> Código de Segurança (Nova Senha)
                          </label>
                          <input 
                            type="password" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <p className="text-[9px] text-muted-foreground italic">Deixe em branco para manter a chave atual.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-muted-foreground">
                       <Shield size={20} className="opacity-20" />
                       <p className="text-[10px] font-medium leading-relaxed max-w-xs">Alterações nos Canais de Acesso exigirão revalidação via email para garantir a soberania da conta.</p>
                    </div>
                    <Button 
                      disabled={isSaving}
                      onClick={handleSave}
                      className="bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-10 h-14 text-xs shadow transition-all active:scale-95"
                    >
                      {isSaving ? "Sincronizando..." : "Confirmar Protocolos"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "lilith" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <Card className="rounded-xl p-8 relative overflow-hidden">
                 <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <Cpu size={24} className="text-primary" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-foreground tracking-tight">Calibração da Lilith</h3>
                       <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ajuste os parâmetros da inteligência central</p>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-sm font-bold text-foreground">Agressividade Jurídica</span>
                            <p className="text-xs text-muted-foreground">Define o quão 'predatórias' serão as sugestões de cláusulas.</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary">LVL 08</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full w-[80%] bg-primary" />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-foreground">Criatividade de Lilith</span>
                            <p className="text-xs text-muted-foreground">Define o nível de inovação em teses e argumentos.</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">High</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {["Precisa", "Equilibrada", "Inovadora"].map((mode) => (
                            <button 
                              key={mode}
                              className={cn(
                                "py-3 px-4 rounded-xl text-xs font-bold border transition-all",
                                mode === "Inovadora" 
                                  ? "bg-primary/10 border-primary/30 text-primary shadow-sm" 
                                  : "bg-muted border-border text-muted-foreground hover:border-primary/20"
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="h-[1px] bg-border" />

                     <div className="flex items-center justify-between">
                        <div>
                           <span className="text-sm font-bold text-foreground">Modo 'Contrato de Guerra'</span>
                           <p className="text-xs text-muted-foreground">Ativa análise de risco em tempo real e auditoria constante.</p>
                        </div>
                        <div className="w-10 h-5 bg-primary/20 rounded-full relative border border-primary/30">
                           <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full shadow-sm" />
                        </div>
                     </div>
                   </div>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-card border-border rounded-xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Biometria Avançada</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Segurança de Ritual</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Exigir reconhecimento facial ou digital para acessar contratos confidenciais.</p>
                </Card>

                <Card className="bg-card border-border rounded-xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Criptografia de Alma</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AES-256 Protocol</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Todos os documentos são protegidos com chaves AES-256 e hash na blockchain.</p>
                </Card>
              </div>

              <Card className="bg-card border-border rounded-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Chaves da Infraestrutura</h3>
                      <p className="text-xs text-muted-foreground">Gerencie o acesso de sistemas externos ao seu arsenal.</p>
                    </div>
                  </div>
                    <Button variant="outline" className="h-8 text-[11px] font-bold rounded-lg px-4 border-border">Gerar Nova Chave</Button>
                </div>

                 <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Database size={16} className="text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground tracking-tight">sk_live_************************4a8b</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <Badge className="bg-muted text-muted-foreground border-none font-bold text-[9px]">Produção</Badge>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Zap size={14} /></Button>
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


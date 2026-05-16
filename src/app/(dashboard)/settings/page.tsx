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
  Database
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

  if (loading) return <div className="p-20 text-center text-zinc-500 uppercase font-black text-xs animate-pulse">Sincronizando Sistemas...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200/50 dark:border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-0">Core System</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic">Spacecraft Configuration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sistemas Centrais</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Configure os motores, a inteligência e os protocolos de defesa da sua infraestrutura jurídica.
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
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-white/5" 
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} className={cn(isActive ? "text-orange-500" : "group-hover:text-orange-500 transition-colors")} />
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
              <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                <div className="h-32 w-full bg-gradient-to-r from-orange-600/20 via-zinc-900 to-zinc-950 pt-4 pr-4 flex justify-end items-start relative">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                   <div className="relative z-10 flex flex-col items-end gap-2">
                      <Badge className="bg-orange-600 text-[10px] font-black uppercase">Arquiteto Nível 10</Badge>
                      <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[8px] text-white font-bold uppercase tracking-widest">Core Sync Active</span>
                      </div>
                   </div>
                </div>
                <CardContent className="p-8 -mt-16 relative z-10">
                  <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 rounded-full border-4 border-white dark:border-[#0c0c0e] shadow-xl transition-transform duration-500 group-hover:scale-105">
                        <AvatarImage src={profile?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="bg-zinc-100 dark:bg-white/5 text-zinc-500 font-black">{fullName?.slice(0,2).toUpperCase() || "AI"}</AvatarFallback>
                      </Avatar>
                      <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                         Alterar
                      </button>
                    </div>
                    <div className="flex-1 space-y-1 pb-4">
                      <div className="flex items-center gap-3">
                         <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">{fullName || 'Arquiteto'}</h2>
                         <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/5 text-[9px] font-bold uppercase">Soberano</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium italic">Fundador & Arquiteto Chefe da Infraestrutura ExtraJus</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">Identidade Central</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <User size={12} className="text-orange-500" /> Nome de Guerra
                          </label>
                          <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome operacional..."
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-orange-500/30 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Zap size={12} className="text-orange-500" /> Poder Residual
                          </label>
                          <div className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-black text-orange-500 flex items-center justify-between">
                            <span>{profile?.credits || 0} Créditos de Ritual</span>
                            <Link href="/faturamento" className="text-[9px] underline opacity-50 hover:opacity-100">Recarregar</Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-white/5 pb-2">Canais de Acesso</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Bell size={12} className="text-blue-500" /> Email Operacional
                          </label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@imperio.com"
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-orange-500/30 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Lock size={12} className="text-purple-500" /> Nova Chave (Senha)
                          </label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-orange-500/30 transition-all outline-none"
                          />
                          <p className="text-[9px] text-zinc-500 italic">Deixe em branco para manter a chave atual.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-zinc-500">
                       <Shield size={20} className="opacity-20" />
                       <p className="text-[10px] font-medium leading-relaxed max-w-xs">Alterações nos Canais de Acesso exigirão revalidação via email para garantir a soberania da conta.</p>
                    </div>
                    <Button 
                      disabled={isSaving}
                      onClick={handleSave}
                      className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-black uppercase tracking-widest rounded-xl px-10 h-14 text-xs shadow-xl shadow-black/10 transition-all active:scale-95"
                    >
                      {isSaving ? "Sincronizando..." : "Confirmar Protocolos"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "lilith" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <Card className="bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-xl p-8 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                 
                 <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                        <Cpu size={24} className="text-orange-500" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Calibração da Lilith</h3>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Ajuste os parâmetros da inteligência central</p>
                     </div>
                   </div>

                   <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Agressividade Jurídica</span>
                            <p className="text-xs text-zinc-500">Define o quão 'predatórias' serão as sugestões de cláusulas.</p>
                          </div>
                          <Badge variant="outline" className="border-orange-500/30 text-orange-500 bg-orange-500/5">95% (Máxima)</Badge>
                        </div>
                        <Slider defaultValue={[95]} max={100} step={1} className="py-2" />
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Criatividade de Lilith</span>
                            <p className="text-xs text-zinc-500">Define o nível de inovação em teses e argumentos.</p>
                          </div>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-500 bg-purple-500/5">High</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {["Precisa", "Equilibrada", "Inovadora"].map((mode) => (
                            <button 
                              key={mode}
                              className={cn(
                                "py-3 px-4 rounded-xl text-xs font-bold border transition-all",
                                mode === "Inovadora" 
                                  ? "bg-purple-500/10 border-purple-500/30 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                                  : "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-zinc-200 dark:hover:border-white/10"
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800" />

                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Modo 'Contrato de Guerra'</span>
                           <p className="text-xs text-zinc-500">Ativa análise de risco em tempo real e auditoria constante.</p>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-orange-600" />
                     </div>
                   </div>
                 </div>
              </Card>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500">
                      <Fingerprint size={20} />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight">Autenticação Biométrica</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Exigir reconhecimento facial ou digital para acessar contratos confidenciais.</p>
                  <Switch />
                </Card>

                <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                      <Lock size={20} />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight">Criptografia de Ponta</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Todos os documentos são protegidos com chaves AES-256 e hash na blockchain.</p>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px]">Ativo</Badge>
                </Card>
              </div>

              <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-xl p-8 space-y-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold tracking-tight">Chaves de API (Skynet Integration)</h3>
                      <p className="text-xs text-zinc-500">Gerencie o acesso de sistemas externos ao seu arsenal.</p>
                    </div>
                    <Button variant="outline" className="h-8 text-[11px] font-bold rounded-lg px-4 border-zinc-200 dark:border-white/10">Gerar Nova Chave</Button>
                 </div>
                 
                 <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-zinc-400" />
                      <span className="text-xs font-mono text-zinc-500 tracking-tight">sk_live_************************4a8b</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge className="bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border-none font-bold text-[9px]">Produção</Badge>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500"><Zap size={14} /></Button>
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


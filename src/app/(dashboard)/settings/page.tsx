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
      toast.success("Pix gerado. Selamento aguardando pagamento.");
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
        .upsert({ 
          id: user.id, 
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

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
    { id: "faturamento", name: "Faturamento & Créditos", icon: CreditCard },
  ];

  if (loading) return <div className="p-20 text-center text-muted-foreground uppercase font-black text-xs animate-pulse">Sincronizando Sistemas...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Geral</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Spacecraft Configuration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic uppercase">Configurações do Sistema</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Calibre os parâmetros da sua infraestrutura. Ajuste a agressividade da Lilith e gerencie seu fluxo de faturamento.
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

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">Identidade Central</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText size={10} /> Nome Completo
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
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
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">Canais de Acesso</h3>
                      <div className="space-y-4">
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
                            className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
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

          {activeTab === "faturamento" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <Card className="rounded-xl p-8 relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                         <CreditCard size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground tracking-tight">Faturamento & Créditos</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Gerencie seu poder computacional</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Saldo Atual</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-primary">{profile?.credits || 0}</span>
                          <span className="text-xs font-bold text-muted-foreground">CRÉDITOS</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { credits: 100, price: 10, label: "Iniciado", color: "text-blue-500" },
                      { credits: 550, price: 50, label: "Profissional", color: "text-primary", popular: true },
                      { credits: 1200, price: 100, label: "Imperial", color: "text-amber-500" },
                    ].map((pkg) => (
                      <div 
                        key={pkg.credits}
                        className={cn(
                          "p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                          pkg.popular ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border hover:border-primary/20"
                        )}
                        onClick={() => handleBuyCredits(pkg.price * 100)}
                      >
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Popular</div>
                        )}
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">{pkg.label}</span>
                        <div className="flex items-baseline gap-1 mb-4">
                           <span className={cn("text-2xl font-black", pkg.color)}>{pkg.credits}</span>
                           <span className="text-[10px] font-bold text-muted-foreground">créditos</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                           <span className="text-sm font-bold text-foreground">R$ {pkg.price}</span>
                           <Button size="sm" variant="ghost" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-primary-foreground">Adquirir</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isGeneratingPix && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl animate-pulse">
                       <Zap size={32} className="mx-auto text-primary mb-4 animate-bounce" />
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invocando Pix na Rede Neural...</p>
                    </div>
                  )}

                  {pixData && (
                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl animate-in zoom-in-95 duration-500">
                       <div className="flex flex-col md:flex-row gap-8 items-center">
                          <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                             <QRCodeSVG 
                               value={pixData.pixQrCode}
                               size={180}
                               level="L"
                               includeMargin={false}
                             />
                          </div>
                          <div className="flex-1 space-y-4">
                             <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                   <ShieldCheck size={16} /> Pagamento Seguro
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                   Aponte a câmera do seu banco para o QR Code ou use o código abaixo. Os créditos cairão instantaneamente após a confirmação.
                                </p>
                             </div>
                             <div className="space-y-2">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Código Copia e Cola</span>
                                <div className="flex gap-2">
                                   <input 
                                     readOnly 
                                     value={pixData.pixCode} 
                                     className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-[10px] font-mono truncate"
                                   />
                                   <Button 
                                     size="sm" 
                                     className="rounded-xl font-black text-[9px] uppercase tracking-widest"
                                     onClick={() => {
                                        navigator.clipboard.writeText(pixData.pixCode);
                                        toast.success("Código copiado.");
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

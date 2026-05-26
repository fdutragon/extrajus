import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Package,
  BrainCircuit
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createContractAction } from "@/app/actions";
import { BuyCreditsButton } from "@/components/ui/buy-credits-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Recent Contracts
  const { data: recentContracts } = await supabase
    .from('contracts')
    .select('id, title, updated_at, status')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  // 2. Fetch Stats
  const { count: activeCount } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'signed');

  const { count: pendingSigs } = await supabase
    .from('signatures')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: templateCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true });

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single();

  const stats = [
    { title: "Contratos Ativos", value: activeCount || 0, trend: "+2", icon: FileText, color: "text-primary" },
    { title: "Assinaturas Pendentes", value: pendingSigs || 0, trend: "Ação Nec.", icon: ShieldCheck, color: "text-primary" },
    { title: "Modelos Salvos", value: templateCount || 0, trend: "Ativos", icon: Package, color: "text-primary" },
    { title: "Créditos IA", value: profile?.credits || 0, trend: "Operacional", icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 overflow-x-hidden px-1">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border/50 pb-8 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[9px] uppercase tracking-[0.3em] font-black border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full animate-pulse">Plataforma</Badge>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase italic">Inteligência Ativa</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Comando <span className="text-muted-foreground/30 font-light">/</span> <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0] || 'Geral'}</span>
          </h1>
        </div>
        <form action={createContractAction} className="relative z-10 w-full sm:w-auto">
          <Button
            variant="outline"
            type="submit"
            className="w-full sm:w-auto relative bg-primary/5 text-primary hover:text-primary-foreground hover:bg-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-8 h-12 group transition-all duration-500 shadow-[0_0_15px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] border border-primary/30 hover:border-primary overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="relative z-10 flex items-center gap-2">
              <PlusCircle size={16} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
              Elaborar Novo Contrato
            </div>
          </Button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-md border-border/50 rounded-3xl overflow-hidden relative group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(var(--primary),0.05)]">
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/15 transition-colors duration-700 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500">
                  <stat.icon size={18} />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors",
                  stat.trend.startsWith('+') || stat.trend === 'Operacional' ? "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20" : "bg-muted text-muted-foreground border-border"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <Zap size={12} className={stat.trend === 'Operacional' ? 'animate-pulse' : ''} />} {stat.trend}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-4xl font-black tracking-tighter text-foreground leading-none group-hover:scale-[1.02] origin-left transition-transform duration-500">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Recent Contracts Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Radar de Instrumentos
            </h2>
            <Link href="/contracts" className="text-[9px] text-muted-foreground hover:text-primary transition-colors font-black flex items-center gap-1.5 uppercase tracking-widest bg-muted/40 hover:bg-primary/10 px-4 py-2 rounded-full border border-border/50 hover:border-primary/30">
              Expansão Completa <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            
            {!recentContracts || recentContracts.length === 0 ? (
              <div className="p-24 flex flex-col items-center justify-center text-center space-y-5 relative z-10">
                <div className="w-20 h-20 rounded-[32px] bg-muted/30 border border-border/50 flex items-center justify-center text-muted-foreground/30 shadow-inner">
                  <FileText size={28} />
                </div>
                <p className="text-muted-foreground/60 uppercase font-black text-[10px] tracking-widest">Nenhum contrato ativo detectado no radar.</p>
              </div>
            ) : (
              <Table className="relative z-10">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent bg-muted/30">
                    <TableHead className="text-[9px] uppercase font-black tracking-widest h-14 px-8 text-muted-foreground">Documento Ativo</TableHead>
                    <TableHead className="text-[9px] uppercase font-black tracking-widest h-14 px-6 text-muted-foreground">Status Tático</TableHead>
                    <TableHead className="text-[9px] uppercase font-black tracking-widest h-14 text-right px-8 text-muted-foreground">Último Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentContracts.map((contract) => (
                    <TableRow key={contract.id} className="border-border/30 group hover:bg-primary/5 transition-colors cursor-pointer hover:border-primary/30">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300 shadow-inner shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="flex flex-col space-y-1 min-w-0">
                            <Link href={`/editor?room=${contract.id}`} className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2 truncate max-w-[150px] sm:max-w-[250px] md:max-w-[350px] xl:max-w-[450px]">
                              {(() => {
                                const t = contract.title || 'Contrato Sem Título';
                                const minors = ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'para', 'com', 'por', 'sem', 'sob'];
                                return t.toLowerCase().split(' ').map((w: string, i: number) => (i > 0 && minors.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                              })()}
                            </Link>
                            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] font-mono">Hash: {contract.id.slice(0,8)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <Badge variant="outline" className={cn(
                          "rounded-full text-[9px] uppercase font-black px-3 py-1 border transition-colors",
                          contract.status === 'signed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          contract.status === 'pending' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/80 text-muted-foreground border-border/60"
                        )}>
                          {contract.status === 'draft' ? 'Em Edição' : 
                           contract.status === 'pending' ? 'Pendente' : 'Assinado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground text-right font-mono font-medium py-6 px-8">
                        {new Date(contract.updated_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* AI Intelligence / Sidebar Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2 flex items-center gap-2">
              <BrainCircuit size={14} className="text-primary/70" /> 
              Inteligência Analítica
            </h2>

            <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-[32px] p-8 relative overflow-hidden group transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(var(--primary),0.05)]">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/15 transition-all duration-1000 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)] text-primary shrink-0 relative">
                    <Sparkles size={24} className="animate-pulse" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Painel do Usuário</h3>
                    <p className="text-[9px] text-primary/80 uppercase tracking-[0.2em] font-black">Online & Operacional</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-[20px] bg-muted/30 border border-border/50 hover:border-primary/40 hover:bg-muted/50 transition-all group/item relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Saldo de Créditos</span>
                      </div>
                      <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{profile?.credits || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-5 pr-2">
                      Seu saldo de créditos está ativo. Otimize seus acordos ou analise cláusulas com a IA.
                    </p>
                    <BuyCreditsButton />
                  </div>

                  <div className="p-5 rounded-[20px] bg-muted/30 border border-border/50 hover:border-primary/40 hover:bg-muted/50 transition-all group/item relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Modelos de Contratos</span>
                      </div>
                      <span className="text-xs font-black font-mono text-foreground bg-muted border border-border px-2 py-0.5 rounded-md">{templateCount || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-5 pr-2">
                      Acesso aos modelos de contratos prontos validados por nossa equipe jurídica.
                    </p>
                    <Link href="/arsenal" className="block w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-10 gap-2 rounded-xl border-border/60 hover:border-primary/50 bg-background/50 hover:bg-primary/5 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                      >
                        <FileText size={14} className="text-muted-foreground group-hover/item:text-primary transition-colors" />
                        Abrir Biblioteca
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

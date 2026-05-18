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
  Package
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Dashboard</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">System Operational</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de {profile?.full_name?.split(' ')[0] || 'Controle'}</h1>
        </div>
        <form action={createContractAction}>
          <Button
            type="submit"
            className="relative bg-primary text-primary-foreground hover:opacity-90 font-black uppercase tracking-[0.1em] text-[10px] rounded-xl px-4 h-9 group transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(197,168,128,0.15)] hover:shadow-[0_0_30px_rgba(197,168,128,0.3)] border border-primary/50 hover:border-primary"
          >
            <div className="relative z-10 flex items-center gap-2">
              <PlusCircle size={14} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
              Forjar Novo Contrato
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/90 to-[#e5cfa1] opacity-100" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border rounded-xl overflow-hidden relative group transition-all duration-500 hover:border-primary/50">
            {/* Ambient Glow from the mockup */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 dark:bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/15 transition-colors duration-500" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors duration-500">
                  <stat.icon size={16} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  stat.trend.startsWith('+') || stat.trend === 'Operacional' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <Zap size={10} />} {stat.trend}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black tracking-tight text-foreground leading-none">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Contracts Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fluxo Recente</h2>
            <Link href="/contracts" className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-bold flex items-center gap-1 uppercase tracking-tighter">
              Ver Todos <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {!recentContracts || recentContracts.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground uppercase font-black text-[10px] tracking-widest">Nenhum contrato ativo no momento.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent bg-muted/50">
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest h-12 px-6">Documento</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest h-12 px-6">Status</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest h-12 text-right px-6">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentContracts.map((contract) => (
                    <TableRow key={contract.id} className="border-border group hover:bg-accent transition-colors cursor-pointer">
                      <TableCell className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <FileText size={14} />
                          </div>
                          <div className="flex flex-col">
                            <Link href={`/editor?room=${contract.id}`} className="text-[13px] font-bold tracking-tight hover:underline">{contract.title}</Link>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">ID: {contract.id.slice(0,8)}...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <Badge variant="outline" className={cn(
                          "rounded-full text-[9px] uppercase font-black px-2.5 py-0.5 border-none",
                          contract.status === 'signed' ? "bg-primary/10 text-primary" :
                          contract.status === 'pending' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {contract.status === 'draft' ? 'Em Edição' : 
                           contract.status === 'pending' ? 'Pendente' : 'Assinado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground text-right font-mono py-5 px-6">{new Date(contract.updated_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* AI Intelligence / Sidebar Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-0 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Inteligência Analítica</h2>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group transition-all duration-500">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-primary/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 transition-all duration-1000" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner text-primary">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground tracking-tight">ExtraJus AI Insights</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Priority Analysis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary">Capacidade</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors">
                      Você ainda possui <span className="text-foreground font-bold">{profile?.credits || 0} requisições</span> de auditoria IA. Tempo de resposta médio: <span className="text-foreground font-bold">4.2s</span>.
                    </p>
                    <BuyCreditsButton />
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary">Repositório</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors">
                      Sua conta possui <span className="text-foreground font-bold">{templateCount || 0} modelos</span> de contratos estruturados prontos para uso imediato.
                    </p>
                    <Link href="/arsenal" className="block w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full h-8 gap-1.5 rounded-xl border-border hover:border-primary/50 bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[9px] uppercase tracking-widest transition-all duration-300 active:scale-[0.98]"
                      >
                        <FileText size={10} className="text-muted-foreground group-hover/item:text-primary transition-colors" />
                        Biblioteca de Modelos
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

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
  Zap
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recentContracts, error } = await supabase
    .from('contracts')
    .select('id, title, updated_at')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })
    .limit(4);

  const stats = [
    { title: "Contratos Ativos", value: "24", icon: FileText, trend: "+3", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Horas de Redação", value: "142h", icon: Clock, trend: "+12h", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Taxa de Vitória", value: "98%", icon: TrendingUp, trend: "+2%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Riscos Detectados", value: "12", icon: AlertTriangle, trend: "-4", color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-zinc-200/50 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-0">War Room</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">System Operational</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Comando Central</h1>
        </div>
        <Button
          className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-bold tracking-tight rounded-lg px-5 py-2 group transition-all duration-300 shadow-lg shadow-black/10 dark:shadow-white/5"
        >
          <Link href="/editor" className="flex items-center">
            <PlusCircle size={16} className="mr-2" />
            Novo Contrato
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Contratos Ativos", value: "24", trend: "+3", icon: FileText, color: "text-blue-500" },
          { title: "Horas de Redação", value: "142h", trend: "+12h", icon: Clock, color: "text-purple-500" },
          { title: "Taxa de Vitória", value: "98%", trend: "+2%", icon: TrendingUp, color: "text-emerald-500" },
          { title: "Riscos Detectados", value: "12", trend: "-4", icon: AlertTriangle, color: "text-orange-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-[#09090b] border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden relative group transition-all duration-500 hover:border-zinc-300 dark:hover:border-white/20 shadow-sm">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors duration-500">
                  <stat.icon size={16} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  stat.trend.startsWith('+') ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-blue-500/5 text-blue-500 border-blue-500/10"
                )}>
                  {stat.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <Zap size={10} />} {stat.trend}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Fluxo Recente</h2>
            <Link href="/contracts" className="text-[11px] text-zinc-400 hover:text-orange-500 transition-colors font-bold flex items-center gap-1 uppercase tracking-tighter">
              Ver Arsenal Completo <ChevronRight size={12} />
            </Link>
          </div>

          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 dark:border-white/5 hover:bg-transparent bg-zinc-50/50 dark:bg-white/[0.02]">
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest h-10">Documento</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest h-10">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest h-10 text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContracts?.map((contract) => (
                  <TableRow key={contract.id} className="border-zinc-100 dark:border-white/5 group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors">
                          <FileText size={14} />
                        </div>
                        <div className="flex flex-col">
                          <Link href={`/editor?room=${contract.id}`} className="text-[13px] font-bold tracking-tight hover:underline">{contract.title}</Link>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">ID: {contract.id.slice(0,8)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "rounded-full text-[9px] uppercase font-black px-2.5 py-0.5 border-none",
                        "bg-zinc-500/10 text-zinc-500"
                      )}>
                        Em Edição
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] text-zinc-500 text-right font-mono">{new Date(contract.updated_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* AI Intelligence / Sidebar Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-0 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-1">Inteligência</h2>

            <div className="bg-zinc-950 dark:bg-[#09090b] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group shadow-2xl">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-orange-600/20 transition-all duration-1000" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                    <Sparkles size={20} className="text-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Lilith AI Insights</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Priority Analysis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all cursor-help group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={12} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase text-orange-500">Otimização</span>
                    </div>
                    <p className="text-[12px] text-zinc-400 leading-relaxed group-hover/item:text-zinc-200 transition-colors">
                      Detectamos 3 pontos de atrito no <span className="text-white font-bold">Projeto Fênix</span> que podem ser resolvidos com uma cláusula de arbitragem customizada.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all cursor-help group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={12} className="text-purple-500" />
                      <span className="text-[10px] font-black uppercase text-purple-500">Tendência</span>
                    </div>
                    <p className="text-[12px] text-zinc-400 leading-relaxed group-hover/item:text-zinc-200 transition-colors">
                      Sua taxa de fechamento em contratos de <span className="text-white font-bold">M&A</span> subiu 12% após o uso do arsenal de cláusulas agressivas.
                    </p>
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

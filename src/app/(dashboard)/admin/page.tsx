"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Plus, 
  Search, 
  Zap, 
  ArrowUpRight,
  Database,
  BarChart3,
  Calendar,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year">("day");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [timeRange]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "felipedutra@outlook.com") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }

  async function fetchData() {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount_cents, created_at')
        .eq('status', 'COMPLETE')
        .order('created_at', { ascending: true });
      
      const revenue = transactions?.reduce((acc, curr) => acc + curr.amount_cents, 0) || 0;
      setStats({ totalUsers: usersCount || 0, totalRevenue: revenue });

      // 2. Process Chart Data based on timeRange
      if (transactions) {
        const groupedData: Record<string, number> = {};
        transactions.forEach(tx => {
          const date = new Date(tx.created_at);
          let key = "";
          
          if (timeRange === "day") {
            key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          } else if (timeRange === "month") {
            key = date.toLocaleDateString('pt-BR', { month: 'short' });
          } else {
            key = date.getFullYear().toString();
          }

          groupedData[key] = (groupedData[key] || 0) + (tx.amount_cents / 100);
        });

        const formattedChartData = Object.entries(groupedData).map(([name, value]) => ({
          name,
          value
        }));
        setChartData(formattedChartData);
      }

      // 3. Fetch Users List
      const { data: usersList } = await supabase
        .from('profiles')
        .select('id, full_name, email, credits, updated_at')
        .order('updated_at', { ascending: false });
      
      if (usersList) setUsers(usersList);
    } catch (error) {
      console.error("Admin Error:", error);
      toast.error("Falha ao carregar dados táticos.");
    } finally {
      setLoading(false);
    }
  }

  const handleManualAddCredits = async (userId: string, currentCredits: number) => {
    const amount = prompt("Quantidade de créditos para injetar:", "100");
    if (!amount || isNaN(parseInt(amount))) return;

    try {
      const newCredits = (currentCredits || 0) + parseInt(amount);
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);
      
      if (error) throw error;
      toast.success(`${amount} créditos injetados com sucesso.`);
      fetchData(); // Refresh
    } catch (error) {
      toast.error("Falha na injeção de créditos.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
       <p className="font-black text-[10px] uppercase tracking-[0.4em] text-primary">Decodificando Império...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      {/* Sovereign Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px] uppercase tracking-widest font-bold px-2 py-0">Admin Access</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Command & Control Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic uppercase">Painel de Comando</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Visão estratégica do império. Monitore novos recrutas, valide transações e gerencie o fluxo de poder através de métricas avançadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-muted p-1 rounded-xl border border-border flex gap-1">
              {(["day", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    timeRange === range ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background"
                  )}
                >
                  {range === "day" ? "Dia" : range === "month" ? "Mês" : "Ano"}
                </button>
              ))}
           </div>
           <Button onClick={fetchData} variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary/5 h-9">
              Sincronizar
           </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} />
           </div>
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Recrutas Totais</span>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">{stats.totalUsers}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                 <ArrowUpRight size={10} /> +12%
              </span>
           </div>
        </Card>

        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} />
           </div>
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Receita Acumulada</span>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary">R$ {(stats.totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>

        <Card className="bg-card border-primary/10 rounded-2xl p-6 relative overflow-hidden bg-primary/[0.02]">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xl font-black">$</div>
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Lucro Operacional</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">R$ {((stats.totalRevenue * 0.94) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Net</span>
           </div>
        </Card>
      </div>

      {/* Chart Section - The War Room Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Curva de Crescimento
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Fluxo de caixa gerado pela rede</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border">
               <Calendar size={12} className="text-muted-foreground" />
               <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{timeRange === 'day' ? 'Últimos 30 Dias' : timeRange === 'month' ? 'Visão Mensal' : 'Histórico Anual'}</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{name: 'Sem Dados', value: 0}]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f0f11', 
                    borderRadius: '16px', 
                    border: '1px solid #27272a',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#c0ff00' }}
                  formatter={(value: any) => [`R$ ${Number(value || 0).toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-6">Injeções de Capital</h3>
              <div className="space-y-6">
                {[
                  { label: "Média por Pix", value: stats.totalRevenue / (chartData.length || 1), icon: Wallet, color: "text-blue-500" },
                  { label: "Maior Ritual", value: 12000, icon: Zap, color: "text-primary" },
                  { label: "Taxas do Sistema", value: stats.totalRevenue * 0.06, icon: Database, color: "text-muted-foreground" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                       <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                          <item.icon size={14} />
                       </div>
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-foreground">R$ {(item.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-border">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                 Os dados são processados em tempo real pela rede neural Lilith para garantir precisão absoluta nas métricas de guerra.
              </p>
           </div>
        </Card>
      </div>

      {/* User Management */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Database size={14} className="text-primary" /> Gerenciamento de Identidades
           </h3>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
              />
           </div>
        </div>

        <Card className="rounded-2xl border-border overflow-hidden shadow-xl shadow-black/5">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-muted/50 border-b border-border">
                       <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-left">Arquiteto</th>
                       <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Créditos</th>
                       <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Último Acesso</th>
                       <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Operações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((user) => (
                       <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.full_name || "Sem Nome"}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">{user.email || "Sem Email"}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold font-mono">
                                {user.credits || 0}
                             </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className="text-[10px] font-medium text-muted-foreground">
                                {user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Button 
                               onClick={() => handleManualAddCredits(user.id, user.credits)}
                               size="sm" 
                               variant="ghost" 
                               className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                             >
                                <Plus size={12} className="mr-1" /> Injetar Créditos
                             </Button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </Card>
      </div>
    </div>
  );
}

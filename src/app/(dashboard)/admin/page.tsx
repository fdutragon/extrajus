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
  Wallet,
  Coins,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck
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
  
  // Estados para o Saque Cripto GGPix
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawAmountBRL, setWithdrawAmountBRL] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

  // Estados para Carteiras Salvas
  const [savedWallets, setSavedWallets] = useState<any[]>([]);
  const [newWalletLabel, setNewWalletLabel] = useState("");
  const [loadingWallets, setLoadingWallets] = useState(false);

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

      // 3. Fetch Users List via backend API to bypass RLS
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.users || []);
      }
      
      // Carregar saques cripto integrados e carteiras salvas
      fetchWithdrawals();
      fetchSavedWallets();
    } catch (error) {
      console.error("Admin Error:", error);
      toast.error("Falha ao carregar dados táticos.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWithdrawals() {
    setLoadingWithdrawals(true);
    try {
      const response = await fetch("/api/admin/crypto/withdraw");
      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoadingWithdrawals(false);
    }
  }

  async function fetchSavedWallets() {
    setLoadingWallets(true);
    try {
      const response = await fetch("/api/admin/crypto/wallets");
      const data = await response.json();
      if (data.success) {
        setSavedWallets(data.wallets || []);
      }
    } catch (err) {
      console.error("Error fetching saved wallets:", err);
    } finally {
      setLoadingWallets(false);
    }
  }

  const handleSaveWallet = async () => {
    if (!withdrawWallet || !withdrawWallet.startsWith("0x") || withdrawWallet.length !== 42) {
      toast.error("Por favor, digite um endereço BSC válido primeiro.");
      return;
    }
    if (!newWalletLabel.trim()) {
      toast.error("Por favor, digite um nome identificador para a carteira.");
      return;
    }

    try {
      const res = await fetch("/api/admin/crypto/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newWalletLabel.trim(),
          address: withdrawWallet
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Carteira salva com sucesso!");
        setNewWalletLabel("");
        fetchSavedWallets();
      } else {
        toast.error(data.error || "Erro ao salvar carteira.");
      }
    } catch (err) {
      toast.error("Falha ao salvar carteira.");
    }
  };

  const handleDeleteWallet = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover esta carteira salva?")) {
      try {
        const res = await fetch(`/api/admin/crypto/wallets?address=${address}`, {
          method: "DELETE"
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("Carteira removida.");
          fetchSavedWallets();
        } else {
          toast.error(data.error || "Erro ao remover carteira.");
        }
      } catch (err) {
        toast.error("Falha ao remover carteira.");
      }
    }
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmountBRL || isNaN(parseFloat(withdrawAmountBRL))) {
      toast.error("Por favor, informe um valor válido para saque.");
      return;
    }

    if (!withdrawWallet || !withdrawWallet.startsWith("0x") || withdrawWallet.length !== 42) {
      toast.error("Endereço de carteira BSC (USDT BEP-20) inválido.");
      return;
    }

    const amountCents = Math.round(parseFloat(withdrawAmountBRL) * 100);

    if (confirm(`Confirma o saque de R$ ${parseFloat(withdrawAmountBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para a carteira ${withdrawWallet}?`)) {
      setSubmittingWithdraw(true);
      try {
        const res = await fetch("/api/admin/crypto/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountBRLCents: amountCents,
            walletAddress: withdrawWallet
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("💥 Ritual de Saque Executado com Sucesso!");
          setWithdrawAmountBRL("");
          setWithdrawWallet("");
          fetchWithdrawals();
        } else {
          toast.error(data.error || "Erro ao processar saque.");
        }
      } catch (err) {
        toast.error("Falha ao executar ritual de saque.");
      } finally {
        setSubmittingWithdraw(false);
      }
    }
  };

  const handleSyncWithdrawalStatus = async (withdrawId: string) => {
    try {
      toast.info("Consultando status neural do saque...");
      const res = await fetch(`/api/admin/crypto/withdraw?id=${withdrawId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Status do saque atualizado: ${data.withdrawal.status}`);
        fetchWithdrawals();
      } else {
        toast.error(data.error || "Erro ao atualizar status.");
      }
    } catch (err) {
      toast.error("Falha ao consultar status.");
    }
  };

  const handleManualAddCredits = async (userId: string, currentCredits: number) => {
    const amount = prompt("Quantidade de créditos para injetar:", "100");
    if (!amount || isNaN(parseInt(amount))) return;

    try {
      const newCredits = (currentCredits || 0) + parseInt(amount);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newCredits })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${amount} créditos injetados com sucesso.`);
        fetchData(); // Refresh
      } else {
        toast.error(data.error || "Falha na injeção de créditos.");
      }
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

      {/* Terminal de Saque Cripto - GGPix Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Saque */}
        <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Coins size={120} className="text-primary" />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground mb-1 flex items-center gap-2">
                 <Coins size={16} className="text-primary animate-pulse" /> Ritual de Saque Cripto
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-6">Debitar BRL e enviar USDT (BEP-20) via GGPix</p>
              
                             <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Valor do Saque (R$)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={withdrawAmountBRL}
                          onChange={(e) => setWithdrawAmountBRL(e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                          required
                        />
                     </div>
                  </div>

                  {/* Carteiras Salvas Dropdown */}
                  {savedWallets.length > 0 && (
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex justify-between">
                          <span>Carteiras Salvas</span>
                          <span className="text-[8px] text-primary/80 lowercase cursor-pointer">clique para preencher</span>
                       </label>
                       <select
                         onChange={(e) => {
                           if (e.target.value) {
                             setWithdrawWallet(e.target.value);
                           }
                         }}
                         value={withdrawWallet}
                         className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                       >
                          <option value="" className="bg-card text-muted-foreground">Selecionar carteira salva...</option>
                          {savedWallets.map((w, idx) => (
                            <option key={idx} value={w.address} className="bg-card text-foreground">
                               {w.label} ({w.address.slice(0, 6)}...{w.address.slice(-4)})
                            </option>
                          ))}
                       </select>
                    </div>
                  )}

                  <div className="space-y-1">
                     <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Endereço da Carteira BSC (USDT BEP-20)</label>
                     <div className="relative">
                        <input 
                          type="text"
                          placeholder="0x..."
                          value={withdrawWallet}
                          onChange={(e) => setWithdrawWallet(e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                          required
                        />
                     </div>
                  </div>

                  {/* Salvar Carteira Atual Form */}
                  {withdrawWallet && withdrawWallet.startsWith("0x") && withdrawWallet.length === 42 && !savedWallets.some(w => w.address.toLowerCase() === withdrawWallet.toLowerCase()) && (
                    <div className="pt-1.5 space-y-1.5 border border-border/40 rounded-xl p-2.5 bg-muted/10 transition-all duration-300 animate-fadeIn">
                       <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Salvar esta carteira no painel?</label>
                       <div className="flex gap-1.5">
                          <input 
                            type="text"
                            placeholder="Apelido (Ex: Trust Principal)"
                            value={newWalletLabel}
                            onChange={(e) => setNewWalletLabel(e.target.value)}
                            className="flex-1 bg-muted/35 border border-border rounded-lg px-2.5 py-1 text-[10px] font-bold focus:ring-1 focus:ring-primary/10 outline-none transition-all"
                          />
                          <Button
                            type="button"
                            onClick={handleSaveWallet}
                            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                             Salvar
                          </Button>
                       </div>
                    </div>
                  )}

                  {/* Lista com exclusão das carteiras salvas */}
                  {savedWallets.length > 0 && (
                    <div className="pt-2 border-t border-border/30 space-y-1.5">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Gerenciar Carteiras</span>
                       <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                          {savedWallets.map((w, idx) => (
                             <div key={idx} className="flex justify-between items-center bg-muted/20 hover:bg-muted/40 rounded-lg p-1.5 transition-all text-[9px] font-bold">
                                <span className="text-foreground truncate max-w-[120px]" title={w.label}>{w.label}</span>
                                <div className="flex items-center gap-1.5 font-mono text-[8px] text-muted-foreground">
                                   <span>{w.address.slice(0, 4)}...{w.address.slice(-4)}</span>
                                   <button
                                     type="button"
                                     onClick={(e) => handleDeleteWallet(w.address, e)}
                                     className="text-destructive hover:text-destructive/80 transition-all font-black px-1"
                                     title="Remover Carteira"
                                   >
                                      ✕
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="pt-2">
                     <Button 
                       type="submit" 
                       disabled={submittingWithdraw}
                       className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                     >
                        {submittingWithdraw ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" /> Processando Ritual...
                          </>
                        ) : (
                          <>
                            <ArrowDownRight size={12} /> Executar Saque Cripto
                          </>
                        )}
                     </Button>
                  </div>
               </form>
           </div>

           <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
              <ShieldCheck size={12} /> IP Whitelist e Endereço BSC Protegidos por SSL/TLS
           </div>
        </Card>

        {/* Histórico de Saques Cripto */}
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
           <div>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Registro de Transações Cripto</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Status em tempo real das chancelas GGPix</p>
                 </div>
                 <Button 
                   onClick={fetchWithdrawals} 
                   disabled={loadingWithdrawals}
                   variant="ghost" 
                   size="sm" 
                   className="h-8 w-8 p-0 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                 >
                    <RefreshCw size={12} className={cn(loadingWithdrawals && "animate-spin")} />
                 </Button>
              </div>

              <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                 {withdrawals.length === 0 ? (
                   <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                      Nenhum saque cripto registrado neste quadrante do império.
                   </div>
                 ) : (
                   <table className="w-full text-left border-collapse text-xs">
                      <thead>
                         <tr className="border-b border-border/50 pb-2">
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest">ID do Saque</th>
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest">Destinatário (BSC)</th>
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center">BRL Débito</th>
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center">USDT (Est)</th>
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                            <th className="pb-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest text-right">Ação</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                         {withdrawals.map((w: any) => (
                            <tr key={w.id} className="hover:bg-primary/[0.01] transition-colors">
                               <td className="py-3 font-mono font-bold text-foreground text-[10px]">{w.id}</td>
                               <td className="py-3 font-mono text-[9px] text-muted-foreground" title={w.wallet || w.walletAddress}>
                                  {(w.wallet || w.walletAddress || "0x...").slice(0, 6)}...{(w.wallet || w.walletAddress || "0x...").slice(-4)}
                               </td>
                               <td className="py-3 font-bold text-center">
                                  R$ {((w.amountBRLCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                               </td>
                               <td className="py-3 font-bold text-primary text-center">
                                  {w.estimatedUSDT || "0.00"} USDT
                               </td>
                               <td className="py-3 text-center">
                                  {w.status === "COMPLETE" ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[7px] font-black px-1.5 py-0.5 rounded">CONCLUÍDO</Badge>
                                  ) : w.status === "PENDING" ? (
                                    <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[7px] font-black px-1.5 py-0.5 rounded animate-pulse">PENDENTE</Badge>
                                  ) : (
                                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[7px] font-black px-1.5 py-0.5 rounded" title={w.failureReason || "Falha desconhecida"}>FALHOU</Badge>
                                  )}
                               </td>
                               <td className="py-3 text-right">
                                  <Button 
                                    onClick={() => handleSyncWithdrawalStatus(w.id)}
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 text-primary transition-all"
                                    title="Sincronizar Status com GGPix"
                                  >
                                     <RefreshCw size={10} />
                                  </Button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </div>

           {withdrawals.length > 0 && (
             <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Clique no ícone de sincronização para consultar o status on-chain.</span>
                <span>BSC BEP-20 Network</span>
             </div>
           )}
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

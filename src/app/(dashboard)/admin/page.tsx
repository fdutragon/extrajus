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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
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

  // Estados para Saldo GGPix
  const [ggpixBalance, setGgpixBalance] = useState("R$ 0,00");
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Estados para Solicitações de Forja Customizada
  const [forgeRequests, setForgeRequests] = useState<any[]>([]);
  const [loadingForge, setLoadingForge] = useState(false);
  const [forgeResponseText, setForgeResponseText] = useState<Record<string, string>>({});
  const [submittingForgeResponse, setSubmittingForgeResponse] = useState<Record<string, boolean>>({});

  // Estados para Disparo Manual de Notificações
  const [directNotificationUserId, setDirectNotificationUserId] = useState("");
  const [directNotificationTitle, setDirectNotificationTitle] = useState("");
  const [directNotificationMessage, setDirectNotificationMessage] = useState("");
  const [submittingNotification, setSubmittingNotification] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

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
      fetchGgpixBalance();
      fetchForgeRequests();
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

  async function fetchGgpixBalance() {
    setLoadingBalance(true);
    try {
      const response = await fetch("/api/admin/crypto/balance");
      const data = await response.json();
      if (data.success) {
        setGgpixBalance(data.balanceFormatted || `R$ ${(data.balance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
    } catch (err) {
      console.error("Error fetching GGPix balance:", err);
    } finally {
      setLoadingBalance(false);
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

  const fetchForgeRequests = async () => {
    setLoadingForge(true);
    try {
      const res = await fetch("/api/admin/forge");
      const data = await res.json();
      if (res.ok && data.success) {
        setForgeRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching forge requests:", err);
    } finally {
      setLoadingForge(false);
    }
  };

  const handleRespondForgeRequest = async (requestId: string, userId: string) => {
    const answer = forgeResponseText[requestId];
    if (!answer || !answer.trim()) {
      toast.error("Por favor, digite uma resposta para enviar.");
      return;
    }

    setSubmittingForgeResponse(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch("/api/admin/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, userId, answer })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resposta enviada e usuário notificado com sucesso!");
        setForgeResponseText(prev => ({ ...prev, [requestId]: "" }));
        fetchForgeRequests();
      } else {
        toast.error(data.error || "Falha ao responder solicitação.");
      }
    } catch (err) {
      toast.error("Erro ao enviar resposta.");
    } finally {
      setSubmittingForgeResponse(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleSendDirectNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directNotificationUserId || !directNotificationTitle || !directNotificationMessage) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSubmittingNotification(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: directNotificationUserId,
          title: directNotificationTitle,
          message: directNotificationMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Notificação enviada com sucesso!");
        setDirectNotificationTitle("");
        setDirectNotificationMessage("");
        setDirectNotificationUserId("");
      } else {
        toast.error(data.error || "Falha ao enviar notificação.");
      }
    } catch (err) {
      toast.error("Erro de comunicação ao enviar.");
    } finally {
      setSubmittingNotification(false);
    }
  };

  if (loading && users.length === 0) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
       <p className="font-black text-[10px] tracking-widest text-primary">Decodificando Império...</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      {/* Sovereign Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px] tracking-wide font-bold px-2 py-0">Admin Access</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-wide italic">Command & Control Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Comando</h1>
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
           <Button onClick={fetchData} variant="outline" size="sm" className="rounded-xl font-bold text-[10px] tracking-wide border-primary/20 hover:bg-primary/5 h-9">
              Sincronizar
           </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[130px] transition-all hover:border-primary/20">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={56} className="text-foreground" />
           </div>
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block font-bold">Recrutas Totais</span>
           <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-foreground">{stats.totalUsers}</span>
              <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                 <ArrowUpRight size={8} /> +12%
              </span>
           </div>
        </Card>

        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[130px] transition-all hover:border-primary/20">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={56} className="text-primary" />
           </div>
           <span className="text-[10px] font-black text-muted-foreground tracking-wide block">Receita Acumulada</span>
           <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-primary">R$ {(stats.totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </div>
        </Card>

        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[130px] transition-all hover:border-primary/20">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Coins size={56} className="text-foreground" />
           </div>
           <span className="text-[10px] font-black text-muted-foreground tracking-wide block">Lucro Operacional</span>
           <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-foreground">R$ {((stats.totalRevenue * 0.94) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-[9px] font-black text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded-md">Net</span>
           </div>
        </Card>

        <Card className="bg-card border-border rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[130px] transition-all hover:border-emerald-500/20">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={56} className="text-emerald-500" />
           </div>
           <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-muted-foreground tracking-wide block">Saldo GGPix (BRL)</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
           </div>
           <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-black text-emerald-400">{ggpixBalance}</span>
           </div>
        </Card>
      </div>

      {/* Chart Section - The War Room Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden h-full flex flex-col justify-between">
           <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                 <div>
                    <h3 className="text-sm font-black tracking-wide text-foreground flex items-center gap-2">
                       <BarChart3 size={16} className="text-primary" /> Curva de Crescimento
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-1">Fluxo de caixa gerado pela rede</p>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border">
                    <Calendar size={12} className="text-muted-foreground" />
                    <span className="text-[10px] font-black text-foreground tracking-wide">{timeRange === 'day' ? 'Últimos 30 Dias' : timeRange === 'month' ? 'Visão Mensal' : 'Histórico Anual'}</span>
                 </div>
              </div>
              
              <div className="h-[280px] w-full min-w-0 overflow-hidden" style={{ minWidth: 0 }}>
                 {mounted && (
                    <ResponsiveContainer width="99%" height="100%">
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
                 )}
              </div>
           </div>
        </Card>

        <Card className="bg-card border-border rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden h-full">
           <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
           <div>
              <h3 className="text-sm font-black tracking-wide text-foreground mb-6">Injeções de Capital</h3>
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
                        <span className="text-[10px] font-black text-muted-foreground tracking-wide">{item.label}</span>
                     </div>
                     <span className="text-xs font-black text-foreground">R$ {(item.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-border">
              <p className="text-[9px] font-bold text-muted-foreground tracking-wide leading-relaxed">
                 Os dados são processados em tempo real pela rede neural Lilith para garantir precisão absoluta nas métricas de guerra.
              </p>
           </div>
        </Card>
      </div>

      {/* Terminal de Saque Cripto - GGPix Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Formulário de Saque */}
        <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Coins size={120} className="text-primary" />
           </div>
           <div>
              <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                 <Coins size={16} className="text-primary animate-pulse" /> Ritual de Saque Cripto
              </h3>
              <p className="text-[10px] text-muted-foreground font-bold tracking-wide mb-6">Debitar BRL e enviar USDT (BEP-20) via GGPix</p>
              
              <form onSubmit={handleExecuteWithdrawal} className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/80 block mb-1.5">Valor do Saque (R$)</label>
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
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground/80 block mb-1.5 flex justify-between">
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

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/80 block mb-1.5">Endereço da Carteira BSC (USDT BEP-20)</label>
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

                 <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={submittingWithdraw}
                      className="w-full h-11 rounded-xl text-[10px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
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

           <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-emerald-500 tracking-wide">
              <ShieldCheck size={12} /> IP Whitelist e Endereço BSC Protegidos por SSL/TLS
           </div>
        </Card>

        {/* Histórico de Saques Cripto */}
        <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
           <div>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-sm font-black tracking-wide text-foreground">Registro de Transações Cripto</h3>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-1">Status em tempo real das chancelas GGPix</p>
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

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                 {withdrawals.length === 0 ? (
                   <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                      Nenhum saque cripto registrado neste quadrante do império.
                   </div>
                 ) : (
                    <table className="w-full text-left border-collapse text-xs">
                       <thead>
                          <tr className="border-b border-border text-[9px] font-black text-muted-foreground tracking-wide">
                             <th className="pb-3">Data</th>
                             <th className="pb-3">Valor BRL</th>
                             <th className="pb-3">Destinatário</th>
                             <th className="pb-3">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border/40 font-bold">
                          {withdrawals.map((w: any) => (
                             <tr key={w.id} className="hover:bg-muted/10 transition-colors">
                                <td className="py-3 font-mono text-[10px] text-muted-foreground">
                                   {new Date(w.updatedAt || w.createdAt).toLocaleDateString('pt-BR')} {new Date(w.updatedAt || w.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3 font-black text-foreground">
                                   R$ {(w.amountBRLCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 font-mono text-[10px] text-muted-foreground">
                                   {w.walletAddress.slice(0, 6)}...{w.walletAddress.slice(-4)}
                                </td>
                                <td className="py-3">
                                   <Badge 
                                     variant="outline" 
                                     className={cn(
                                       "text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border-none",
                                       w.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" :
                                       w.status === "FAILED" ? "bg-destructive/15 text-destructive" :
                                       "bg-yellow-500/15 text-yellow-400 animate-pulse"
                                     )}
                                   >
                                      {w.status === "COMPLETED" ? "Sucesso" :
                                       w.status === "FAILED" ? "Falhou" : "Pendente"}
                                   </Badge>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 )}
              </div>
           </div>

           <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground tracking-wide">
              <span>Sincronizado automaticamente com blockchain</span>
              <span className="text-primary italic">GGPIX ENGINE</span>
           </div>
        </Card>
      </div>

      {/* Gerenciador de Carteiras Cripto Salvas */}

      <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Wallet size={120} className="text-primary animate-pulse" />
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
               <div>
                  <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                     <Wallet size={16} className="text-primary" /> Adicionar Carteira Cripto
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
                     Salve seus endereços BSC (BEP-20) favoritos para uso tático nos saques.
                  </p>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveWallet();
               }} className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1.5">Apelido da Carteira</label>
                     <input 
                       type="text"
                       placeholder="Ex: Metamask Principal, Trust Secundária"
                       value={newWalletLabel}
                       onChange={(e) => setNewWalletLabel(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                       required
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1.5">Endereço da Carteira BSC (USDT BEP-20)</label>
                     <input 
                       type="text"
                       placeholder="0x..."
                       value={withdrawWallet}
                       onChange={(e) => setWithdrawWallet(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                       required
                     />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 rounded-xl text-[10px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                     <Plus size={12} /> Salvar Carteira
                  </Button>
               </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
               <div>
                  <h3 className="text-sm font-black tracking-wide text-foreground mb-1">
                     Suas Carteiras Armazenadas
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
                     Lista de carteiras blindadas no banco de dados.
                  </p>
               </div>

               {savedWallets.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                    Nenhuma carteira salva. Use o formulário ao lado para adicionar.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
                    {savedWallets.map((w, idx) => (
                       <div key={idx} className="bg-muted/15 border border-border/60 hover:border-border rounded-2xl p-4 transition-all flex justify-between items-start group">
                          <div className="space-y-1 truncate max-w-[80%]">
                             <span className="text-[11px] font-black text-foreground block truncate">{w.label}</span>
                             <span className="text-[9px] font-mono text-muted-foreground block truncate">{w.address}</span>
                          </div>
                          <div className="flex gap-2">
                             <button
                               type="button"
                               onClick={() => {
                                 navigator.clipboard.writeText(w.address);
                                 toast.success("Endereço copiado!");
                               }}
                               className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all text-xs"
                               title="Copiar Endereço"
                             >
                                📋
                             </button>
                             <button
                               type="button"
                               onClick={(e) => handleDeleteWallet(w.address, e)}
                               className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all text-xs"
                               title="Remover Carteira"
                             >
                                ✕
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>
         </div>
      </Card>

      {/* Seção 1: Gerenciamento de Identidades (Usuários) e Envio de Notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
         {/* Lista de Usuários e Injeção de Créditos */}
         <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                     <h3 className="text-sm font-black tracking-wide text-foreground">Gerenciamento de Identidades</h3>
                     <p className="text-[10px] text-muted-foreground font-bold tracking-wide mt-1">Monitore e injete créditos nos recrutas do império</p>
                  </div>
                  
                  <div className="relative max-w-xs w-full">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                     <input 
                       type="text"
                       placeholder="Buscar por nome ou e-mail..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                       Nenhum recruta correspondente encontrado.
                    </div>
                  ) : (
                     <table className="w-full text-left border-collapse text-xs">
                        <thead>
                           <tr className="border-b border-border text-[9px] font-black text-muted-foreground tracking-wide">
                              <th className="pb-3">Nome / E-mail</th>
                              <th className="pb-3">Créditos Atuais</th>
                              <th className="pb-3 text-right">Ação</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-bold">
                           {filteredUsers.map((u: any) => (
                              <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                                 <td className="py-3">
                                    <div className="flex flex-col">
                                       <span className="text-foreground text-[11px]">{u.full_name || 'Sem nome'}</span>
                                       <span className="text-[9px] text-muted-foreground font-mono">{u.email}</span>
                                    </div>
                                 </td>
                                 <td className="py-3 font-black text-primary text-[12px]">
                                    {u.credits || 0}
                                 </td>
                                 <td className="py-3 text-right">
                                    <Button 
                                      onClick={() => handleManualAddCredits(u.id, u.credits)}
                                      variant="outline" 
                                      size="sm" 
                                      className="h-7 rounded-lg text-[9px] font-black tracking-wide border-primary/20 hover:bg-primary/5 px-3"
                                    >
                                       Injetar Poder
                                    </Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground tracking-wide">
               <span>Total de recrutas listados: {filteredUsers.length}</span>
               <span className="text-primary italic">FORJA CENTRAL</span>
            </div>
         </Card>

         {/* Disparador de Notificações Manuais */}
         <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between h-full">
            <div>
               <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Disparo de Notificações
               </h3>
               <p className="text-[10px] text-muted-foreground font-bold tracking-wide mb-6">
                  Envie mensagens e alertas diretos em tempo real para os usuários.
               </p>

               <form onSubmit={handleSendDirectNotification} className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Destinatário</label>
                     
                     {/* Seletor Customizado Premium e Temático */}
                     <div className="relative">
                        <div 
                          onClick={() => setIsSelectOpen(!isSelectOpen)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold flex justify-between items-center cursor-pointer hover:bg-muted/40 transition-all focus:ring-2 focus:ring-primary/10"
                        >
                           <span className={cn(
                             directNotificationUserId === "all" 
                               ? "text-primary font-black" 
                               : directNotificationUserId 
                                 ? "text-foreground font-bold" 
                                 : "text-muted-foreground/45"
                           )}>
                              {directNotificationUserId === "all"
                                ? "📢 FAZER DISPARO GLOBAL (TODOS)"
                                : users.find((u: any) => u.id === directNotificationUserId)?.full_name || 
                                  users.find((u: any) => u.id === directNotificationUserId)?.email || 
                                  "Selecione um recruta..."}
                           </span>
                           <span className="text-muted-foreground/60 text-[9px]">▼</span>
                        </div>

                        {isSelectOpen && (
                           <>
                              {/* Backdrop invisível para fechar ao clicar fora */}
                              <div className="fixed inset-0 z-40" onClick={() => setIsSelectOpen(false)} />
                              
                              <div className="absolute left-0 right-0 mt-2 bg-card/95 border border-border rounded-2xl shadow-2xl backdrop-blur-md z-50 p-2 max-h-[220px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                 <div 
                                   onClick={() => {
                                     setDirectNotificationUserId("all");
                                     setIsSelectOpen(false);
                                   }}
                                   className={cn(
                                     "w-full text-left px-3 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center justify-between",
                                     directNotificationUserId === "all" ? "bg-primary/10 text-primary" : "text-primary hover:bg-primary/5"
                                   )}
                                 >
                                    <span>📢 FAZER DISPARO GLOBAL (TODOS)</span>
                                 </div>
                                 
                                 <div className="h-[1px] bg-border/40 my-1.5" />

                                 {users.map((u: any) => {
                                    const isUserSelected = directNotificationUserId === u.id;
                                    return (
                                       <div 
                                         key={u.id}
                                         onClick={() => {
                                           setDirectNotificationUserId(u.id);
                                           setIsSelectOpen(false);
                                         }}
                                         className={cn(
                                           "w-full text-left px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all flex flex-col gap-0.5 mt-0.5",
                                           isUserSelected 
                                             ? "bg-primary/10 text-primary border border-primary/20" 
                                             : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                         )}
                                       >
                                          <span className="font-bold text-[11px]">{u.full_name || 'Sem nome'}</span>
                                          <span className="text-[9px] text-muted-foreground font-mono">{u.email}</span>
                                       </div>
                                    );
                                 })}
                              </div>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Título do Alerta</label>
                     <input 
                       type="text"
                       placeholder="Ex: Atualização do Sistema, Alerta de Segurança"
                       value={directNotificationTitle}
                       onChange={(e) => setDirectNotificationTitle(e.target.value)}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                       required
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/80 block mb-1">Mensagem do Comunicado</label>
                     <textarea 
                       placeholder="Descreva com detalhes o comunicado..."
                       value={directNotificationMessage}
                       onChange={(e) => setDirectNotificationMessage(e.target.value)}
                       rows={3}
                       className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                       required
                     />
                  </div>

                  <Button 
                    type="submit"
                    disabled={submittingNotification}
                    className="w-full h-11 rounded-xl text-[10px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                     {submittingNotification ? "Disparando..." : "Disparar Alerta em Tempo Real"}
                  </Button>
               </form>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-[8px] font-black text-primary tracking-wide">
               <ShieldCheck size={12} /> Disparos criptografados com canal seguro SSE/WebSockets
            </div>
         </Card>
      </div>

      {/* Seção 2: Central de Atendimento de Solicitações de Forja Customizada */}
      <Card className="bg-card border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Database size={120} className="text-primary animate-pulse" />
         </div>
         <div className="space-y-6">
            <div>
               <h3 className="text-sm font-black tracking-wide text-foreground mb-1 flex items-center gap-2">
                  <Database size={16} className="text-primary" /> Central de Perguntas & Solicitações de Forja
               </h3>
               <p className="text-[10px] text-muted-foreground font-bold tracking-wide">
                  Responda às demandas de modelos sob medida dos recrutas e envie notificações imediatas com os arquivos forjados.
               </p>
            </div>

            <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-1 space-y-4">
               {loadingForge && forgeRequests.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                    Consultando registros no banco de dados...
                 </div>
               ) : forgeRequests.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground font-black text-[9px] uppercase tracking-widest border border-dashed rounded-2xl border-border">
                    Nenhuma solicitação de forja customizada registrada neste setor.
                 </div>
               ) : (
                  forgeRequests.map((req: any) => (
                     <div key={req.id} className="bg-muted/10 border border-border/60 hover:border-border rounded-2xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-3">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border-none",
                                  req.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400 animate-pulse"
                                )}
                              >
                                 {req.status === "completed" ? "Respondida" : "Pendente"}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                 Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')} às {new Date(req.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                           </div>

                           <div className="space-y-1">
                              <span className="text-[11px] font-black text-foreground block">
                                 Solicitante: <span className="text-primary">{req.profiles?.full_name || 'Recruta'}</span> ({req.profiles?.email})
                              </span>
                              <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 p-3.5 rounded-xl border border-border/30">
                                 "{req.description}"
                              </p>
                           </div>
                        </div>

                        {req.status !== 'completed' ? (
                           <div className="w-full md:w-80 space-y-2 shrink-0">
                              <textarea
                                placeholder="Redija a resposta ou o link do documento forjado..."
                                value={forgeResponseText[req.id] || ""}
                                onChange={(e) => setForgeResponseText(prev => ({ ...prev, [req.id]: e.target.value }))}
                                rows={2}
                                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                              />
                              <Button
                                onClick={() => handleRespondForgeRequest(req.id, req.user_id)}
                                disabled={submittingForgeResponse[req.id]}
                                className="w-full h-8 rounded-lg text-[9px] font-black tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                              >
                                 {submittingForgeResponse[req.id] ? "Enviando Resposta..." : "Enviar Resposta & Notificar"}
                              </Button>
                           </div>
                        ) : (
                           <div className="w-full md:w-80 py-4 flex items-center justify-center shrink-0 border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5 text-emerald-400 font-bold text-[9px] uppercase tracking-widest gap-2">
                              ✓ Demanda Atendida com Sucesso
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </Card>
      
    </div>
  );
}

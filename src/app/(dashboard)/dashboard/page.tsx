"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight,
  ArrowUpRight
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

export default function DashboardPage() {
  const stats = [
    { title: "Contratos Ativos", value: "24", icon: FileText, trend: "+3", color: "text-blue-500" },
    { title: "Horas de Redação", value: "142h", icon: Clock, trend: "+12h", color: "text-purple-500" },
    { title: "Taxa de Vitória", value: "98%", icon: TrendingUp, trend: "+2%", color: "text-emerald-500" },
    { title: "Riscos Detectados", value: "12", icon: AlertTriangle, trend: "-4", color: "text-orange-500" },
  ];

  const recentContracts = [
    { id: "001", name: "Contrato de Prestação de Serviços - Alpha", client: "Alpha Corp", date: "14/05/2026", status: "Em Revisão", type: "Prestação de Serviço" },
    { id: "002", name: "NDA - Parceria Estratégica", client: "Beta S.A.", date: "13/05/2026", status: "Finalizado", type: "NDA" },
    { id: "003", name: "Acordo de Confidencialidade", client: "Gamma Tech", date: "12/05/2026", status: "Aguardando Assinatura", type: "NDA" },
    { id: "004", name: "Contrato de M&A - Projeto Fênix", client: "Omega Group", date: "10/05/2026", status: "Draft", type: "M&A" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Comando Central</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Bem-vindo de volta, Arquiteto. O arsenal está pronto.</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black tracking-widest rounded-none px-8 py-6 group transition-all duration-500 border-none shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-95" 
          render={<Link href="/editor" />} 
          nativeButton={false}
        >
          <PlusCircle size={20} className="mr-3 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          NOVO CONTRATO
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{stat.title}</CardTitle>
              <stat.icon size={16} className={stat.color} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                <ArrowUpRight size={10} /> {stat.trend} este mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Contracts Table */}
        <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Contratos Recentes</CardTitle>
            <Link href="/contracts" className="text-xs text-orange-500 hover:underline font-bold flex items-center">
              Ver todos <ChevronRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Contrato</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Cliente</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentContracts.map((contract) => (
                  <TableRow key={contract.id} className="border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                    <TableCell className="font-medium text-xs">
                      <div className="flex flex-col">
                        <span>{contract.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono italic">{contract.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">{contract.client}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "rounded-none text-[10px] uppercase font-bold px-2 py-0",
                        contract.status === "Finalizado" ? "border-emerald-500 text-emerald-500" :
                        contract.status === "Em Revisão" ? "border-orange-500 text-orange-500" :
                        "border-zinc-400 text-zinc-400"
                      )}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 text-right font-mono">{contract.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <Card className="bg-zinc-900 text-white border-none rounded-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <PlusCircle size={16} className="text-orange-500 animate-spin-slow" /> 
              Insights de Lilith
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 border-l-2 border-orange-500 pl-4 py-1">
              <p className="text-[11px] font-bold text-orange-500 uppercase tracking-tighter">Oportunidade Detectada</p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                O contrato "Projeto Fênix" possui 3 cláusulas de rescisão que podem ser otimizadas para favorecer o seu lado em até 15%.
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-purple-500 pl-4 py-1">
              <p className="text-[11px] font-bold text-purple-500 uppercase tracking-tighter">Análise de Mercado</p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Acordos de NDA para empresas de tecnologia estão exigindo períodos de 5 anos em 80% dos novos casos.
              </p>
            </div>
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none text-xs font-bold transition-all">
              EXECUTAR AUDITORIA COMPLETA
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

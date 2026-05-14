"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Search, 
  PlusCircle, 
  FileText, 
  ShieldCheck, 
  Scale, 
  Briefcase, 
  Building2,
  Lock,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ArsenalPage() {
  const categories = [
    { name: "Cível", icon: Scale, count: 12 },
    { name: "Societário", icon: Building2, count: 8 },
    { name: "Trabalhista", icon: Briefcase, count: 15 },
    { name: "Sigilo", icon: Lock, count: 5 },
    { name: "Contratos de Elite", icon: Sparkles, count: 3 },
  ];

  const templates = [
    { title: "NDA Inviolável", type: "Sigilo", desc: "Proteção máxima para informações confidenciais com cláusulas de multa agressivas." },
    { title: "Contrato Social - Holding", type: "Societário", desc: "Estrutura otimizada para gestão patrimonial e sucessória." },
    { title: "Prestação de Serviço High-End", type: "Cível", desc: "Ideal para consultorias e serviços especializados de alto valor." },
    { title: "Acordo de Mútuo Conversível", type: "Elite", desc: "Padrão Vale do Silício adaptado para legislação brasileira." },
    { title: "Termo de Rescisão Blindado", type: "Trabalhista", desc: "Minimiza riscos de litígios futuros em desligamentos complexos." },
    { title: "Contrato de Parceria Comercial", type: "Cível", desc: "Regras claras para colaborações estratégicas e divisão de lucros." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <Zap size={32} className="text-orange-500 fill-orange-500" />
            Arsenal de Modelos
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Modelos forjados pela elite jurídica para execução imediata.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar modelo..." 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat, i) => (
          <Card key={i} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none hover:border-orange-500 transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <cat.icon size={24} className="text-zinc-400 group-hover:text-orange-500 transition-colors" />
              <div className="text-[10px] font-black uppercase tracking-tighter">{cat.name}</div>
              <div className="text-[9px] text-zinc-500">{cat.count} MODELOS</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl, i) => (
          <Card key={i} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none overflow-hidden group hover:shadow-xl transition-all relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-orange-500 transition-colors" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="rounded-none text-[9px] uppercase font-black border-zinc-200 dark:border-zinc-800">
                  {tpl.type}
                </Badge>
                <div className="p-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:text-orange-500 transition-colors">
                   <PlusCircle size={14} />
                </div>
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-tight mt-4 group-hover:text-orange-500 transition-colors">{tpl.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed line-clamp-2 mt-2">{tpl.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex gap-2">
              <Button variant="outline" className="flex-1 h-9 rounded-none text-[10px] font-black uppercase border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-950">
                PREVISUALIZAR
              </Button>
              <Button className="flex-1 h-9 rounded-none bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase" render={<Link href="/editor" />} nativeButton={false}>
                USAR AGORA
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Alert */}
      <div className="bg-zinc-900 text-white p-8 rounded-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="flex items-center gap-2 text-orange-500 justify-center md:justify-start">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Certificação ExtraJus</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Não encontrou o que precisava?</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Nossa equipe de especialistas pode forjar um modelo customizado para sua operação em menos de 24 horas. 
              Mantenha o controle absoluto da sua estratégia jurídica.
            </p>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-black rounded-none px-12 py-8 transition-all shrink-0">
            SOLICITAR FORJA CUSTOMIZADA
          </Button>
        </div>
      </div>
    </div>
  );
}

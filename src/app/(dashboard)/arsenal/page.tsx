"use client"

import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  ArrowRight,
  Command,
  LayoutGrid,
  Filter
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200/50 dark:border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-0">Modelos Forjados</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic">Master Library</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Arsenal Jurídico</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Acesso imediato a documentos de alta performance, estruturados para proteção total de ativos e operações complexas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Pesquisar no arsenal..." 
              className="w-full bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all outline-none shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30 group-focus-within:opacity-0 transition-opacity">
              <Command size={10} />
              <span className="text-[10px] font-bold">F</span>
            </div>
          </div>
          <Button variant="outline" className="h-10 px-3 border-zinc-200/50 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {categories.map((cat, i) => (
          <button key={i} className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-full hover:border-orange-500/50 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-all whitespace-nowrap shrink-0 group">
            <cat.icon size={14} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
            <span className="text-[12px] font-bold tracking-tight">{cat.name}</span>
            <span className="text-[10px] text-zinc-400 font-mono ml-1">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl, i) => (
          <Card key={i} className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-xl overflow-hidden group hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-zinc-100 dark:bg-white/5 group-hover:bg-orange-500/50 transition-colors" />
            
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-zinc-200 dark:border-white/10 text-zinc-500 group-hover:border-orange-500/30 group-hover:text-orange-500 transition-colors">
                  {tpl.type}
                </Badge>
                <button className="p-1.5 text-zinc-400 hover:text-orange-500 transition-colors">
                   <PlusCircle size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-bold tracking-tight group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{tpl.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">{tpl.desc}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex gap-2">
                <Button variant="ghost" className="flex-1 h-9 rounded-lg text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                  Previsualizar
                </Button>
                <Button 
                  className="flex-1 h-9 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-[11px] font-bold shadow-lg shadow-black/10 dark:shadow-white/5" 
                >
                  <Link href="/editor" className="flex items-center justify-center gap-1.5">
                    Usar Agora <ArrowRight size={12} />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured / Custom Forge Section */}
      <div className="bg-zinc-950 dark:bg-black border border-zinc-800 rounded-2xl p-10 relative overflow-hidden group shadow-2xl mt-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-orange-600/10 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -ml-32 -mb-32 group-hover:bg-blue-600/10 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Forja Customizada</span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white italic">Precisa de um Documento sob Medida?</h2>
              <p className="text-[14px] text-zinc-400 leading-relaxed max-w-xl">
                Nossos arquitetos jurídicos estão prontos para forjar modelos exclusivos para sua operação. 
                Documentos blindados, otimizados para sua jurisdição e focados em controle absoluto. 
                <span className="text-zinc-200 block mt-2 font-medium">Entrega em menos de 24 horas.</span>
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">24h</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Prazo Máximo</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">100%</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Garantia de Blindagem</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">+500</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Modelos Forjados</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <Button size="lg" className="w-full lg:w-auto h-14 bg-white text-black hover:bg-zinc-200 font-bold px-10 rounded-xl shadow-2xl transition-all active:scale-[0.98] flex items-center gap-2 group">
              Solicitar Forja Customizada
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

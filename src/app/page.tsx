"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Layers, 
  FileText, 
  Users, 
  Sparkles,
  ArrowRight,
  Gavel,
  History,
  Network,
  Brain,
  CheckCircle2,
  Lock,
  Activity,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { BrandSVG } from "@/components/brand-svg";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Dynamic import for the graph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function Home() {
  const graphData = useMemo(() => {
    return { 
      nodes: [
        { id: "core", name: "CENTRAL DE COMANDO", val: 30, group: "core", color: "#f97316" },
        { id: "p1", name: "Dr. Victor (M&A)", val: 18, group: "pro", color: "#60a5fa" },
        { id: "p2", name: "Dra. Elena (Tax)", val: 16, group: "pro", color: "#60a5fa" },
        { id: "p3", name: "Marcus (Risk)", val: 14, group: "pro", color: "#60a5fa" },
        { id: "o1", name: "Fusão Giga", val: 22, group: "opportunity", color: "#fbbf24" },
        { id: "o2", name: "IPO Tech", val: 20, group: "opportunity", color: "#fbbf24" },
        { id: "ct1", name: "Holding Imperial", val: 10, group: "contract", color: "#a855f7" },
      ], 
      links: [
        { source: "core", target: "p1" },
        { source: "core", target: "p2" },
        { source: "core", target: "p3" },
        { source: "p1", target: "o1" },
        { source: "p2", target: "o1" },
        { source: "p3", target: "o2" },
        { source: "o1", target: "ct1" },
        { source: "p1", target: "p2" },
      ] 
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 selection:bg-orange-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 p-3 px-6 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1.5 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <BrandSVG className="w-full h-full" />
            </div>
            <span className="text-xl font-black tracking-[-0.04em] uppercase text-zinc-900 dark:text-white">ExtraJus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            <a href="#recursos" className="hover:text-orange-500 transition-colors">Recursos</a>
            <a href="#sindicato" className="hover:text-orange-500 transition-colors">O Sindicato</a>
            <a href="#pipeline" className="hover:text-orange-500 transition-colors">Execução</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-black rounded-2xl px-8 py-5 text-[11px] uppercase tracking-widest shadow-lg shadow-black/10 dark:shadow-white/5 transition-all active:scale-95">
                ACESSAR O IMPÉRIO
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 text-orange-600 dark:text-orange-500 text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-zinc-200 dark:border-white/10 shadow-inner">
            <Activity size={14} className="animate-pulse" /> Operação Lilith Ativa
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-8 text-zinc-900 dark:text-white">
            ARQUITETURA <br /> <span className="italic text-orange-500">DE PODER.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            O Google Docs para a elite jurídica. Redija, negocie e assine contratos através de uma <span className="text-zinc-900 dark:text-white font-bold">rede neural de inteligência</span> e um arsenal de guerra.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest px-12 py-7 rounded-2xl shadow-xl shadow-orange-600/20 group transition-all">
                FORJAR MEU IMPÉRIO <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/editor">
              <Button variant="outline" size="lg" className="border-zinc-200 dark:border-white/5 bg-white dark:bg-black/50 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-widest px-12 py-7 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                DEMONSTRAÇÃO TÉCNICA
              </Button>
            </Link>
          </div>

          {/* Platform Mockup */}
          <div className="relative max-w-4xl mx-auto group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-[32px] blur opacity-10 group-hover:opacity-30 transition duration-1000" />
            <div className="relative bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden aspect-[16/8] flex scale-95 group-hover:scale-100 transition-transform duration-700">
               <div className="w-48 border-r border-zinc-100 dark:border-white/5 hidden md:block bg-zinc-50/50 dark:bg-zinc-900/50 p-4 text-left">
                  <div className="space-y-4">
                    <div className="h-2 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="space-y-2 pt-4">
                       <div className="h-6 w-full bg-orange-500/10 border border-orange-500/20 rounded-lg" />
                       <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                       <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
               </div>
               <div className="flex-1 p-8 text-left relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center font-bold text-orange-500 text-xs">01</div>
                       <div className="h-4 w-1/3 bg-zinc-900 dark:bg-white rounded" />
                    </div>
                    <div className="pl-11 space-y-2">
                       <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                       <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                       <div className="h-2 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 bg-white dark:bg-zinc-900 border border-orange-500/30 shadow-2xl p-3 rounded-xl flex items-center gap-3 animate-bounce">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <Cpu size={16} />
                    </div>
                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Audit Active</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arsenal Section */}
      <section id="recursos" className="py-24 px-6 bg-zinc-50/50 dark:bg-[#050505]/50 border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">O ARSENAL TÉCNICO</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
              Recursos construídos para eficiência brutal e precisão cirúrgica na redação de documentos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Layers className="text-orange-500" />} title="Editor Hierárquico" description="Numeração dinâmica automática. Arraste e solte cláusulas sem perder a ordem jurídica." />
            <FeatureCard icon={<Sparkles className="text-orange-500" />} title="IA de Redação" description="Gere cláusulas complexas a partir de comandos simples via Lilith AI." />
            <FeatureCard icon={<ShieldCheck className="text-orange-500" />} title="Auditoria de Risco" description="Análise em tempo real de termos perigosos ou ambíguos." />
            <FeatureCard icon={<Users className="text-orange-500" />} title="Colaboração de Guerra" description="Trabalhe em conjunto com sua equipe em tempo real com auditoria imutável." />
            <FeatureCard icon={<History className="text-orange-500" />} title="Versionamento Visual" description="Compare alterações linha por linha entre versões dos seus contratos." />
            <FeatureCard icon={<Cpu className="text-orange-500" />} title="Automação de Variáveis" description="Sincronize dados do cliente em todos os documentos instantaneamente." />
          </div>
        </div>
      </section>

      {/* Syndicate Section */}
      <section id="sindicato" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5 px-4 py-1 font-black text-[10px] uppercase tracking-widest">A Nova Rede</Badge>
            <h2 className="text-5xl font-bold tracking-tight leading-tight">O SINDICATO: <br /> <span className="text-zinc-500 dark:text-zinc-400">Networking Neural.</span></h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Mapeie mentes e oportunidades. O ExtraJus conecta profissionais de elite em um grafo interativo estilo Obsidian.
            </p>
          </div>
          <div className="relative aspect-square scale-90 lg:scale-100">
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-purple-500/5 to-blue-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
             <div className="relative h-full w-full bg-white/40 dark:bg-[#0c0c0e]/80 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/5 rounded-[48px] overflow-hidden shadow-2xl flex items-center justify-center">
                <ForceGraph2D
                  graphData={graphData}
                  width={500}
                  height={500}
                  backgroundColor="transparent"
                  nodeRelSize={6}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.005}
                  linkColor={() => "rgba(255, 255, 255, 0.1)"}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
                    const label = node.name;
                    const fontSize = 14 / globalScale;
                    ctx.font = `${fontSize}px Inter`;
                    
                    // Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val / 2.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    
                    // Glow
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 15 / globalScale;

                    // Label
                    if (globalScale > 1.5) {
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                      ctx.fillText(label, node.x, node.y + (node.val / 2.5) + 8);
                    }
                  }}
                />

                {/* Floating Status Badge */}
                <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 z-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Neural Link Active</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Signature Pipeline */}
      <section id="pipeline" className="py-32 px-6 bg-zinc-50 dark:bg-[#050505]/50 border-y border-zinc-200 dark:border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="relative order-2 lg:order-1">
              <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-white/5 rounded-[40px] p-10 shadow-2xl space-y-8 relative group">
                 <div className="relative my-10">
                   <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-zinc-200 dark:border-zinc-800 opacity-50" />
                   </div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                     <span className="bg-white dark:bg-[#050505] px-6 text-zinc-400">Ou use sua identidade digital</span>
                   </div>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fluxo de Assinatura</span>
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">Proteção Ativa</Badge>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 opacity-40">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                          <span className="text-sm font-bold">Draft Aprovado</span>
                       </div>
                       <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/10 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10">
                          <Fingerprint size={24} className="text-emerald-500 animate-pulse" />
                          <div>
                             <p className="text-sm font-bold">Aguardando Biometria</p>
                             <p className="text-[10px] text-zinc-500">Dr. Victor M&A</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           <div className="space-y-8 order-1 lg:order-2">
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-4 py-1 font-black text-[10px] uppercase tracking-widest">Soberania Digital</Badge>
              <h2 className="text-5xl font-bold tracking-tight leading-tight">ASSINATURAS: <br /> <span className="text-zinc-500 dark:text-zinc-400">Incontestabilidade.</span></h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Nossa engine de assinatura integra reconhecimento facial e registro blockchain.
              </p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-20 border-b border-zinc-100 dark:border-white/5">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-1.5">
                <BrandSVG className="w-8 h-8" />
                <span className="text-2xl font-black tracking-[-0.08em] uppercase text-zinc-900 dark:text-white">ExtraJus</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
                O núcleo de inteligência para operações jurídicas de alta complexidade.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Status: Online
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Navegação</h4>
              <ul className="space-y-4 text-xs font-bold text-zinc-500">
                <li><a href="#recursos">Arsenal</a></li>
                <li><a href="#sindicato">O Sindicato</a></li>
                <li><a href="#pipeline">Execução</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
            <span>System_Lilith // Core_V2.0 // © 2026 Império do Cadelo</span>
            <div className="flex items-center gap-6">
               <a href="#">Twitter</a>
               <a href="#">LinkedIn</a>
               <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-white dark:bg-[#0c0c0e] border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500 group shadow-sm hover:shadow-2xl hover:shadow-orange-500/5">
      <CardHeader className="p-8">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-all duration-500 text-zinc-500 dark:text-zinc-400">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold tracking-tight mb-3">{title}</CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

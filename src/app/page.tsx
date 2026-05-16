"use client"

import { Button } from "@/components/ui/button";
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
  Fingerprint,
  ChevronRight,
  Terminal,
  MousePointer2,
  Search,
  Database
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Dynamic import for the graph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const graphData = useMemo(() => {
    return { 
      nodes: [
        { id: "core", name: "LILITH CORE", val: 30, group: "core", color: "#f97316" },
        { id: "p1", name: "Draft A-1", val: 15, group: "pro", color: "#60a5fa" },
        { id: "p2", name: "Draft B-2", val: 15, group: "pro", color: "#60a5fa" },
        { id: "p3", name: "Protocol X", val: 15, group: "pro", color: "#60a5fa" },
        { id: "o1", name: "Imperial Merger", val: 20, group: "opportunity", color: "#fbbf24" },
        { id: "o2", name: "Tech IPO", val: 18, group: "opportunity", color: "#fbbf24" },
      ], 
      links: [
        { source: "core", target: "p1" },
        { source: "core", target: "p2" },
        { source: "core", target: "p3" },
        { source: "p1", target: "o1" },
        { source: "p2", target: "o1" },
        { source: "p3", target: "o2" },
      ] 
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#000] text-zinc-400 selection:bg-orange-500/30 font-sans overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "translate-y-0" : "translate-y-2"
      )}>
        <div className={cn(
          "max-w-5xl mx-auto flex justify-between items-center transition-all duration-300 p-2 rounded-full border",
          scrolled 
            ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]" 
            : "bg-transparent border-transparent"
        )}>
          <div className="flex items-center gap-6 pl-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-sm font-bold tracking-tight text-white uppercase italic">ExtraJus</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[11px] font-medium uppercase tracking-wider">
              <a href="#arsenal" className="hover:text-white transition-colors">Arsenal</a>
              <a href="#sindicato" className="hover:text-white transition-colors">Sindicato</a>
              <a href="#tecnologia" className="hover:text-white transition-colors">Engine</a>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-8 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Acessar Core
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-500 text-[10px] font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Terminal size={12} /> Lilith Engine v2.0 Online
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A nova era da <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Engenharia Jurídica.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            O sistema operacional definitivo para a elite. Redija, assine e monitore contratos através de uma <span className="text-white">infraestrutura de alto desempenho.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-10 h-14 text-sm font-bold uppercase tracking-wider group shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Entrar no War Room <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/editor">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full px-10 h-14 text-sm font-bold uppercase tracking-wider">
                Forjar Contrato
              </Button>
            </Link>
          </div>

          {/* Product Showcase */}
          <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-1000">
            <div className="absolute -inset-1 bg-gradient-to-b from-orange-500/20 to-transparent rounded-[2rem] blur-2xl opacity-50" />
            <div className="relative bg-zinc-900/50 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden aspect-[16/9] flex backdrop-blur-sm">
               {/* Left Sidebar Mockup */}
               <div className="w-64 border-r border-white/5 hidden md:block bg-black/40 p-6 text-left">
                  <div className="flex items-center gap-2 mb-8 opacity-40">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="h-2 w-1/2 bg-white/10 rounded" />
                      <div className="h-8 w-full bg-white/5 border border-white/10 rounded-lg" />
                      <div className="h-8 w-full bg-transparent border border-white/5 rounded-lg" />
                      <div className="h-8 w-full bg-transparent border border-white/5 rounded-lg" />
                    </div>
                    <div className="pt-4 space-y-3">
                       <div className="h-2 w-1/3 bg-white/10 rounded" />
                       <div className="h-6 w-full bg-white/5 rounded" />
                       <div className="h-6 w-3/4 bg-white/5 rounded" />
                    </div>
                  </div>
               </div>
               {/* Editor Mockup */}
               <div className="flex-1 p-12 text-left relative overflow-hidden bg-black/20">
                  <div className="max-w-2xl space-y-8 opacity-80">
                    <div className="space-y-4">
                       <div className="h-10 w-3/4 bg-white/10 rounded-lg" />
                       <div className="h-4 w-full bg-white/5 rounded-full" />
                       <div className="h-4 w-full bg-white/5 rounded-full" />
                       <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                       <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded text-[9px] font-bold text-orange-500 uppercase tracking-widest">
                          Lilith AI: Blindagem Ativa
                       </div>
                    </div>
                    <div className="space-y-4 pt-4">
                       <div className="h-6 w-1/2 bg-white/10 rounded-lg" />
                       <div className="h-4 w-full bg-white/5 rounded-full" />
                       <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-1/4 right-12 bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl animate-float">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          <MousePointer2 size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Dr. Victor</p>
                          <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Editando Cláusula 12.4</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="arsenal" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight italic uppercase">O Arsenal do Arquiteto</h2>
              <p className="text-zinc-500 max-w-sm">Módulos de elite construídos para dominação jurídica absoluta.</p>
            </div>
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">
              Mapeamento de Recursos v2
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* O Cânone (Editor) */}
            <BentoCard 
              className="md:col-span-8 h-[400px]"
              title="O Cânone"
              subtitle="Editor Notional & Colaborativo"
              description="Motor de redação baseado em TipTap e Yjs. Sincronização em tempo real com cursores de elite e LegalNodes hierárquicos."
              icon={<Layers className="w-5 h-5 text-orange-500" />}
            >
              <div className="mt-8 relative h-full w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-[10px] text-zinc-600">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span>LILITH_BUFFER_INIT...</span>
                 </div>
                 <div className="space-y-2 opacity-50">
                    <p className="text-white">1. OBJETO DO CONTRATO</p>
                    <p>   1.1. A CONTRATADA se compromete a...</p>
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <p className="text-white">2. VALORES E CRÉDITOS</p>
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <p className="flex items-center gap-1">   2.1. O pagamento será feito via [ <span className="text-orange-500">variable_01</span> ]</p>
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 h-10 bg-white/5 border border-white/10 rounded flex items-center px-4 gap-2">
                    <span className="text-orange-500">/</span>
                    <span className="text-zinc-400">Inserir Cláusula de Sigilo...</span>
                 </div>
              </div>
            </BentoCard>

            {/* War Room (Dashboard) */}
            <BentoCard 
              className="md:col-span-4 h-[400px]"
              title="War Room"
              subtitle="Comando Central"
              description="Monitoramento em tempo real de contratos ativos e insights neurais da Lilith."
              icon={<Activity className="w-5 h-5 text-blue-500" />}
            >
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                   <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Contratos Ativos</p>
                   <p className="text-3xl font-black text-white">42</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                   <p className="text-[10px] uppercase font-bold text-orange-500 mb-1">Créditos de IA</p>
                   <p className="text-3xl font-black text-white">8.4k</p>
                </div>
                <div className="flex items-center justify-between px-2 pt-2">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold text-zinc-600 italic">Sync Active</span>
                   </div>
                </div>
              </div>
            </BentoCard>

            {/* Lilith AI */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Lilith AI"
              subtitle="Alquimia Jurídica"
              description="Geração contextual e blindagem estratégica de termos ambíguos."
              icon={<Sparkles className="w-5 h-5 text-purple-500" />}
            >
              <div className="mt-6 flex flex-col gap-2">
                 <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] italic">
                   "Redigir termo de confidencialidade agressivo para M&A."
                 </div>
                 <div className="self-end p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] text-white">
                   Processando Blindagem Estratégica...
                 </div>
              </div>
            </BentoCard>

            {/* Fila de Execução */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Execução"
              subtitle="Pipeline de Assinaturas"
              description="Assinaturas incontestáveis com registro blockchain e biometria."
              icon={<Fingerprint className="w-5 h-5 text-emerald-500" />}
            >
              <div className="mt-8 relative px-4">
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 opacity-30">
                      <div className="w-4 h-4 rounded-full border border-zinc-600" />
                      <div className="h-2 w-24 bg-zinc-800 rounded" />
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="h-2 w-32 bg-emerald-500/20 rounded" />
                   </div>
                 </div>
                 <div className="absolute top-1/2 right-0 -translate-y-1/2 rotate-12">
                   <div className="bg-emerald-500 text-black px-2 py-1 text-[8px] font-black uppercase rounded shadow-lg">SIGNED</div>
                 </div>
              </div>
            </BentoCard>

            {/* Arsenal (Templates) */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Arsenal"
              subtitle="Templates Soberanos"
              description="Modelos de alta performance forjados pela inteligência central."
              icon={<ShieldCheck className="w-5 h-5 text-zinc-400" />}
            >
               <div className="mt-8 grid grid-cols-2 gap-2">
                 <div className="aspect-square bg-white/5 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-white/10 transition-colors">
                    <FileText size={20} className="text-zinc-600" />
                    <span className="text-[8px] uppercase font-bold text-zinc-500">Cível</span>
                 </div>
                 <div className="aspect-square bg-white/5 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-white/10 transition-colors">
                    <Gavel size={20} className="text-zinc-600" />
                    <span className="text-[8px] uppercase font-bold text-zinc-500">Elite</span>
                 </div>
               </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Neural Sindicato Section */}
      <section id="sindicato" className="py-32 px-6 relative overflow-hidden bg-[#030303]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-500 text-[10px] font-bold tracking-widest uppercase">
              O Sindicato
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight uppercase italic">Networking <br /> <span className="text-zinc-500">Neural de Elite.</span></h2>
            <p className="text-lg text-zinc-500 leading-relaxed font-medium">
              Mapeie mentes e oportunidades em tempo real. O ExtraJus conecta profissionais em um grafo interativo estilo <span className="text-white">Obsidian Engineering.</span>
            </p>
            <Link href="/dashboard">
              <Button variant="link" className="text-white p-0 h-auto font-bold uppercase text-xs tracking-widest hover:opacity-70 group">
                Explorar Conexões <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="relative aspect-square pointer-events-none">
             <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[120px]" />
             <div className="relative h-full w-full bg-black border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                <ForceGraph2D
                  graphData={graphData}
                  width={500}
                  height={500}
                  backgroundColor="#000000"
                  nodeRelSize={6}
                  enableNodeDrag={false}
                  enableZoomInteraction={false}
                  enablePanInteraction={false}
                  linkDirectionalParticles={1}
                  linkDirectionalParticleSpeed={0.005}
                  linkColor={() => "rgba(255, 255, 255, 0.05)"}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter`;
                    
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    
                    if (globalScale > 2) {
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                      ctx.fillText(label, node.x, node.y + 10);
                    }
                  }}
                />
                <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Neural Link v2.0</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Section 1: Calibration */}
      <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
               <div className="bg-zinc-900/40 border border-white/10 rounded-[2.5rem] p-10 space-y-10 backdrop-blur-xl">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-orange-500">
                        <span>Agressividade Jurídica</span>
                        <span>94%</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-purple-500">
                        <span>Criatividade IA</span>
                        <span>Precisa</span>
                     </div>
                     <div className="flex gap-2">
                        {["Precisa", "Equilibrada", "Inovadora"].map((mode) => (
                          <div key={mode} className={cn(
                            "flex-1 h-10 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-tighter border transition-all",
                            mode === "Precisa" ? "bg-purple-500/20 border-purple-500 text-purple-500" : "bg-white/5 border-white/10 text-zinc-600"
                          )}>
                            {mode}
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 italic text-[11px]">
                        "Lilith, reescreva a cláusula de rescisão para ser unilateral e incontestável."
                     </div>
                  </div>
               </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-500 text-[10px] font-bold tracking-widest uppercase">
                  Sistemas Centrais
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight uppercase italic">Calibração <br /> <span className="text-zinc-500">Sob Medida.</span></h2>
               <p className="text-lg text-zinc-500 leading-relaxed font-medium">
                  Ajuste fino da sua inteligência jurídica. Do modo diplomático à agressividade absoluta, você dita as regras da negociação.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tech Infrastructure */}
      <section id="tecnologia" className="py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold text-white tracking-tight uppercase italic mb-4">Engine de Sobrevivência</h2>
          <p className="text-zinc-500 max-w-xl mx-auto font-medium">
            Construído sobre uma stack indestrutível para garantir que seus dados nunca desapareçam.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { title: "Real-time Sync", icon: <Zap />, desc: "Supabase Broadcast + Yjs handshake." },
             { title: "AES-256 Auth", icon: <Lock />, desc: "Criptografia de nível militar em repouso." },
             { title: "Binary State", icon: <Database />, desc: "Persistência em hexadecimal otimizada." },
             { title: "LegalNodes", icon: <Layers />, desc: "Hierarquia jurídica auto-gerenciada." }
           ].map((tech, i) => (
             <div key={i} className="p-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 mb-6 group-hover:text-white transition-colors">
                  {tech.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest italic">{tech.title}</h3>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{tech.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Section 3: Pricing */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: "Iniciante", price: "0", feat: ["5 Contratos", "IA Básica", "Sindicato"] },
             { name: "Soberano", price: "199", feat: ["Ilimitado", "Lilith AI Pro", "Blockchain Seals"], highlight: true },
             { name: "Império", price: "Custom", feat: ["Full Ops", "Audit Trail Imutável", "Suporte 24/7 Lilith"] }
           ].map((plan, i) => (
             <div key={i} className={cn(
               "p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500",
               plan.highlight 
                 ? "bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.1)] scale-105 z-10" 
                 : "bg-zinc-900/20 border-white/5 text-zinc-500 hover:border-white/20"
             )}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">{plan.name}</p>
                <div className="mb-10">
                   <span className="text-4xl font-black tracking-tighter">R$ {plan.price}</span>
                   {plan.price !== "Custom" && <span className="text-xs font-bold opacity-50">/mês</span>}
                </div>
                <div className="space-y-4 mb-10 flex-1">
                   {plan.feat.map((f, j) => (
                     <div key={j} className="flex items-center gap-3 text-[11px] font-bold">
                        <CheckCircle2 size={14} className={plan.highlight ? "text-orange-500" : "text-zinc-800"} />
                        {f}
                     </div>
                   ))}
                </div>
                <Button className={cn(
                  "w-full rounded-full font-black uppercase tracking-widest h-12 text-[10px]",
                  plan.highlight ? "bg-black text-white" : "bg-white/5 text-white hover:bg-white/10"
                )}>
                   Ascender Agora
                </Button>
             </div>
           ))}
        </div>
      </section>

      {/* Section 4: FAQ */}
      <section className="py-32 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic mb-2">Protocolos de Dúvida</h2>
            <p className="text-zinc-500 text-sm font-medium">Esclarecimentos técnicos e misticismo operacional.</p>
          </div>
          <div className="space-y-4">
             {[
               { q: "O que é a Lilith Engine?", a: "É o núcleo de IA treinado especificamente para a agressividade jurídica e blindagem estratégica de contratos de alta complexidade." },
               { q: "Meus dados estão seguros?", a: "Utilizamos criptografia AES-256 e hashes em blockchain para cada assinatura, garantindo imutabilidade absoluta." },
               { q: "Posso colaborar em tempo real?", a: "Sim. Nossa infraestrutura permite que múltiplos signatários e advogados editem simultaneamente com visibilidade total." }
             ].map((item, i) => (
               <div key={i} className="p-6 bg-zinc-900/10 border border-white/5 rounded-2xl group hover:border-white/10 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="text-sm font-bold text-white uppercase italic tracking-wider">{item.q}</h4>
                     <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.a}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-32 pb-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-20">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white uppercase italic">ExtraJus</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm font-medium">
                O núcleo de inteligência definitiva para operações jurídicas de alto impacto. Projetado para quem não aceita a mediocridade.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Recursos</h4>
              <ul className="space-y-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                <li><a href="#" className="hover:text-white transition-colors">O Cânone</a></li>
                <li><a href="#" className="hover:text-white transition-colors">War Room</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lilith AI</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Infra</h4>
              <ul className="space-y-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Supabase</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] italic">
            <span>Core_v2.0 // © 2026 Império do Cadelo</span>
            <div className="flex items-center gap-6">
               <span className="text-zinc-800">Designed for Supremacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ 
  children, 
  title, 
  subtitle, 
  description, 
  icon, 
  className 
}: { 
  children?: React.ReactNode, 
  title: string, 
  subtitle: string, 
  description: string, 
  icon: React.ReactNode, 
  className?: string 
}) {
  return (
    <div className={cn(
      "group relative bg-zinc-900/20 border border-white/5 rounded-3xl p-8 flex flex-col overflow-hidden hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-500",
      className
    )}>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</span>
            </div>
            <p className="text-lg font-bold text-white tracking-tight">{subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[240px]">
          {description}
        </p>
        <div className="flex-1">
          {children}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 blur-[80px] rounded-full group-hover:bg-white/10 transition-colors duration-500" />
    </div>
  );
}

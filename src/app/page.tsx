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
import { Logo } from "@/components/ui/logo";

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
        { id: "core", name: "EXTRAJUS CORE", val: 30, group: "core", color: "hsl(var(--primary))" },
        { id: "p1", name: "Contrato A-1", val: 15, group: "pro", color: "hsl(var(--primary) / 0.7)" },
        { id: "p2", name: "Draft B-2", val: 15, group: "pro", color: "hsl(var(--primary) / 0.7)" },
        { id: "p3", name: "Protocolo X", val: 15, group: "pro", color: "hsl(var(--primary) / 0.7)" },
        { id: "o1", name: "Fusão Corporativa", val: 20, group: "opportunity", color: "hsl(var(--primary) / 0.4)" },
        { id: "o2", name: "Tech IPO", val: 18, group: "opportunity", color: "hsl(var(--primary) / 0.4)" },
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
    <div className="min-h-screen bg-background text-muted-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_50%)] opacity-[0.05]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "translate-y-0" : "translate-y-2"
      )}>
        <div className={cn(
          "max-w-5xl mx-auto flex justify-between items-center transition-all duration-300 p-2 rounded-full border",
          scrolled 
            ? "bg-background/60 backdrop-blur-xl border-border shadow-lg" 
            : "bg-transparent border-transparent"
        )}>
          <div className="flex items-center gap-6 pl-4">
            <Link href="/" className="flex items-center group">
              <Logo iconSize={36} showText={true} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[11px] font-medium uppercase tracking-wider">
              <a href="#recursos" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Recursos
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#rede" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Rede Profissional
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#tecnologia" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Tecnologia
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 h-8 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Terminal size={12} /> ExtraJus Engine v2.0 — Operação Cirúrgica IA Ativa
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A nova era da <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground/60">Precisão Jurídica.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            O ecossistema definitivo para advocacia de alta performance. Redija com <span className="text-foreground">Edição IA Cirúrgica</span>, audite riscos com o <span className="text-foreground">Radar Analítico</span> e rastreie cláusulas pelo <span className="text-foreground">Mapa do Instrumento</span> em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-14 text-sm font-bold uppercase tracking-wider group shadow-xl">
                Acessar Painel <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/editor">
              <Button variant="outline" size="lg" className="border-border bg-background/50 hover:bg-muted text-foreground rounded-full px-10 h-14 text-sm font-bold uppercase tracking-wider">
                Iniciar Redação
              </Button>
            </Link>
          </div>

          {/* Product Showcase */}
          <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-1000">
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 to-transparent rounded-[2rem] blur-2xl opacity-50" />
            <div className="relative bg-card/50 border border-border rounded-[2rem] shadow-2xl overflow-hidden aspect-[16/9] flex backdrop-blur-sm">
               {/* Left Sidebar Mockup */}
               <div className="w-64 border-r border-border hidden md:block bg-muted/60 p-6 text-left">
                  <div className="flex items-center gap-2 mb-8 opacity-60">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="h-2 w-1/2 bg-foreground/20 rounded" />
                      <div className="h-8 w-full bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between px-3 text-[9px] font-bold text-primary uppercase">
                        <span>Contrato Ativo</span>
                        <Zap size={10} />
                      </div>
                      <div className="h-8 w-full bg-transparent border border-foreground/10 rounded-lg" />
                      <div className="h-8 w-full bg-transparent border border-foreground/10 rounded-lg" />
                    </div>
                    <div className="pt-4 space-y-3">
                       <div className="h-2 w-1/3 bg-foreground/20 rounded" />
                       <div className="h-6 w-full bg-foreground/10 rounded" />
                       <div className="h-6 w-3/4 bg-foreground/10 rounded" />
                    </div>
                  </div>
               </div>
               
               {/* Editor Mockup */}
               <div className="flex-1 p-12 text-left relative overflow-hidden bg-muted/30 flex">
                  <div className="flex-1 space-y-8 pr-6">
                    <div className="space-y-4">
                       <div className="h-10 w-3/4 bg-foreground/15 rounded-lg" />
                       <div className="h-4 w-full bg-foreground/10 rounded-full" />
                       <div className="h-4 w-full bg-foreground/10 rounded-full" />
                       <div className="h-4 w-2/3 bg-foreground/10 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="px-3 py-1 bg-primary/20 border border-primary/40 rounded text-[9px] font-bold text-primary uppercase tracking-widest">
                          Lilith AI: Auditoria Ativa
                       </div>
                    </div>
                    <div className="space-y-4 pt-2">
                       <div className="h-6 w-1/2 bg-foreground/15 rounded-lg" />
                       <div className="h-4 w-full bg-foreground/10 rounded-full" />
                    </div>
                  </div>

                  {/* Right Sidebar Mockup (Mapa do Instrumento & Auditoria) */}
                  <div className="w-56 border-l border-border bg-card/60 p-4 text-left space-y-4 hidden lg:block">
                     <div className="flex items-center justify-between border-b border-border/40 pb-2">
                       <span className="text-[8px] font-black text-muted-foreground uppercase">Radar Analítico</span>
                       <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">94%</span>
                     </div>
                     <div className="space-y-3">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Mapa do Instrumento</span>
                       <div className="relative pl-3 space-y-3 before:absolute before:left-[3px] before:top-1 before:bottom-1 before:w-[1px] before:bg-border">
                         <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                           <span>DO OBJETO</span>
                           <span className="text-[7px] text-emerald-600 font-bold">✅ OK</span>
                         </div>
                         <div className="pl-2 space-y-1">
                           <div className="h-1 w-full bg-foreground/10 rounded-full" />
                           <div className="h-1 w-5/6 bg-foreground/10 rounded-full" />
                         </div>
                         <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                           <span>DA RESCISÃO</span>
                           <span className="text-[7px] text-red-600 font-bold">⚠️ RISCO</span>
                         </div>
                       </div>
                     </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-1/3 left-1/3 bg-card border border-border p-4 rounded-2xl shadow-2xl animate-float">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <MousePointer2 size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground uppercase tracking-tighter">Edição IA Cirúrgica</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Modificando Parágrafo 3</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="recursos" className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase">Tecnologias de Redação e Auditoria</h2>
              <p className="text-muted-foreground max-w-sm">Módulos de inteligência ativa e usabilidade militar criados sob medida.</p>
            </div>
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground">
              ExtraJus Ecosystem v2
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* O Editor (Editor) */}
            <BentoCard 
              className="md:col-span-8 h-[400px]"
              title="Editor & Edição Cirúrgica"
              subtitle="O Micro-Cirurgião do seu Documento"
              description="Esqueça a IA que reconstrói contratos inteiros e quebra a formatação. Nossa Edição IA Cirúrgica reescreve e otimiza parágrafos pontuais de forma localizada e com precisão cirúrgica."
              icon={<Layers className="w-5 h-5 text-primary" />}
            >
              <div className="mt-2 relative h-full w-full overflow-hidden rounded-xl bg-muted/40 border border-border p-4 font-mono text-[10px] text-muted-foreground">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>EXTRAJUS_AI_SURGICAL_ACTIVE...</span>
                  </div>
                  <div className="space-y-2 opacity-70">
                    <p className="text-foreground">CLÁUSULA TERCEIRA - DA RESCISÃO</p>
                    <p className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 italic">
                      + [Otimização Cirúrgica IA]: Em caso de rescisão sem justa causa, o aviso prévio será de 30 dias...
                    </p>
                    <div className="h-4 w-3/4 bg-primary/5 rounded border border-primary/10" />
                    <p className="text-foreground">CLÁUSULA QUARTA - DO FORO</p>
                    <div className="h-4 w-full bg-primary/5 rounded border border-primary/10" />
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 h-10 bg-background border border-border rounded-lg shadow-sm flex items-center px-4 gap-2">
                    <span className="text-primary">✨</span>
                    <span className="text-muted-foreground">Cláusula otimizada com 100% de segurança de formatação.</span>
                 </div>
              </div>
            </BentoCard>

            <BentoCard 
              className="md:col-span-4 h-[400px]"
              title="Radar Analítico IA"
              subtitle="Detecção Real-Time de Vulnerabilidades"
              description="Escanear e mitigar riscos em tempo real. Nossa auditoria preditiva analisa termos e gera um Score de Segurança dinâmico integrado."
              icon={<Activity className="w-5 h-5 text-primary" />}
            >
              <div className="mt-2 space-y-3">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10 group/stat">
                   <p className="text-[10px] uppercase font-black text-primary/60 mb-2 tracking-widest font-sans">Score de Segurança</p>
                   <div className="flex items-baseline gap-2">
                     <p className="text-4xl font-black text-foreground tracking-tighter font-sans">94%</p>
                     <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">Excelente ✨</span>
                   </div>
                </div>
                <div className="p-5 rounded-2xl bg-muted border border-border transition-all hover:border-primary/30 group/stat">
                   <p className="text-[10px] uppercase font-black text-muted-foreground mb-2 tracking-widest font-sans">Riscos Identificados</p>
                   <div className="flex items-baseline gap-2">
                     <p className="text-4xl font-black text-foreground tracking-tighter font-sans">02</p>
                     <span className="text-[10px] font-bold text-red-500">CORRIGIDOS</span>
                   </div>
                </div>
              </div>
            </BentoCard>

            {/* Mapa do Instrumento */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Mapa do Instrumento"
              subtitle="Navegação em Árvore Inteligente"
              description="Acompanhe a estrutura do contrato por uma linha guia de blueprint que lista parágrafos e mapeia riscos de forma dinâmica e interativa."
              icon={<Brain className="w-5 h-5 text-primary" />}
            >
              <div className="mt-6 pl-4 space-y-2 border-l-2 border-primary/20">
                 <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                   <span>1. OBJETO CONTRATUAL</span>
                   <span className="text-[7.5px] font-black text-emerald-600 uppercase">✅ OK</span>
                 </div>
                 <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between pl-3 italic text-muted-foreground/60">
                   <span>- Parágrafo 1.1: Prestação de...</span>
                 </div>
                 <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                   <span>2. FORO ELEITO</span>
                   <span className="text-[7.5px] font-black text-emerald-600 uppercase">✅ OK</span>
                 </div>
              </div>
            </BentoCard>

            {/* Sincronização em Tempo Real */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Sincronia Sem F5"
              subtitle="Zero Latência na Biblioteca"
              description="Dual-Sync reativo. Qualquer alteração ou criação de minuta reflete instantaneamente na biblioteca lateral de todos os usuários via Supabase Realtime."
              icon={<Zap className="w-5 h-5 text-primary" />}
            >
              <div className="mt-6 relative px-4">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <div className="h-2 w-32 bg-primary/20 rounded" />
                       <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest ml-auto">Atualizado</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                       <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                       <div className="h-2 w-24 bg-muted rounded" />
                    </div>
                 </div>
                 <div className="absolute top-1/2 right-0 -translate-y-1/2 rotate-12">
                    <div className="bg-primary text-primary-foreground px-2 py-1 text-[8px] font-black uppercase rounded shadow-lg">REALTIME ACTIVE</div>
                 </div>
              </div>
            </BentoCard>

            {/* Repositório e Biblioteca */}
            <BentoCard 
              className="md:col-span-4 h-[350px]"
              title="Assinatura Criptográfica"
              subtitle="Integridade Inviolável"
              description="Assinatura digital e biometria com selo criptográfico e hash de autenticidade para blindagem jurídica absoluta."
              icon={<Fingerprint className="w-5 h-5 text-primary" />}
            >
               <div className="mt-6 grid grid-cols-2 gap-2">
                 <div className="aspect-square bg-muted border border-border rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                    <Lock size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[8px] uppercase font-bold text-muted-foreground group-hover:text-primary">AES-256</span>
                 </div>
                 <div className="aspect-square bg-muted border border-border rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                    <Fingerprint size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[8px] uppercase font-bold text-muted-foreground group-hover:text-primary">Biometria</span>
                 </div>
               </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Rede Profissional Section */}
      <section id="rede" className="py-32 px-6 relative overflow-hidden bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
              Networking
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight uppercase">Conexões <br /> <span className="text-muted-foreground">Estratégicas.</span></h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Visualize sua rede de contatos e oportunidades em tempo real através de um grafo interativo de alta precisão.
            </p>
            <Link href="/dashboard">
              <Button variant="link" className="text-primary p-0 h-auto font-bold uppercase text-xs tracking-widest hover:opacity-70 group">
                Explorar Rede <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="relative aspect-square">
             <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px]" />
             <div className="relative h-full w-full bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl flex items-center justify-center">
                <ForceGraph2D
                  graphData={graphData}
                  width={500}
                  height={500}
                  backgroundColor="transparent"
                  nodeRelSize={6}
                  enableNodeDrag={false}
                  enableZoomInteraction={false}
                  enablePanInteraction={false}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.005}
                  linkColor={() => "rgba(var(--foreground), 0.15)"}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `600 ${fontSize}px Inter`;
                    
                    // Draw node glow/shadow
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 10 / globalScale;
                    
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    
                    // Reset shadow for text
                    ctx.shadowBlur = 0;
                    
                    if (globalScale > 1.5) {
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "hsl(var(--foreground))";
                      ctx.fillText(label, node.x, node.y + 12);
                    }
                  }}
                />
                <div className="absolute top-6 left-6 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
                   <span className="text-[9px] font-bold text-foreground/70 uppercase tracking-widest">ExtraJus Neural Link</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Tecnologia Section */}
      <section id="tecnologia" className="py-32 px-6 border-t border-border bg-muted/30">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase italic mb-4">Arquitetura de Segurança</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Desenvolvido com tecnologias de ponta para garantir integridade e disponibilidade absoluta dos seus dados.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { title: "Sincronia Real", icon: <Zap />, desc: "Protocolo de broadcast via Supabase + Handshake Yjs." },
             { title: "Segurança AES", icon: <Lock />, desc: "Criptografia de ponta a ponta para todos os dados." },
             { title: "Infra Nuvem", icon: <Database />, desc: "Persistência distribuída com redundância global." },
             { title: "LegalNodes", icon: <Layers />, desc: "Hierarquia inteligente de cláusulas e dependências." }
           ].map((tech, i) => (
             <div key={i} className="p-8 bg-card border border-border rounded-[2rem] hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 transition-colors">
                  {tech.icon}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-widest">{tech.title}</h3>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{tech.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-32 pb-12 px-6 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-20">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center">
                <Logo iconSize={48} showText={true} />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm font-medium">
                A plataforma de inteligência jurídica definitiva para gestão de contratos e conexões profissionais.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">Recursos</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <li><a href="#" className="hover:text-primary transition-colors">Editor</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">ExtraJus AI</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">Plataforma</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            <span>© 2026 ExtraJus — Inteligência Jurídica Avançada</span>
            <div className="flex items-center gap-6">
               <span className="text-muted-foreground/60 italic">Tecnologia para Excelência</span>
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
      "group relative bg-card border border-border rounded-3xl p-8 flex flex-col overflow-hidden hover:bg-muted/50 hover:border-primary/20 transition-all duration-500",
      className
    )}>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col mb-2">
          <div className="flex items-center gap-2 mb-0.5">
            {icon}
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{title}</span>
          </div>
          <p className="text-lg font-bold text-foreground tracking-tight">{subtitle}</p>
        </div>
        <p className="text-[11.5px] text-muted-foreground/80 font-medium leading-relaxed max-w-xl md:max-w-2xl">
          {description}
        </p>
        <div className="flex-1 mt-1">
          {children}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors duration-500" />
    </div>
  );
}

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
  Database,
  ChevronDown,
  ChevronUp
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
        { id: "core", name: "Certificação Core", val: 30, group: "core", color: "#c5a880" },
        { id: "p1", name: "Hash MD5-Alpha", val: 15, group: "pro", color: "rgba(197, 168, 128, 0.8)" },
        { id: "p2", name: "Selo Digital", val: 15, group: "pro", color: "rgba(197, 168, 128, 0.8)" },
        { id: "p3", name: "Protocolo AES", val: 15, group: "pro", color: "rgba(197, 168, 128, 0.8)" },
        { id: "o1", name: "Validação ICP", val: 20, group: "opportunity", color: "rgba(197, 168, 128, 0.5)" },
        { id: "o2", name: "Biometria Ativa", val: 18, group: "opportunity", color: "rgba(197, 168, 128, 0.5)" },
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
            <div className="hidden md:flex items-center gap-6 text-[11px] font-medium">
              <a href="#como-funciona" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Como funciona
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#modelos" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Modelos
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#assinaturas" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Assinaturas
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#faq" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Dúvidas
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <ThemeToggle />
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-[11px] font-bold hidden sm:flex">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 h-8 text-[11px] font-bold transition-all active:scale-95 shadow-sm">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={12} className="animate-pulse" /> Seus contratos protegidos por Inteligência Artificial
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1] mb-8 text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Contratos seguros, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground/60">Sem juridiquês.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            Pare de usar modelos genéricos da internet. Crie, audite e assine contratos <span className="text-foreground">profissionais e personalizados</span> para o seu negócio em poucos minutos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link href="/register">
              <Button size="lg" className="relative h-16 px-12 rounded-full bg-primary text-primary-foreground font-black text-sm shadow-[0_10px_30px_rgba(197,168,128,0.4)] hover:shadow-[0_15px_40px_rgba(197,168,128,0.6)] transition-all duration-500 group overflow-hidden border-2 border-primary">
                <span className="relative z-10 flex items-center gap-3">
                  Criar contrato agora <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/90 to-[#e5cfa1] opacity-100" />
              </Button>
            </Link>
            <Link href="#modelos">
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-full border-border bg-background/40 hover:bg-muted/80 text-foreground font-bold text-xs transition-all duration-300 backdrop-blur-sm">
                Ver modelos prontos
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
                    <div className="h-8 w-full bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between px-3 text-[9px] font-bold text-primary">
                      <span>Contrato ativo</span>
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
                    <div className="px-3 py-1 bg-primary/20 border border-primary/40 rounded text-[9px] font-bold text-primary">
                      IA ExtraJus: Revisão em tempo real
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
                    <span className="text-[8px] font-black text-muted-foreground">Saúde do contrato</span>
                    <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">94%</span>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] font-black text-muted-foreground">Resumo do documento</span>
                    <div className="relative pl-3 space-y-3 before:absolute before:left-[3px] before:top-1 before:bottom-1 before:w-[1px] before:bg-border">
                      <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                        <span>Objeto</span>
                        <span className="text-[7px] text-emerald-600 font-bold">✅ Ok</span>
                      </div>
                      <div className="pl-2 space-y-1">
                        <div className="h-1 w-full bg-foreground/10 rounded-full" />
                        <div className="h-1 w-5/6 bg-foreground/10 rounded-full" />
                      </div>
                      <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                        <span>Rescisão</span>
                        <span className="text-[7px] text-red-600 font-bold">⚠️ Atenção</span>
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
                      <p className="text-[10px] font-bold text-foreground">Ajuste inteligente</p>
                      <p className="text-[8px] text-muted-foreground tracking-tight">Sugerindo alteração...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Models Section */}
      <section id="modelos" className="py-24 px-6 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight italic">Modelos <span className="text-muted-foreground">populares.</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">Os contratos mais procurados, já revisados e prontos para você personalizar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Prestação de Serviços", icon: <Users size={24} />, desc: "Ideal para freelancers e empresas que contratam serviços profissionais." },
              { title: "Contrato de Locação", icon: <Layers size={24} />, desc: "Residencial ou comercial com todas as garantias necessárias." },
              { title: "NDA (Confidencialidade)", icon: <ShieldCheck size={24} />, desc: "Proteja suas ideias e dados antes de reuniões importantes." },
              { title: "Contrato de Parceria", icon: <Network size={24} />, desc: "Alinhamento claro de responsabilidades e lucros entre sócios." },
              { title: "Termos de Uso & Privac.", icon: <FileText size={24} />, desc: "Essencial para sites, aplicativos e plataformas digitais." },
              { title: "Compra e Venda", icon: <Gavel size={24} />, desc: "Segurança total na transferência de bens móveis ou imóveis." }
            ].map((model, i) => (
              <div key={i} className="group p-8 bg-card border border-border rounded-3xl hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  {model.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{model.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{model.desc}</p>
                <Link href="/register">
                  <Button variant="link" className="p-0 h-auto text-primary font-bold text-[10px] group-hover:translate-x-1 transition-transform">
                    Usar este modelo <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/register">
              <Button variant="outline" className="rounded-full px-8 h-12 border-primary/20 hover:border-primary text-primary font-bold">
                Explorar todos os 150+ modelos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="como-funciona" className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter italic">Tecnologia que <br /> <span className="text-muted-foreground">Trabalha para Você.</span></h2>
              <p className="text-muted-foreground max-w-sm font-medium">Não precisa ser advogado para criar contratos perfeitos. Nossa IA cuida da parte difícil.</p>
            </div>
            <div className="text-[10px] font-bold text-primary animate-pulse pb-1">
              IA ExtraJus // Simplicidade & Segurança
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* O Editor (Editor) */}
            <BentoCard
              className="md:col-span-8 h-[400px]"
              title="Editor inteligente"
              subtitle="Escreva como se estivesse conversando"
              description="Nossa IA entende o que você precisa e sugere as melhores cláusulas automaticamente. Você mantém o controle total, mas com a ajuda de um especialista digital ao seu lado 24/7."
            >
              <div className="mt-2 relative h-full w-full overflow-hidden rounded-xl bg-muted/40 border border-border p-4 font-mono text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>IA_ExtraJus_assistente_ativo...</span>
                </div>
                <div className="space-y-2 opacity-70">
                  <p className="text-foreground">Cláusula de multa por atraso</p>
                  <p className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 italic">
                    + [Sugestão IA]: Aplicar multa de 2% ao mês sobre o valor total em caso de atraso superior a 5 dias...
                  </p>
                  <div className="h-4 w-3/4 bg-primary/5 rounded border border-primary/10" />
                  <p className="text-foreground">Foro de eleição</p>
                  <div className="h-4 w-full bg-primary/5 rounded border border-primary/10" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-10 bg-background border border-border rounded-lg shadow-sm flex items-center px-4 gap-2">
                  <span className="text-primary">✨</span>
                  <span className="text-muted-foreground">Sugerindo cláusula de proteção financeira...</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-4 h-[400px]"
              title="Radar anti-erros"
              subtitle="Dorme tranquilo enquanto a IA vigia"
              description="Nosso sistema analisa seu contrato em tempo real e avisa se houver alguma brecha, termo perigoso ou cláusula faltando. É como ter um advogado revisando cada linha que você escreve."
            >
              <div className="mt-2 space-y-3">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10 group/stat">
                  <p className="text-[10px] font-black text-primary/60 mb-2 font-sans">Segurança do documento</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-foreground tracking-tighter font-sans">98%</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-primary">Blindado ✨</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-muted border border-border transition-all hover:border-primary/30 group/stat">
                  <p className="text-[10px] font-black text-muted-foreground mb-2 font-sans">Brechas encontradas</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-foreground tracking-tighter font-sans">00</p>
                    <span className="text-[10px] font-bold text-emerald-500">Tudo seguro</span>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Mapa do Instrumento */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Tudo organizado"
              subtitle="Resumo visual do seu contrato"
              description="Navegue rapidamente pelo seu documento através de um mapa interativo. Saiba exatamente onde está cada ponto importante sem precisar ler 20 páginas."
            >
              <div className="mt-6 pl-4 space-y-2 border-l-2 border-primary/20">
                <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                  <span>1. Pagamentos</span>
                  <span className="text-[7.5px] font-black text-emerald-600">✅ Revisado</span>
                </div>
                <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between pl-3 italic text-muted-foreground/60">
                  <span>- Multas e Juros</span>
                </div>
                <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                  <span>2. Prazos</span>
                  <span className="text-[7.5px] font-black text-emerald-600">✅ Revisado</span>
                </div>
              </div>
            </BentoCard>

            {/* Sincronização em Tempo Real */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Acesso de qualquer lugar"
              subtitle="Seus documentos sempre com você"
              description="Comece no computador, termine no celular. Todos os seus contratos são salvos na nuvem automaticamente e sincronizados em tempo real."
            >
              <div className="mt-6 relative px-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="h-2 w-32 bg-primary/20 rounded" />
                    <span className="text-[8px] text-emerald-500 font-bold ml-auto">Sincronizado</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <div className="h-2 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 rotate-12">
                  <div className="bg-primary text-primary-foreground px-2 py-1 text-[8px] font-black rounded shadow-lg">Cloud sync on</div>
                </div>
              </div>
            </BentoCard>

            {/* Repositório e Biblioteca */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Assinatura por WhatsApp"
              subtitle="Rapidez no fechamento de negócios"
              description="Envie o link de assinatura direto para o cliente. Ele assina na tela do celular e você recebe a confirmação na hora, com validade jurídica total."
            >
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="aspect-square bg-muted border border-border rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                  <Zap size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8px] font-bold text-muted-foreground group-hover:text-primary">Instantâneo</span>
                </div>
                <div className="aspect-square bg-muted border border-border rounded-lg flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                  <ShieldCheck size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8px] font-bold text-muted-foreground group-hover:text-primary">Válido</span>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Assinaturas Certificadas Section */}
      <section id="assinaturas" className="py-32 px-6 relative overflow-hidden bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
              Assinatura com validade jurídica
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">Assine e envie <br /> <span className="text-muted-foreground">em segundos.</span></h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Esqueça o papel e a caneta. Colete assinaturas digitais seguras com validade jurídica total, direto pelo celular do seu cliente.
            </p>
            <Link href="/signatures">
              <Button variant="link" className="text-primary p-0 h-auto font-bold text-xs group">
                Saiba mais sobre assinaturas <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                linkDirectionalParticles={4}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => "hsl(var(--primary))"}
                linkColor={() => "rgba(197, 168, 128, 0.2)"}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `600 ${fontSize}px Plus Jakarta Sans`;

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
                <span className="text-[9px] font-bold text-foreground/70">Protocolo de segurança ativo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tecnologia Section */}
      <section id="tecnologia" className="py-32 px-6 border-t border-border bg-muted/30">
        <div className="max-w-5xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-bold text-foreground tracking-tight italic mb-4">Segurança de nível bancário</h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Usamos as mesmas tecnologias dos maiores bancos do mundo para garantir que seus dados nunca saiam do seu controle.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "Sincronia total", icon: <Zap />, desc: "Suas alterações salvam sozinhas em tempo real." },
            { title: "Dados blindados", icon: <Lock />, desc: "Criptografia de ponta a ponta em todos os documentos." },
            { title: "Nuvem segura", icon: <Database />, desc: "Seus contratos salvos e acessíveis de qualquer lugar." },
            { title: "Organização IA", icon: <Layers />, desc: "Sua biblioteca de modelos organizada automaticamente." }
          ].map((tech, i) => (
            <div key={i} className="p-8 bg-card border border-border rounded-[2rem] hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 transition-colors">
                {tech.icon}
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{tech.title}</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 border-t border-border bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl font-bold text-foreground tracking-tight italic">Dúvidas frequentes</h2>
            <p className="text-muted-foreground font-medium">Tudo o que você precisa saber para começar agora.</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="Preciso ser advogado para usar a plataforma?"
              answer="Não! A ExtraJus foi feita para que qualquer pessoa possa criar contratos profissionais. Nossa IA traduz o juridiquês para você e garante que as cláusulas essenciais estejam lá. No entanto, para casos muito complexos, sempre recomendamos a validação de um profissional."
            />
            <FAQItem
              question="A IA vai bagunçar meu contrato ou formatação?"
              answer="De jeito nenhum. Diferente do ChatGPT, nossa IA é 'cirúrgica'. Ela atua apenas nos parágrafos que você escolher, mantendo todo o resto do documento, fontes e estilos intactos."
            />
            <FAQItem
              question="Meus documentos estão protegidos?"
              answer="Sim, com segurança total. Usamos criptografia AES-256 (nível militar) e seus dados são armazenados em servidores seguros e isolados. Só você tem acesso aos seus contratos."
            />
            <FAQItem
              question="Como sei se o contrato está realmente correto?"
              answer="A plataforma possui um 'Radar de Saúde' que analisa o texto em tempo real. Ele avisa se faltarem informações obrigatórias, se houver termos ambíguos ou se alguma cláusula puder gerar problemas futuros."
            />
            <FAQItem
              question="Posso usar meus modelos antigos que já tenho?"
              answer="Com certeza. Você pode subir seus modelos atuais para a plataforma. Nossa IA vai aprender com eles e ajudar você a automatizar o preenchimento e a revisão desses documentos daqui para frente."
            />
          </div>
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
                Sua parceira inteligente na criação e gestão de contratos. Simplicidade, segurança e tecnologia para o seu negócio.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-foreground">Funcionalidades</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Editor de contratos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Modelos prontos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Assinatura digital</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-foreground">Suporte</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold text-muted-foreground">
            <span>© 2026 ExtraJus — Contratos inteligentes</span>
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground/60 italic">Feito com ❤️ para facilitar sua vida</span>
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
  className
}: {
  children?: React.ReactNode,
  title: string,
  subtitle: string,
  description: string,
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
            <span className="text-[10px] font-bold text-foreground">{title}</span>
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

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "border border-border/60 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300",
      isOpen ? "border-primary/30 bg-card/60" : "hover:border-border"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{question}</span>
        <div className={cn(
          "w-8 h-8 rounded-full border border-border flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-primary border-primary text-primary-foreground rotate-180" : "text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
        )}>
          <ChevronDown size={14} />
        </div>
      </button>
      <div className={cn(
        "px-6 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <p className="text-[13px] text-muted-foreground/80 leading-relaxed font-medium">
          {answer}
        </p>
      </div>
    </div>
  );
}

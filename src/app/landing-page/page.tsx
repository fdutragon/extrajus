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
        { id: "core", name: "Certificação Core", val: 30, group: "core", color: "#a855f7" },
        { id: "p1", name: "Hash MD5-Alpha", val: 15, group: "pro", color: "rgba(168, 85, 247, 0.8)" },
        { id: "p2", name: "Selo Digital", val: 15, group: "pro", color: "rgba(168, 85, 247, 0.8)" },
        { id: "p3", name: "Protocolo AES", val: 15, group: "pro", color: "rgba(168, 85, 247, 0.8)" },
        { id: "o1", name: "Validação ICP", val: 20, group: "opportunity", color: "rgba(168, 85, 247, 0.5)" },
        { id: "o2", name: "Biometria Ativa", val: 18, group: "opportunity", color: "rgba(168, 85, 247, 0.5)" },
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
  }, []); return (
    <div className="min-h-screen bg-background text-muted-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_50%)] opacity-[0.05]" />
        <div className="absolute inset-0  opacity-[0.02] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.1]" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "translate-y-0" : "translate-y-2"
      )}>
        <div className={cn(
          "max-w-5xl mx-auto flex justify-between items-center transition-all duration-300 p-2 rounded-2xl border",
          scrolled
            ? "bg-background/60 backdrop-blur-xl border-border shadow-lg"
            : "bg-transparent border-transparent"
        )}>
          <div className="flex items-center gap-6 pl-4">
            <Link href="/" className="flex items-center group">
              <Logo iconSize={36} showText={true} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider">
              <a href="#como-funciona" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Como funciona
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#modelos" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Tipos de Notificações
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#assinaturas" className="relative py-1 text-muted-foreground hover:text-foreground transition-colors group">
                Assinatura Digital
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={11} className="animate-pulse" /> Inteligência Artificial para Criação e Análise Legal
          </div>
          {/* Headline Reduzida & Consistente */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A Notificação Extrajudicial Definitiva. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-purple-400">
              Gerada, Blindada e Enviada por IA.
            </span>
          </h1>          {/* Subheadline Reduzida & Focada em Google Ads "Modelo de Contrato" */}
          <p className="text-[13px] md:text-base text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            Resolva calotes e exija seus direitos sem precisar de advogados caros. Use nossa inteligência cirúrgica para <span className="text-foreground font-bold">criar e enviar</span> notificações letais e profissionais sob medida em segundos.
          </p>

          {/* Botões do Hero Melhores & Premium */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <Link href="#modelos">
              <Button size="lg" className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-widest shadow-[0_0_25px_rgba(var(--primary),0.25)] hover:shadow-[0_0_35px_rgba(var(--primary),0.4)] hover:bg-primary/90 transition-all duration-300 group overflow-hidden border border-primary/30 active:scale-98">
                <span className="relative z-10 flex items-center gap-2">
                  Gerar Contrato Agora <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-border bg-background/40 hover:bg-muted text-foreground font-black text-[10px] uppercase tracking-widest transition-all duration-300 backdrop-blur-sm active:scale-98">
                Ver Como Funciona
              </Button>
            </Link>
          </div>

          {/* Product Showcase */}
          <div className="relative max-w-4xl mx-auto pt-16 animate-in fade-in zoom-in-95 duration-1000 delay-1000">
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2rem] blur-2xl opacity-40" />
            <div className="relative bg-card/60 border border-border rounded-3xl shadow-2xl overflow-hidden aspect-[16/9] flex backdrop-blur-md">
              {/* Left Sidebar Mockup */}
              <div className="w-56 border-r border-border hidden md:block bg-muted/30 p-6 text-left space-y-6">
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-2 w-1/3 bg-foreground/20 rounded" />
                    <div className="h-8 w-full bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between px-3 text-[9px] font-black text-primary uppercase tracking-wider">
                      <span>Notificação Ativa</span>
                      <Zap size={10} className="animate-pulse" />
                    </div>
                    <div className="h-8 w-full bg-transparent border border-foreground/5 rounded-xl" />
                    <div className="h-8 w-full bg-transparent border border-foreground/5 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Editor Mockup */}
              <div className="flex-1 p-10 text-left relative overflow-hidden bg-muted/10 flex">
                <div className="flex-1 space-y-6 pr-6">
                  <div className="space-y-3">
                    <div className="h-8 w-3/4 bg-foreground/15 rounded-lg" />
                    <div className="h-3 w-full bg-foreground/10 rounded-full" />
                    <div className="h-3 w-full bg-foreground/10 rounded-full" />
                    <div className="h-3 w-2/3 bg-foreground/10 rounded-full" />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="px-3 py-1 bg-primary/10 border border-primary/25 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest">
                      IA ExtraJus // Análise em Tempo Real
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="h-5 w-1/2 bg-foreground/15 rounded-lg" />
                    <div className="h-3 w-full bg-foreground/10 rounded-full" />
                  </div>
                </div>

                {/* Right Sidebar Mockup (Mapa do Instrumento & Auditoria) */}
                <div className="w-48 border-l border-border bg-card/45 p-4 text-left space-y-4 hidden lg:block">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Poder de Coerção</span>
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">98%</span>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Estrutura Legal</span>
                    <div className="relative pl-3 space-y-3 before:absolute before:left-[3px] before:top-1 before:bottom-1 before:w-[1px] before:bg-border">
                      <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                        <span>Objeto</span>
                        <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">✅ Regular</span>
                      </div>
                      <div className="pl-2 space-y-1">
                        <div className="h-1 w-full bg-foreground/10 rounded-full" />
                      </div>
                      <div className="text-[9px] font-bold text-foreground/80 flex items-center justify-between">
                        <span>Rescisão</span>
                        <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">✅ Seguro</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/3 left-1/3 bg-card/90 border border-border p-3 rounded-2xl shadow-2xl animate-float backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <MousePointer2 size={12} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-foreground uppercase tracking-wide">Sugestão de Ajuste</p>
                      <p className="text-[8px] text-muted-foreground tracking-tight">Cláusula otimizada com sucesso</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="como-funciona" className="py-24 px-6 border-t border-border bg-muted/10 relative">
        <div className="max-w-4xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Superior a Qualquer Modelo Pronto da Internet
            </h2>
            <p className="text-[13px] md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Arquivos de contrato estáticos que você baixa por aí são inseguros e ultrapassados. Nossa IA acompanha a saúde e validade de cada cláusula sob demanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* O Editor (Editor) */}
            <BentoCard
              className="md:col-span-8 h-[420px]"
              title="Editor Cirúrgico de IA"
              subtitle="Escreva como se estivesse conversando"
              description="Nossa inteligência entende suas intenções comerciais e redige as cláusulas mais adequadas instantaneamente em linguagem técnica impecável, sem alterar as demais seções do documento."
            >
              <div className="mt-4 relative h-full w-full overflow-hidden rounded-2xl bg-muted/40 border border-border p-5 font-mono text-[9px] text-muted-foreground text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-sans font-bold text-[8px] uppercase tracking-widest text-muted-foreground/60">Analisando contexto contratual...</span>
                </div>
                <div className="space-y-3 opacity-80">
                  <p className="text-foreground font-bold">Cláusula de rescisão imotivada</p>
                  <p className="text-emerald-500 bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 italic">
                    + [Sugestão Otimizada]: Qualquer uma das partes poderá rescindir o presente instrumento mediante aviso prévio por escrito com antecedência mínima de 30 dias...
                  </p>
                  <div className="h-4 w-3/4 bg-primary/5 rounded border border-primary/10" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 h-11 bg-background border border-border rounded-xl shadow-sm flex items-center px-4 gap-2">
                  <span className="text-primary animate-pulse">✨</span>
                  <span className="text-muted-foreground font-sans font-bold text-[8.5px] uppercase tracking-wider">Ajustando garantias financeiras no objeto...</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-4 h-[420px]"
              title="Radar Anti-Erros"
              subtitle="Proteção e rigor automatizados"
              description="Esqueça a insegurança. A plataforma analisa cada linha em tempo real, verificando se há termos ambíguos, brechas de multa ou cláusulas essenciais em falta."
            >
              <div className="mt-4 space-y-4">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/25 transition-all duration-300 hover:border-primary/50 group/stat">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 font-sans">Conformidade Legal</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-foreground tracking-tight font-sans">98%</p>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 uppercase tracking-wider">Seguro</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-muted/50 border border-border transition-all duration-300 hover:border-primary/20 group/stat">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 font-sans">Vulnerabilidades</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-foreground tracking-tight font-sans">00</p>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">Segurança Máxima</span>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Mapa do Instrumento */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Navegação Inteligente"
              subtitle="Resumo estruturado da notificação"
              description="Visualize a anatomia jurídica do seu documento por meio de um sumário interativo. Acesse e edite qualquer parágrafo em um piscar de olhos."
            >
              <div className="mt-6 pl-4 space-y-3 border-l-2 border-primary/20">
                <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>1. Escopo de Serviços</span>
                  <span className="text-[7.5px] font-black text-emerald-500">Regular</span>
                </div>
                <div className="text-[9px] font-bold text-muted-foreground/60 flex items-center justify-between pl-3 italic">
                  <span>- Entregáveis Específicos</span>
                </div>
                <div className="text-[9.5px] font-black uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>2. Responsabilidade de Pagamentos</span>
                  <span className="text-[7.5px] font-black text-emerald-500">Regular</span>
                </div>
              </div>
            </BentoCard>

            {/* Sincronização em Tempo Real */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Sincronização em Nuvem"
              subtitle="Acesso integral e blindado"
              description="Trabalhe de qualquer dispositivo com salvamento automático. Seus contratos salvos e acessíveis em um cofre digital seguro com total privacidade."
            >
              <div className="mt-6 relative px-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <div className="h-2 w-32 bg-primary/20 rounded" />
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-wider ml-auto">Ativo</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <div className="h-2 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 rotate-12">
                  <div className="bg-primary/20 border border-primary/30 text-primary px-3 py-1 text-[8px] font-black rounded-lg shadow-lg uppercase tracking-widest">Criptografado</div>
                </div>
              </div>
            </BentoCard>

            {/* Assinatura */}
            <BentoCard
              className="md:col-span-4 h-[350px]"
              title="Assinatura Simplificada"
              subtitle="WhatsApp & E-mail"
              description="Não obrigue seu cliente a imprimir e escanear. Envie um link criptografado para assinatura na própria tela do celular dele, com validade jurídica assegurada."
            >
              <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                <div className="p-4 bg-muted/60 border border-border rounded-xl flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-all">
                  <Zap size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Instantâneo</span>
                </div>
                <div className="p-4 bg-muted/60 border border-border rounded-xl flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-all">
                  <ShieldCheck size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Legítimo</span>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Popular Models Section */}
      <section id="modelos" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Tipos de Notificações Mais Frequentes
            </h2>
            <p className="text-[13px] md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Encontre o modelo exato para a sua situação. A nossa IA formata o documento completo exigindo os seus direitos de forma impecável.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Cobrança de Dívida",
                icon: <Users size={20} />,
                desc: "Notifique clientes inadimplentes exigindo o pagamento imediato sob pena de protesto e ação judicial."
              },
              {
                title: "Desocupação de Imóvel",
                icon: <Layers size={20} />,
                desc: "Exija a devolução do seu imóvel (residencial ou comercial) de forma legal, estabelecendo prazos claros e inquestionáveis."
              },
              {
                title: "Quebra de Contrato",
                icon: <ShieldCheck size={20} />,
                desc: "Notifique o parceiro ou fornecedor sobre o descumprimento contratual, ativando multas e exigindo a correção imediata."
              },
              {
                title: "Direito do Consumidor",
                icon: <Network size={20} />,
                desc: "Exija a troca de produto defeituoso, estorno de valores ou cumprimento de oferta contra empresas problemáticas."
              },
              {
                title: "Problemas em Obra",
                icon: <FileText size={20} />,
                desc: "Notifique empreiteiros e construtoras por atrasos, má qualidade ou abandono da obra, preservando suas provas."
              },
              {
                title: "Uso Indevido de Imagem",
                icon: <Gavel size={20} />,
                desc: "Ordene a remoção imediata de fotos, vídeos ou marca da internet sob pena de responsabilização civil e criminal."
              }
            ].map((model, i) => (
              <div key={i} className="group p-8 bg-card border border-border rounded-3xl hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.03)] transition-all duration-300 flex flex-col justify-between h-full text-left">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {model.icon}
                  </div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">{model.title}</h3>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed font-medium mb-6">{model.desc}</p>
                </div>
                <Link href="#faq">
                  <Button variant="link" className="p-0 h-auto text-primary font-black text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-all flex items-center gap-1.5 justify-start">
                    Saber Mais <ChevronRight size={12} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="#faq">
              <Button variant="outline" className="rounded-xl px-8 h-12 border-primary/20 hover:border-primary/50 text-primary font-black text-[10px] uppercase tracking-widest backdrop-blur-sm transition-all duration-300 active:scale-98">
                Tirar Dúvidas no FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Assinaturas Certificadas Section */}
      <section id="assinaturas" className="py-24 px-6 relative overflow-hidden bg-background">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Titulo e Descricao Padronizados com Espaçamento Reduzido */}
          <div className="space-y-3.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              Validade Jurídica Assegurada
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Assinatura Digital
            </h2>

            <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed font-medium">
              Elimine burocracias antigas. Colete assinaturas digitais plenamente seguras com histórico de assinaturas completo (IP, hashes criptográficos e geolocalização) direto pelo celular do seu contratante.
            </p>

            <Link href="/signatures">
              <Button variant="link" className="text-primary p-0 h-auto font-black text-[10px] uppercase tracking-widest group flex items-center gap-1.5">
                Ver Detalhes do Protocolo <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px]" />
            <div className="relative h-full w-full bg-card border border-border rounded-3xl overflow-hidden shadow-xl flex items-center justify-center">
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
                linkColor={() => "rgba(168, 85, 247, 0.2)"}
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
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">Criptografia Ativa ICP-Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tecnologia Section */}
      <section id="tecnologia" className="py-24 px-6 border-t border-border bg-muted/10">
        <div className="max-w-4xl mx-auto space-y-16">

          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Segurança e Criptografia
            </h2>
            <p className="text-[13px] md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Protegemos suas transações e dados comerciais com os protocolos mais rigorosos e avançados do mercado internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Segurança de Dados", icon: <Zap size={18} />, desc: "Seus contratos são criptografados com o protocolo AES-256." },
              { title: "Dados Blindados", icon: <Lock size={18} />, desc: "Sigilo absoluto garantindo a privacidade das transações." },
              { title: "Sincronização Nuvem", icon: <Database size={18} />, desc: "Hospedagem segura em servidores AWS resilientes e velozes." },
              { title: "Organização IA", icon: <Layers size={18} />, desc: "Gerenciamento dinâmico de todos os seus modelos no acervo." }
            ].map((tech, i) => (
              <div key={i} className="p-8 bg-card border border-border rounded-3xl hover:border-primary/20 transition-all group text-left">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {tech.icon}
                </div>
                <h3 className="text-[11.5px] font-black text-foreground uppercase tracking-widest mb-2">{tech.title}</h3>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-border bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-16">

          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-[13px] md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Esclareça suas dúvidas técnicas e jurídicas e comece a elaborar contratos seguros agora.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <FAQItem
              question="Preciso ser advogado ou possuir formação jurídica para usar?"
              answer="De forma alguma! A ExtraJus foi desenvolvida especificamente para que empresários e prestadores de serviços criem contratos impecáveis. Nossa IA traduz a linguagem técnica burocrática (juridiquês) para parâmetros objetivos de negócios e garante que as salvaguardas essenciais de multas e obrigações estejam lá."
            />
            <FAQItem
              question="Como a IA garante que a formatação não será desconfigurada?"
              answer="Ao contrário de outras inteligências artificiais como o ChatGPT, a IA cirúrgica da ExtraJus edita apenas as linhas ou cláusulas exatas que você selecionar. O restante do contrato, fontes, cabeçalhos, rodapés e regras de recuos permanecem 100% intactos e padronizados."
            />
            <FAQItem
              question="A assinatura gerada na plataforma possui plena validade jurídica?"
              answer="Sim! Nossas assinaturas eletrônicas estão plenamente em conformidade com a MP 2.200-2/2001 e a Lei 14.063/2020. Nós coletamos múltiplos pontos de autenticidade (IP, logs de geolocalização, e-mail/telefone e hashes SHA-256) garantindo total legitimidade legal frente a tribunais."
            />
            <FAQItem
              question="Qual a vantagem de usar a ExtraJus em vez de baixar um modelo pronto do Google?"
              answer="Modelos baixados da internet são estáticos, desatualizados e costumam conter termos que não se aplicam ao seu cenário real, gerando brechas fatais de rescisão. A ExtraJus gera contratos dinâmicos, analisa o texto em busca de contradições de datas/valores e melhora o contrato conforme as suas respostas."
            />
            <FAQItem
              question="Posso fazer o upload de contratos antigos que eu já costumo utilizar?"
              answer="Com certeza. Você pode alimentar o editor da ExtraJus com as suas minutas padrão. A inteligência artificial aprende a estrutura do seu documento e passa a sugerir automações inteligentes e revisões com base na sua escrita anterior."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-24 pb-12 px-6 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
            <div className="md:col-span-2 space-y-6 text-left">
              <div className="flex items-center">
                <Logo iconSize={48} showText={true} />
              </div>
              <p className="text-xs text-muted-foreground max-w-sm font-medium leading-relaxed">
                A evolução na geração, auditoria e assinatura eletrônica de contratos empresariais. Tecnologia e alta performance para o seu ecossistema corporativo.
              </p>
            </div>
            <div className="space-y-4 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Recursos</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-primary transition-colors">Editor de Contratos</a></li>
                <li><a href="#modelos" className="hover:text-primary transition-colors">Catálogo de Modelos</a></li>
                <li><a href="#assinaturas" className="hover:text-primary transition-colors">Assinatura Digital</a></li>
              </ul>
            </div>
            <div className="space-y-4 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Termos</h4>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos de Serviço</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>© 2026 ExtraJus S/A — Todos os direitos reservados.</span>
            <span className="text-muted-foreground/60 italic font-medium normal-case">Blindagem e Inteligência Corporativa</span>
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

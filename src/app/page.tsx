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
  History
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md bg-white/70 dark:bg-black/70 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold tracking-tighter uppercase italic">ExtraJus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#features" className="hover:text-orange-500 transition-colors">Recursos</a>
            <a href="#ia" className="hover:text-orange-500 transition-colors">IA de Lilith</a>
            <a href="#arsenal" className="hover:text-orange-500 transition-colors">Arsenal</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button className="hidden sm:flex bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-none px-6" render={<Link href="/login" />} nativeButton={false}>
              ENTRAR
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-500 text-xs font-bold tracking-widest uppercase mb-8 border border-orange-500/20 animate-pulse">
            <Sparkles size={14} /> O Futuro da Advocacia de Guerra
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-600">
            O GOOGLE DOCS <br /> <span className="italic text-orange-600 dark:text-orange-500">DOS CONTRATOS.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Edição hierárquica inteligente, IA de auditoria de risco e automação brutal. Projetado para quem não redige apenas documentos, mas <span className="font-bold text-zinc-900 dark:text-white underline decoration-orange-500/50">acordos de poder.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-black text-lg px-10 py-8 rounded-none skew-x-[-12deg] group" render={<Link href="/editor" />} nativeButton={false}>
              <span className="skew-x-[12deg] flex items-center gap-2">
                INICIAR DRAFT <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
            <Button variant="outline" size="lg" className="border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-lg px-10 py-8 rounded-none skew-x-[-12deg] hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all" render={<Link href="/editor" />} nativeButton={false}>
              <span className="skew-x-[12deg]">VER DEMONSTRAÇÃO</span>
            </Button>
          </div>

          {/* Editor Mockup Preview */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden aspect-[16/9] flex">
              {/* Sidebar */}
              <div className="w-64 border-r border-zinc-100 dark:border-zinc-900 hidden md:block bg-zinc-50/50 dark:bg-zinc-900/50 p-4 text-left">
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="pt-6 font-bold text-[10px] text-zinc-400 uppercase tracking-widest">Arsenal</div>
                  <div className="h-10 w-full bg-orange-500/10 border border-orange-500/20 rounded flex items-center px-3 gap-2">
                    <ShieldCheck size={14} className="text-orange-500" />
                    <div className="h-2 w-1/2 bg-orange-500/20 rounded" />
                  </div>
                  <div className="h-10 w-full bg-zinc-200/50 dark:bg-zinc-800/50 rounded flex items-center px-3 gap-2">
                    <Gavel size={14} className="text-zinc-400" />
                    <div className="h-2 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded" />
                  </div>
                </div>
              </div>
              {/* Main Canvas */}
              <div className="flex-1 p-8 text-left overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-orange-500 text-sm">01</div>
                    <div className="h-6 w-1/3 bg-zinc-900 dark:bg-white rounded" />
                  </div>
                  <div className="pl-14 space-y-3">
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="mt-6 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-orange-500 text-[10px]">1.1</div>
                      <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                  </div>
                  {/* Floating AI Notification */}
                  <div className="absolute bottom-8 right-8 bg-white dark:bg-zinc-900 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] p-4 rounded-lg flex items-center gap-4 animate-bounce">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      <Cpu size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Lilith AI Audit</div>
                      <div className="text-xs font-medium dark:text-white text-zinc-900">Cláusula leonina detectada.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">A ARQUITETURA DO IMPÉRIO</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-light">
              Recursos construídos para eficiência brutal e precisão cirúrgica na redação de contratos complexos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layers className="text-orange-500" />}
              title="Editor Hierárquico"
              description="Numeração dinâmica automática. Arraste e solte cláusulas, incisos e alíneas sem perder a ordem jurídica."
            />
            <FeatureCard 
              icon={<Sparkles className="text-orange-500" />}
              title="IA de Redação"
              description="Gere cláusulas complexas a partir de comandos simples. 'Lilith, crie uma trava de saída para investidores'."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-orange-500" />}
              title="Auditoria de Risco"
              description="Análise em tempo real de termos perigosos, ambíguos ou prejudiciais aos seus interesses."
            />
            <FeatureCard 
              icon={<Users className="text-orange-500" />}
              title="Colaboração de Guerra"
              description="Trabalhe em conjunto com sua equipe em tempo real, mantendo trilhas de auditoria imutáveis."
            />
            <FeatureCard 
              icon={<History className="text-orange-500" />}
              title="Versionamento Visual"
              description="Compare alterações linha por linha entre versões, focando no que realmente mudou nas cláusulas."
            />
            <FeatureCard 
              icon={<Cpu className="text-orange-500" />}
              title="Automação de Variáveis"
              description="Sincronize dados do cliente em todos os documentos instantaneamente. Erro humano reduzido a zero."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-orange-600 dark:bg-orange-700/20 translate-y-24 blur-[100px] opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">
            VOCÊ ESTÁ PRONTO PARA <br /> <span className="text-orange-600 dark:text-orange-500 underline">DITAR AS REGRAS?</span>
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-12 font-light">
            Junte-se à elite da advocacia que já utiliza o ExtraJus para dominar negociações e escalar suas operações.
          </p>
          <Button size="lg" className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black text-xl px-16 py-10 rounded-none skew-x-[-12deg] transition-all" render={<Link href="/register" />} nativeButton={false}>
            <span className="skew-x-[12deg]">FORJAR MEU PRIMEIRO CONTRATO</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black font-bold text-[10px]">E</div>
            <span className="text-lg font-bold tracking-tighter uppercase italic">ExtraJus</span>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            SYSTEM_LILITH // CORE_V2 // © 2026 IMPÉRIO DO CADELO
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-orange-500 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-500 group rounded-none">
      <CardHeader>
        <div className="w-12 h-12 bg-orange-500/10 rounded-none flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-500">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 leading-relaxed pt-2">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

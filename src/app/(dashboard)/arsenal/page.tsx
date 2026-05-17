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
  Filter,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ArsenalPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isForaging, setIsForaging] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setTemplates(data);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const categories = [
    { name: "Cível", icon: Scale },
    { name: "Societário", icon: Building2 },
    { name: "Trabalhista", icon: Briefcase },
    { name: "Sigilo", icon: Lock },
    { name: "Elite", icon: Sparkles },
  ];

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(search.toLowerCase()) || 
                         tpl.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado para forjar contratos.");
      return;
    }

    toast.loading("Forjando novo contrato a partir do modelo...", { id: "forge" });

    // 1. Create the contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        title: `${template.title} - ${new Date().toLocaleDateString()}`,
        status: 'draft'
      })
      .select()
      .single();

    if (contractError) {
      toast.error("Falha ao criar contrato.", { id: "forge" });
      return;
    }

    // 2. Insert the initial content into yjs_updates (optional, but good for persistence)
    // For now, we'll just redirect and let the editor handle the initial content if we pass it, 
    // or we can pre-populate the yjs_updates table with the template content.
    // Since Yjs is binary, we'd need to encode the HTML. 
    // Simplified: we'll pass the template content via local storage or state if needed.
    // Better: let's just redirect to editor with a 'from_template' param.
    
    router.push(`/editor?room=${contract.id}&template=${template.slug}`);
    toast.success("Contrato forjado com sucesso!", { id: "forge" });
  };

  const handleForgeRequest = async () => {
    const description = prompt("Descreva o modelo de contrato que você precisa (ex: Contrato de Investimento Anjo com Vesting):");
    if (!description) return;

    setIsForaging(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Acesso negado.");
      setIsForaging(false);
      return;
    }

    const { error } = await supabase.from('forge_requests').insert({
      user_id: user.id,
      description
    });

    if (error) {
      toast.error("Erro ao enviar solicitação.");
    } else {
      toast.success("Solicitação enviada! Nossos arquitetos entrarão em contato.");
    }
    setIsForaging(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2.5 py-1 h-fit flex items-center justify-center leading-none">Modelos Forjados</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Master Library</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Arsenal Jurídico</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Acesso imediato a documentos de alta performance, estruturados para proteção total de ativos e operações complexas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Pesquisar no arsenal..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-primary/30 transition-all outline-none"
            />
          </div>
          <Button variant="outline" className="h-10 px-3 border-border hover:bg-muted rounded-lg">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2 border rounded-full transition-all whitespace-nowrap shrink-0 group",
            !selectedCategory ? "bg-primary border-primary text-primary-foreground shadow-sm" : "bg-card border-border hover:border-primary/50"
          )}
        >
          <LayoutGrid size={14} />
          <span className="text-[12px] font-bold tracking-tight">Todos</span>
        </button>
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCategory(cat.name)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 border rounded-full transition-all whitespace-nowrap shrink-0 group",
              selectedCategory === cat.name ? "bg-primary border-primary text-primary-foreground shadow-sm" : "bg-card border-border hover:border-primary/50"
            )}
          >
            <cat.icon size={14} className={cn(selectedCategory === cat.name ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
            <span className="text-[12px] font-bold tracking-tight">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground uppercase font-black text-xs tracking-[0.2em]">Nenhum modelo encontrado no setor.</div>
        ) : (
          filteredTemplates.map((tpl, i) => (
            <Card key={tpl.id} className="bg-card border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-muted group-hover:bg-primary transition-colors" />
              
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-border text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-colors h-fit py-1 flex items-center justify-center leading-none">
                    {tpl.category}
                  </Badge>
                  <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                     <PlusCircle size={16} />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-bold tracking-tight text-foreground transition-colors">{tpl.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors">{tpl.description}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setPreviewTemplate(tpl)}
                    className="flex-1 h-9 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted transition-all"
                  >
                    Previsualizar
                  </Button>
                  <Button 
                    onClick={() => handleUseTemplate(tpl)}
                    className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-[11px] font-bold" 
                  >
                    Usar Agora <ArrowRight size={12} className="ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Featured / Custom Forge Section */}
      <div className="bg-card border border-border rounded-2xl p-10 relative overflow-hidden group mt-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Forja Customizada</span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground italic uppercase">Precisa de um Documento sob Medida?</h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl">
                Nossos arquitetos jurídicos estão prontos para forjar modelos exclusivos para sua operação. 
                Documentos blindados, otimizados para sua jurisdição e focados em controle absoluto. 
                <span className="text-foreground block mt-2 font-medium">Entrega em menos de 24 horas.</span>
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-border">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground italic uppercase">24h</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Prazo Máximo</span>
              </div>
              <div className="h-8 w-[1px] bg-border" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground italic uppercase">100%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Garantia de Blindagem</span>
              </div>
              <div className="h-8 w-[1px] bg-border" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground italic uppercase">+500</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Modelos Forjados</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            <Button 
              disabled={isForaging}
              onClick={handleForgeRequest}
              size="lg" className="w-full lg:w-auto h-14 bg-foreground text-background hover:opacity-90 font-bold px-10 rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 group"
            >
              {isForaging ? "Enviando..." : "Solicitar Forja Customizada"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background border-border shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-border bg-muted/30">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold border-primary/30 text-primary bg-primary/5 h-fit py-1 flex items-center justify-center leading-none">{previewTemplate?.category}</Badge>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">Estrutura de Elite</span>
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{previewTemplate?.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">{previewTemplate?.description}</DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 p-8">
              <div 
                className="prose prose-zinc dark:prose-invert max-w-none prose-sm font-sans"
                dangerouslySetInnerHTML={{ __html: previewTemplate?.content || "<p className='italic opacity-40 uppercase font-black text-[10px] tracking-widest text-center py-20'>Nenhum dado neural detectado...</p>" }}
              />
            </ScrollArea>

            <div className="p-6 border-t border-border bg-muted/30 flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setPreviewTemplate(null)} className="h-10 px-6 font-bold text-[10px] uppercase text-muted-foreground hover:text-foreground transition-colors">Fechar Análise</Button>
              <Button 
                onClick={() => {
                  const tpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(tpl);
                }}
                className="h-10 px-6 bg-primary text-primary-foreground font-bold rounded-lg text-[10px] uppercase hover:opacity-90 transition-all"
              >
                Forjar Este Modelo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


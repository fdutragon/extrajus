"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  Download, 
  Search, 
  ChevronRight,
  Filter,
  ArrowRight,
  Send,
  MoreVertical,
  Activity,
  History
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignaturesPage() {
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile for credits
      const { data: profData } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      setProfile(profData);

      // Fetch Signatures joined with Contracts
      const { data: sigData, error } = await supabase
        .from('signatures')
        .select(`
          *,
          contracts (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (sigData) setSignatures(sigData);
      setLoading(false);
    }

    fetchData();
  }, []);

  const pendingSignatures = signatures.filter(s => s.status === 'pending');
  const signedDocuments = signatures.filter(s => s.status === 'signed');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading(`Importando ${file.name}...`, { id: "import" });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado.", { id: "import" });
      return;
    }

    // 1. Create a new contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contract:", error);
      toast.error("Erro ao importar documento.", { id: "import" });
      return;
    }

    toast.success("Documento pronto para edição!", { id: "import" });

    // 2. Redirect to editor
    router.push(`/editor?room=${contract.id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <input 
        type="file" 
        id="import-doc" 
        className="hidden" 
        accept=".pdf,.docx,.doc,.txt,.html"
        onChange={handleImport}
      />
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Pipeline</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Execution Queue</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Execução</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Monitore a formalização e colha as assinaturas eletrônicas com segurança criptográfica de nível militar.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-10 px-4 border-border hover:bg-muted rounded-lg text-[13px] font-medium">
            <Filter size={14} className="mr-2" /> Filtrar
          </Button>
          <Button 
            onClick={() => document.getElementById('import-doc')?.click()}
            className="h-10 bg-primary text-primary-foreground hover:opacity-90 font-bold rounded-lg px-5 text-[13px]"
          >
            Importar Documento
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Tabs defaultValue="pending" className="w-full">
          <div className="px-6 py-4 border-b border-border">
            <TabsList className="bg-muted rounded-lg p-1 h-9">
              <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[12px] font-bold px-6 transition-all h-full">
                <Activity size={12} className="mr-1.5" /> Pendentes ({pendingSignatures.length})
              </TabsTrigger>
              <TabsTrigger value="signed" className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[12px] font-bold px-6 transition-all h-full">
                <History size={12} className="mr-1.5" /> Assinados ({signedDocuments.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="mt-0">
            {loading ? (
              <div className="p-20 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando com os Oráculos...</div>
            ) : pendingSignatures.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Nenhum ritual pendente no momento.</div>
            ) : (
              <Table>
                <TableBody>
                  {pendingSignatures.map((doc) => (
                    <TableRow key={doc.id} className="border-border group hover:bg-accent transition-all cursor-pointer">
                      <TableCell className="w-16 pl-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <Clock size={18} className="animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-[13px] font-bold tracking-tight">{doc.contracts?.title || 'Contrato sem Título'}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">
                          {doc.signers?.length || 0} Signatários • Enviado em {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="w-1/4">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-tighter">
                            <span className="text-primary">Pendente</span>
                            <span className="text-muted-foreground">ID: {doc.external_id?.slice(0, 8)}...</span>
                          </div>
                          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                            <div className="h-full bg-primary w-1/3 transition-all duration-1000" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-48 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-bold text-muted-foreground">
                            Detalhes
                          </Button>
                          <Button size="sm" className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[11px] px-4 border border-primary/20">
                            <Send size={12} className="mr-1.5" /> Notificar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="signed" className="mt-0">
            {signedDocuments.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Ainda não há contratos selados.</div>
            ) : (
              <Table>
                <TableBody>
                  {signedDocuments.map((doc) => (
                    <TableRow key={doc.id} className="border-border group hover:bg-accent transition-all cursor-pointer">
                      <TableCell className="w-16 pl-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                          <CheckCircle2 size={18} />
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="text-[13px] font-bold tracking-tight">{doc.contracts?.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Assinado em {new Date(doc.updated_at).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="w-1/4">
                         <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Protocolo: {doc.external_id}
                         </div>
                      </TableCell>
                      <TableCell className="w-48 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreVertical size={16} />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-[11px] font-bold gap-1.5 px-3 transition-all">
                            <Download size={14} /> Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer Info / Credits */}
      <div className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <Activity size={24} />
          </div>
          <div className="space-y-1">
            <div className="text-[13px] font-bold tracking-tight">Capacidade de Execução</div>
            <div className="text-[11px] text-muted-foreground font-medium">Você possui <span className="text-foreground font-bold font-mono text-[12px]">{profile?.credits || 0}</span> créditos de assinatura restantes.</div>
          </div>
        </div>
        <Button variant="outline" className="h-10 px-6 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-lg text-[12px] transition-all">
          Recarregar Créditos
        </Button>
      </div>
    </div>
  );
}


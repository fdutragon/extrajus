"use client"

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ContractsTable({ initialContracts }: { initialContracts: any[] }) {
  const [search, setSearch] = useState("");
  const [contracts, setContracts] = useState(initialContracts);
  const supabase = createClient();
  const router = useRouter();

  const filteredContracts = contracts.filter(c => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento? Esta ação é irreversível.")) return;

    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) {
      toast.error("Falha ao excluir contrato.");
    } else {
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success("Contrato eliminado do repositório.");
    }
  };

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)]">
      <div className="p-5 border-b border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search by name, ID or client..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/30 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/30 transition-all outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs font-black text-muted-foreground gap-1.5 uppercase tracking-widest">
            Type: All <ChevronDown size={14} />
          </Button>
          <div className="h-4 w-[1px] bg-border/50" />
          <span className="text-xs text-muted-foreground font-mono italic">
            {filteredContracts.length} docs
          </span>
        </div>
      </div>
      <div className="overflow-x-hidden w-full">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent bg-muted/20">
            <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-4 pl-8 text-muted-foreground w-[45%] min-w-0">Document</TableHead>
            <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-4 text-muted-foreground w-[15%]">Status</TableHead>
            <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-4 text-muted-foreground w-[15%] hidden sm:table-cell">Modified</TableHead>
            <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] py-4 text-right pr-8 text-muted-foreground w-[25%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContracts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-20 text-center text-muted-foreground uppercase font-black text-xs tracking-widest italic opacity-40">
                Nenhum dado neural encontrado no setor.
              </TableCell>
            </TableRow>
          ) : (
            filteredContracts.map((contract) => (
              <TableRow key={contract.id} className="border-border group hover:bg-accent transition-all h-16">
                <TableCell className="py-4 pl-8">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <FileText size={14} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <Link href={`/editor?room=${contract.id}`} className="text-sm font-medium hover:underline truncate block w-full" title={contract.title || 'Contrato Sem Título'}>
                        {(() => {
                          const t = contract.title || 'Contrato Sem Título';
                          const minors = ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'para', 'com', 'por', 'sem', 'sob'];
                          return t.toLowerCase().split(' ').map((w, i) => (i > 0 && minors.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        })()}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono mt-0.5 truncate">ID: {contract.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-xs uppercase font-bold tracking-widest px-2 py-0 border-none rounded-full",
                    contract.status === 'signed' ? "bg-primary/10 text-primary" :
                    contract.status === 'pending' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {contract.status === 'draft' ? 'Em Edição' : 
                     contract.status === 'pending' ? 'Pendente' : 
                     contract.status === 'signed' ? 'Selado' : 'Rascunho'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono hidden sm:table-cell">
                  {new Date(contract.updated_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                      <Link href={`/editor?room=${contract.id}`}>
                        <Edit size={14} />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => handleDelete(contract.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

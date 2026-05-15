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
    if (!confirm("Tem certeza que deseja destruir este ritual? Esta ação é irreversível.")) return;

    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) {
      toast.error("Falha ao destruir contrato.");
    } else {
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success("Contrato eliminado do repositório.");
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Filtrar por nome, ID ou cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-transparent dark:border-white/5 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-orange-500/30 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-[12px] font-bold text-zinc-500 gap-1.5">
            Tipo: Todos <ChevronDown size={14} />
          </Button>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10" />
          <span className="text-[11px] text-zinc-400 font-mono italic">
            {filteredContracts.length} docs
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-100 dark:border-white/5 hover:bg-transparent bg-zinc-50/30 dark:bg-white/[0.01]">
            <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 pl-8">Contrato</TableHead>
            <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Status</TableHead>
            <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Modificação</TableHead>
            <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-right pr-8">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContracts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-20 text-center text-zinc-500 uppercase font-black text-[10px] tracking-widest italic opacity-40">
                Nenhum dado neural encontrado no setor.
              </TableCell>
            </TableRow>
          ) : (
            filteredContracts.map((contract) => (
              <TableRow key={contract.id} className="border-zinc-100 dark:border-white/5 group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-all h-16">
                <TableCell className="py-4 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors">
                      <FileText size={14} />
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/editor?room=${contract.id}`} className="text-[13px] font-bold tracking-tight hover:underline">
                        {contract.title || 'Contrato Sem Título'}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {contract.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[9px] uppercase font-bold tracking-widest px-2 py-0",
                    contract.status === 'draft' ? "border-zinc-200 text-zinc-500" : "border-emerald-500/50 text-emerald-500 bg-emerald-500/5"
                  )}>
                    {contract.status || 'draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-zinc-400 font-mono">
                  {new Date(contract.updated_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                      <Link href={`/editor?room=${contract.id}`}>
                        <Edit size={14} />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-500"
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
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

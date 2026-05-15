import { createClient } from "@/utils/supabase/server";
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
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  Command,
  ChevronDown,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function deleteContract(formData: FormData) {
  'use server'
  const supabase = await createClient();
  const id = formData.get('id') as string;
  
  await supabase.from('contracts').delete().eq('id', id);
  revalidatePath('/contracts');
}

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200/50 dark:border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-emerald-500/50 text-emerald-500 bg-emerald-500/5 px-2 py-0">Ativo</Badge>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase italic">Repositório Seguro</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Repositório Central</h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Gestão completa e auditoria de documentos. O histórico completo da sua infraestrutura jurídica sob controle absoluto.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="h-10 px-4 border-zinc-200/50 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-[13px] font-medium">
            <Archive size={14} className="mr-2" /> Arquivo Morto
          </Button>
          <Button className="h-10 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 font-bold rounded-lg px-5 text-[13px] shadow-lg shadow-black/10 dark:shadow-white/5">
            Exportar Todos
          </Button>
        </div>
      </div>
      <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Filtrar por nome, ID ou cliente..." 
              className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-transparent dark:border-white/5 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-orange-500/30 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[12px] font-bold text-zinc-500 gap-1.5">
              Tipo: Todos <ChevronDown size={14} />
            </Button>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10" />
            <span className="text-[11px] text-zinc-400 font-mono italic">
              {contracts?.length || 0} docs
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 dark:border-white/5 hover:bg-transparent bg-zinc-50/30 dark:bg-white/[0.01]">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 pl-8">Contrato</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4">Última Modificação</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest py-4 text-right pr-8">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts?.map((contract) => (
              <TableRow key={contract.id} className="border-zinc-100 dark:border-white/5 group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-all h-16">
                <TableCell className="py-4 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors">
                      <FileText size={14} />
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/editor?room=${contract.id}`} className="text-[13px] font-bold tracking-tight hover:underline">{contract.title || 'Contrato Sem Título'}</Link>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {contract.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[11px] text-zinc-400 font-mono">{new Date(contract.updated_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/editor?room=${contract.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                        <Edit size={14} />
                      </Button>
                    </Link>
                    <form action={deleteContract}>
                        <input type="hidden" name="id" value={contract.id} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

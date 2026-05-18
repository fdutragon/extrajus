import { createClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Archive,
  Download
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { ContractsTable } from "./contracts-table";
import { redirect } from "next/navigation";

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  async function createNewContract() {
    'use server'
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        title: `Novo Contrato - ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'draft'
      })
      .select()
      .single();
    
    if (data) {
      redirect(`/editor?room=${data.id}`);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/50 text-primary bg-primary/5 px-2 py-0">Ativo</Badge>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase italic">Repositório Seguro</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Documentos</h1>
          <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">
            Gestão completa e auditoria de contratos. O histórico completo da sua infraestrutura jurídica sob controle profissional.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={createNewContract}>
            <Button type="submit" className="h-10 bg-primary text-primary-foreground hover:opacity-90 font-bold rounded-lg px-5 text-[13px]">
              <Plus size={16} className="mr-2" /> Novo Contrato
            </Button>
          </form>
          <Button variant="outline" className="h-10 px-4 border-border hover:bg-muted rounded-lg text-[13px] font-medium">
            <Download size={14} className="mr-2" /> Exportar Todos
          </Button>
        </div>
      </div>

      <ContractsTable initialContracts={contracts || []} />
    </div>
  );
}

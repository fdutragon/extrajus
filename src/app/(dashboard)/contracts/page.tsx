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
    <div className="space-y-12 animate-in fade-in duration-700 overflow-x-hidden px-1">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-border/50 pb-8 relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-[9px] uppercase tracking-[0.3em] font-black border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full animate-pulse">Secure Repository</Badge>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase italic">Legal Infrastructure</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Contracts <span className="text-muted-foreground/30 font-light">/</span> <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">Vault</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Gestão completa e auditoria de contratos. O histórico completo da sua infraestrutura jurídica sob controle profissional.
          </p>
        </div>
        <div className="relative z-10">
          <form action={createNewContract}>
            <Button
              type="submit"
              className="relative bg-primary/5 text-primary hover:text-primary-foreground hover:bg-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl px-8 h-12 group transition-all duration-500 shadow-[0_0_15px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] border border-primary/30 hover:border-primary overflow-hidden"
              variant="outline"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative z-10 flex items-center gap-2">
                <Plus size={16} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
                New Contract
              </div>
            </Button>
          </form>
        </div>
      </div>

      <ContractsTable initialContracts={contracts || []} />
    </div>
  );
}

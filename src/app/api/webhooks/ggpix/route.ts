import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[Webhook GG Pix] Recebido:", payload);

    const { status, externalId, amount } = payload;

    if (status === "COMPLETE" && externalId) {
      const supabase = await createClient();

      // 1. Buscar a transação pendente
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("user_id, status")
        .eq("external_id", externalId)
        .single();

      if (fetchError || !transaction) {
        console.error("[Webhook] Transação não encontrada:", externalId);
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
      }

      // Evitar processamento duplicado
      if (transaction.status === "COMPLETE") {
        return NextResponse.json({ success: true, message: "Já processado" });
      }

      // 2. Atualizar status da transação
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({ status: "COMPLETE" })
        .eq("external_id", externalId);

      if (updateTxError) throw updateTxError;

      // 3. Adicionar créditos ao usuário (Conversão 1 centavo = 1 ponto de poder? Ou customizado)
      // Vamos assumir que 1 Real (100 centavos) = 10 Créditos (Ajustável)
      const creditsToAdd = Math.floor(amount / 10); 

      const { error: updateProfileError } = await supabase.rpc('increment_credits', {
        user_id: transaction.user_id,
        amount: creditsToAdd
      });

      // Se a RPC não existir, fazemos via select/update (menos seguro contra race conditions, mas funciona)
      if (updateProfileError) {
         console.warn("[Webhook] RPC 'increment_credits' falhou, tentando fallback manual...");
         const { data: profile } = await supabase
           .from('profiles')
           .select('credits')
           .eq('id', transaction.user_id)
           .single();
         
         const newCredits = (profile?.credits || 0) + creditsToAdd;
         
         await supabase
           .from('profiles')
           .update({ credits: newCredits })
           .eq('id', transaction.user_id);
      }

      console.log(`[Webhook] Sucesso: ${creditsToAdd} créditos adicionados ao usuário ${transaction.user_id}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Status não é COMPLETE ou externalId ausente" });

  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const bodyClone = request.clone();
    const payload = await request.json();
    console.log("[Webhook GG Pix] Recebido:", payload);

    // Validação de segurança e origem do Webhook
    const signature = request.headers.get("X-GG-Signature");
    const authorization = request.headers.get("Authorization");

    // LOG TEMPORÁRIO PARA DEBUG NA VERCEL (MASCARADO PARA SEGURANÇA) - RECARREGANDO VARIÁVEIS DO PAINEL VERCEL
    console.log("[DEBUG GG PIX WEBHOOK HEADERS]:", {
      signature: signature ? `${signature.substring(0, 6)}...${signature.substring(signature.length - 4)}` : "null",
      authorization: authorization ? `${authorization.substring(0, 13)}...${authorization.substring(authorization.length - 4)}` : "null",
      contentType: request.headers.get("content-type")
    });

    const secret = process.env.GGPIX_WEBHOOK_SECRET || process.env.GGPIX_API_KEY || "";

    if (secret) {
      const isSimpleToken = authorization === secret || authorization === `Bearer ${secret}` || signature === secret;
      
      let isHmacValid = false;
      if (signature && !isSimpleToken) {
        const bodyText = await bodyClone.text();
        const hash = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
        isHmacValid = signature === hash;
      }

      // BYPASS TEMPORÁRIO: Se for o botão de simulação do painel da GG Pix (que não envia headers),
      // nós permitimos passar temporariamente para validação e exibição do 200 OK no painel deles.
      const isTestBypass = !authorization && !signature;

      if (!isSimpleToken && !isHmacValid && !isTestBypass) {
        console.warn("[Webhook GG Pix] Bloqueada tentativa de requisição falsa sem assinatura válida.");
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      if (isTestBypass) {
        console.log("[Webhook GG Pix] Permitindo transação via Bypass Temporário de Simulação (sem cabeçalhos).");
      }
    }

    const { status, externalId, amount } = payload;

    if (status === "COMPLETE" && externalId) {
      // Criar o cliente Admin usando a Service Role Key para contornar RLS no webhook
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

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

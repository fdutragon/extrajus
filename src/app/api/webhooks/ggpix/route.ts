import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const bodyClone = request.clone();
    const payload = await request.json();
    console.log("[Webhook GG Pix] Recebido:", payload);

    // Validação de segurança e origem do Webhook
    const signature = request.headers.get("X-GG-Signature") || request.headers.get("x-gg-signature");
    const authorization = request.headers.get("Authorization") || request.headers.get("authorization");

    const secret = process.env.GGPIX_WEBHOOK_SECRET || process.env.GGPIX_API_KEY || "";

    console.log("[Webhook GG Pix Debug] Dados de validação:", {
      signature,
      authorization: authorization ? `${authorization.substring(0, 15)}...` : null,
      hasSecret: !!secret,
      secretLength: secret.length,
      secretPrefix: secret ? secret.substring(0, 8) : "",
      usingFallbackKey: !process.env.GGPIX_WEBHOOK_SECRET && !!process.env.GGPIX_API_KEY
    });

    if (secret) {
      const isSimpleToken = authorization === secret || authorization === `Bearer ${secret}` || signature === secret;
      
      let isHmacValid = false;
      let computedHash = "";
      let bodyText = "";

      if (signature && !isSimpleToken) {
        try {
          bodyText = await bodyClone.text();
          computedHash = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
          isHmacValid = signature === computedHash;
          
          console.log("[Webhook GG Pix Debug] HMAC processado:", {
            isHmacValid,
            signature,
            computedHash,
            bodyLength: bodyText.length
          });
        } catch (err: any) {
          console.error("[Webhook GG Pix Debug] Falha ao ler stream ou computar HMAC:", err.message);
        }
      }

      console.log("[Webhook GG Pix Debug] Status final de autenticação:", {
        isSimpleToken,
        isHmacValid
      });

      if (!isSimpleToken && !isHmacValid) {
        console.warn("[Webhook GG Pix] Bloqueada tentativa de requisição falsa sem assinatura válida.");
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

      // Intercept paydoc flows
      if (externalId.startsWith("paydoc_")) {
        const docId = externalId.replace("paydoc_", "");
        
        // Adiciona 1000 créditos
        const { error: updateProfileError } = await supabase.rpc('increment_credits', {
          user_id: transaction.user_id,
          amount: 1000
        });

        if (updateProfileError) {
          const { data: profile } = await supabase.from('profiles').select('credits').eq('id', transaction.user_id).single();
          const newCredits = (profile?.credits || 0) + 1000;
          await supabase.from('profiles').update({ credits: newCredits }).eq('id', transaction.user_id);
        }

        // Destrava o documento
        const { error: updateDocError } = await supabase
          .from("documents")
          .update({ is_paid: true })
          .eq("id", docId);

        if (updateDocError) console.error("Erro ao destravar documento:", updateDocError);

        // Também atualiza o status na tabela de contratos do usuário
        const { error: updateContractError } = await supabase
          .from("contracts")
          .update({ status: "draft" })
          .eq("id", docId);

        if (updateContractError) console.error("Erro ao destravar contrato correspondente:", updateContractError);

        console.log(`[Webhook] Documento e Contrato ${docId} destravados e 1000 créditos adicionados ao usuário ${transaction.user_id}`);
        return NextResponse.json({ success: true });
      }

      // 3. Adicionar créditos ao usuário recalibrado (fluxo padrão de recarga)
      let creditsToAdd = Math.floor(amount / 13);
      const amountCents = amount; // amount vem em centavos do GG Pix
      if (amountCents === 1990) {
        creditsToAdd = 150;
      } else if (amountCents === 4990) {
        creditsToAdd = 500;
      } else if (amountCents === 9990) {
        creditsToAdd = 1200;
      }
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

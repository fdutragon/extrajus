import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("externalId");

    if (!externalId) {
      return NextResponse.json({ error: "ID externo ausente" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isPayDoc = externalId.startsWith("paydoc_");

    if (!user && !isPayDoc) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabaseAdmin
      .from("transactions")
      .select("status, amount_cents, user_id")
      .eq("external_id", externalId);

    if (!isPayDoc) {
      query = query.eq("user_id", user?.id);
    }

    const { data: transaction, error } = await query.single();

    if (error || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    let actionLink: string | undefined = undefined;
    let emailAddress: string | undefined = undefined;
    let tempPassword: string | undefined = undefined;

    // Se o pagamento foi concluído e for um desbloqueio de documento, extrai credenciais e gera magiclink
    if (transaction.status === "COMPLETE" && isPayDoc) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        if (userData?.user?.email) {
          emailAddress = userData.user.email;
          tempPassword = userData.user.user_metadata?.temp_pass;
          
          const docId = externalId.replace("paydoc_", "");
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/editor?room=${docId}`
            }
          });
          if (linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        }
      } catch (err) {
        console.error("Erro ao gerar link de redirecionamento pós-pagamento:", err);
      }
    }

    return NextResponse.json({ 
      status: transaction.status,
      amountCents: transaction.amount_cents,
      actionLink,
      email: emailAddress,
      tempPassword
    });

  } catch (error: any) {
    console.error("[Status API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { externalId } = await request.json();

    if (!externalId) {
      return NextResponse.json({ error: "ID externo ausente" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Buscar transação
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("user_id, status")
      .eq("external_id", externalId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // Verificar se é o usuário master para liberar o bypass de simulação em produção
    let isMasterUser = false;
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
      if (userData?.user?.email === "felipedutra@outlook.com") {
        isMasterUser = true;
      }
    } catch (e) {
      console.error("Erro ao verificar usuário master para bypass:", e);
    }

    if (process.env.NODE_ENV !== "development" && !isMasterUser) {
      return NextResponse.json({ error: "Proibido em produção" }, { status: 403 });
    }

    // 2. Atualizar transação
    await supabaseAdmin
      .from("transactions")
      .update({ status: "COMPLETE" })
      .eq("external_id", externalId);

    let actionLink: string | undefined = undefined;
    let emailAddress: string | undefined = undefined;
    let tempPassword: string | undefined = undefined;

    // 3. Se for paydoc, destravar doc e adicionar créditos
    if (externalId.startsWith("paydoc_")) {
      const docId = externalId.replace("paydoc_", "");
      
      // Adiciona 1000 créditos
      const { error: updateProfileError } = await supabaseAdmin.rpc('increment_credits', {
        user_id: transaction.user_id,
        amount: 1000
      });

      if (updateProfileError) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('credits').eq('id', transaction.user_id).single();
        const newCredits = (profile?.credits || 0) + 1000;
        await supabaseAdmin.from('profiles').update({ credits: newCredits }).eq('id', transaction.user_id);
      }

      // Destrava documento
      await supabaseAdmin
        .from("documents")
        .update({ is_paid: true })
        .eq("id", docId);

      // Também destrava/atualiza status do contrato correspondente no dashboard do usuário
      await supabaseAdmin
        .from("contracts")
        .update({ status: "draft" })
        .eq("id", docId);

      // Gerar credenciais e link de login automático pós-pagamento
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        if (userData?.user?.email) {
          emailAddress = userData.user.email;
          tempPassword = userData.user.user_metadata?.temp_pass;
          
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/editor?room=${docId}`
            }
          });
          if (linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        }
      } catch (err) {
        console.error("Erro ao gerar link de redirecionamento pós-pagamento simulado:", err);
      }
    }

    return NextResponse.json({ success: true, actionLink, email: emailAddress, tempPassword });
  } catch (error: any) {
    console.error("[Simulate Payment Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

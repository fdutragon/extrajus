import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const GGPIX_API_URL = "https://ggpixapi.com/api/v1/pix/in";
const API_KEY = process.env.GGPIX_API_KEY;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { amountCents, description } = await request.json();

    if (!amountCents || amountCents < 100) {
      return NextResponse.json({ error: "Valor mínimo de R$ 1,00" }, { status: 400 });
    }

    const externalId = `pacto_${uuidv4()}`;

    // 1. Registrar a intenção de transação no banco
    const { error: dbError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount_cents: amountCents,
        external_id: externalId,
        status: "PENDING"
      });

    if (dbError) throw dbError;

    // 2. Buscar o CPF/CNPJ do perfil do usuário de forma dinâmica
    const { data: profile } = await supabase
      .from("profiles")
      .select("document")
      .eq("id", user.id)
      .single();

    const payerDocument = profile?.document || "00000000000";

    // 3. Chamar a API GG Pix
    const response = await fetch(GGPIX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY || "",
      },
      body: JSON.stringify({
        amountCents,
        description: description || "Créditos ExtraJus",
        payerName: user.user_metadata?.full_name || user.email,
        payerDocument,
        externalId,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/ggpix`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro GG Pix:", data);
      return NextResponse.json({ error: "Falha ao gerar Pix" }, { status: 500 });
    }

    // 3. Atualizar transação com o pixCode retornado
    await supabase
      .from("transactions")
      .update({ pix_code: data.pixCopyPaste })
      .eq("external_id", externalId);

    return NextResponse.json({ 
      pixCode: data.pixCopyPaste, 
      pixQrCode: data.pixCode,
      externalId 
    });

  } catch (error: any) {
    console.error("Billing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

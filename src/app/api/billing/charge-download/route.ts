import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Por favor, faça login." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar créditos com privilégios admin para garantir leitura fiel
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    const currentCredits = profile?.credits ?? 0;
    const cost = 25; // Custo de 25 créditos para baixar o DOCX

    if (currentCredits < cost) {
      return NextResponse.json(
        { 
          error: `Saldo de Sinapses insuficiente. Para baixar o arquivo editável em DOCX, você precisa de ${cost} Sinapses, mas possui apenas ${currentCredits}.` 
        },
        { status: 403 }
      );
    }

    // Deduzir 2 créditos do perfil com privilégios admin (bypassing RLS)
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ credits: currentCredits - cost })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Registrar transação no ledger de créditos com privilégios admin (bypassing RLS)
    const { error: ledgerError } = await supabaseAdmin
      .from("credit_ledger")
      .insert({
        user_id: user.id,
        amount: -cost,
        action_type: "docx_downloaded",
      });

    if (ledgerError) throw ledgerError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Charge download error:", error);
    return NextResponse.json(
      { error: "Falha ao processar débito de créditos para download." },
      { status: 500 }
    );
  }
}

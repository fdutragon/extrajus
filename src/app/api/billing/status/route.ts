import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("externalId");

    if (!externalId) {
      return NextResponse.json({ error: "ID externo ausente" }, { status: 400 });
    }

    const { data: transaction, error } = await supabase
      .from("transactions")
      .select("status, amount_cents")
      .eq("external_id", externalId)
      .eq("user_id", user.id)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ 
      status: transaction.status,
      amountCents: transaction.amount_cents
    });

  } catch (error: any) {
    console.error("[Status API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

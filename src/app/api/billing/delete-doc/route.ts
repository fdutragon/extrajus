import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { docId } = await request.json();

    if (!docId) {
      return NextResponse.json({ error: "ID do documento ausente" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Deleta o contrato e o documento correspondentes na base de dados
    await supabaseAdmin.from("contracts").delete().eq("id", docId);
    await supabaseAdmin.from("documents").delete().eq("id", docId);

    console.log(`[Delete Doc] Documento e Contrato ${docId} deletados com sucesso.`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Delete Doc Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

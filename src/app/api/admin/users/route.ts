import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET - Buscar todos os usuários cadastrados
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: usersList, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, credits, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users: usersList });

  } catch (error: any) {
    console.error("Admin Fetch Users Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Injetar Créditos em um usuário específico
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newCredits } = body;

    if (!userId || newCredits === undefined || isNaN(newCredits)) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Créditos injetados com sucesso." });

  } catch (error: any) {
    console.error("Admin Credit Injection Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

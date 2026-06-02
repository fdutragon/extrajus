import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET - Buscar todos os usuários cadastrados com ocupação
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: usersList, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, credits, updated_at, occupation')
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
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
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

// DELETE - Excluir um usuário permanentemente
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId não fornecido." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Excluir primeiro da tabela profiles para evitar violação de FK
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 2. Excluir da autenticação Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.warn("Auth deletion failed or user already deleted in auth:", authError.message);
    }

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso." });

  } catch (error: any) {
    console.error("Admin User Deletion Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

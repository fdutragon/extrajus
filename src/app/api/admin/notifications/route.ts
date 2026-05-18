import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// POST - Enviar uma notificação para um usuário específico (Apenas Felipe Admin)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes (userId, title, message)." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (userId === "all") {
      // Buscar todos os perfis cadastrados
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id');

      if (fetchError) throw fetchError;
      if (!users || users.length === 0) {
        return NextResponse.json({ success: true, count: 0, message: "Nenhum usuário cadastrado." });
      }

      // Preparar inserções em lote (batch)
      const notificationRows = users.map((u: any) => ({
        user_id: u.id,
        title,
        message,
        type: type || 'system',
        link: link || null
      }));

      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notificationRows);

      if (insertError) throw insertError;

      return NextResponse.json({ success: true, count: users.length, message: "Disparo global concluído com sucesso." });
    } else {
      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: type || 'system',
          link: link || null
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, notification });
    }

  } catch (error: any) {
    console.error("Admin Send Notification Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

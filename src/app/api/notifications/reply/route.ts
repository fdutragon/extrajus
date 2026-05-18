import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// POST - Responder a uma notificação (Envia notificação de volta para o admin Felipe)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, originalTitle, replyMessage } = body;

    if (!notificationId || !originalTitle || !replyMessage) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const adminEmails = ['felipedutra@outlook.com'];
    const isSenderAdmin = adminEmails.includes(user.email || '');

    // 1. Obter os dados do remetente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const senderName = isSenderAdmin ? "Felipe (Admin)" : (profile?.full_name || "Usuário");
    const senderEmail = profile?.email || user.email || "recruta@extrajus.com";

    // 2. Buscar dados da notificação original para saber quem é o destinatário
    const { data: originalNotif, error: notifFetchError } = await supabaseAdmin
      .from('notifications')
      .select('user_id, title')
      .eq('id', notificationId)
      .single();

    if (notifFetchError || !originalNotif) {
      return NextResponse.json({ error: "Notificação/Thread original não encontrada." }, { status: 404 });
    }

    // 3. Inserir a réplica na tabela de histórico (notification_replies)
    const { error: replyInsertError } = await supabaseAdmin
      .from('notification_replies')
      .insert({
        notification_id: notificationId,
        sender_id: user.id,
        sender_name: senderName,
        sender_email: senderEmail,
        message: replyMessage
      });

    if (replyInsertError) throw replyInsertError;



    // 5. Marcar a notificação original como NÃO LIDA (read = false) e atualizar com a última mensagem
    // Isso aciona a bolinha vermelha no sino de notificações do destinatário e marca como negrito no Inbox!
    await supabaseAdmin
      .from('notifications')
      .update({ 
        read: false, 
        message: `${senderName}: ${replyMessage}`
      })
      .eq('id', notificationId);
    
    return NextResponse.json({ success: true, message: "Mensagem gravada no histórico e enviada com sucesso." });

  } catch (error: any) {
    console.error("Reply Endpoint Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

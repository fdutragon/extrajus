import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET - Listar todas as solicitações de forja
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

    // 1. Buscar todas as solicitações de forja
    const { data: requests, error: requestsError } = await supabaseAdmin
      .from('forge_requests')
      .select('id, user_id, description, status, created_at')
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    // 2. Buscar todos os perfis para fazer a junção em memória
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email');

    if (profilesError) throw profilesError;

    // Criar um mapa de perfis indexado pelo ID para acesso instantâneo (O(1))
    const profilesMap = new Map();
    profiles?.forEach((p: any) => {
      profilesMap.set(p.id, {
        full_name: p.full_name,
        email: p.email
      });
    });

    // 3. Mapear perfis para cada solicitação de forja
    const mappedRequests = (requests || []).map((req: any) => {
      const profile = profilesMap.get(req.user_id) || { full_name: "Recruta", email: "desconhecido" };
      return {
        ...req,
        profiles: profile
      };
    });

    return NextResponse.json({ success: true, requests: mappedRequests });

  } catch (error: any) {
    console.error("Admin Fetch Forge Requests Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Responder a uma solicitação de forja específica
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, userId, answer } = body;

    if (!requestId || !userId || !answer) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes (requestId, userId, answer)." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Atualizar o status da solicitação de forja para 'completed'
    const { error: updateError } = await supabaseAdmin
      .from('forge_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // 2. Injetar a notificação de resposta para o usuário correspondente
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title: "Forja Customizada Concluída! ⚔️",
        message: `Seu modelo de contrato solicitado foi analisado e forjado pelos nossos arquitetos jurídicos. Resposta: "${answer}"`,
        type: 'forge_response',
        link: '/arsenal'
      });

    if (notificationError) throw notificationError;

    return NextResponse.json({ success: true, message: "Solicitação respondida e usuário notificado com sucesso." });

  } catch (error: any) {
    console.error("Admin Respond Forge Request Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

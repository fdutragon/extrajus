import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json();
    const { contractId, sealingCode, email } = body;

    if (!contractId || !sealingCode) {
      return NextResponse.json({ error: 'ID do contrato e código são obrigatórios' }, { status: 400 })
    }

    const checkEmail = (email || '').toLowerCase().trim();
    const userEmail = (user?.email || '').toLowerCase().trim();

    if (!checkEmail && !userEmail) {
      return NextResponse.json({ error: 'Você precisa estar autenticado ou informar seu e-mail para selar o pacto.' }, { status: 401 })
    }

    // 1. Validar se o pacto existe e se o código está correto
    const { data: signature, error: sigError } = await supabase
      .from('signatures')
      .select('*')
      .eq('contract_id', contractId)
      .eq('protocolo', sealingCode) // O protocolo agora é o código de 6 dígitos
      .single();

    if (sigError || !signature) {
      return NextResponse.json({ error: 'Código de selamento inválido para este pacto.' }, { status: 403 });
    }

    if (signature.status === 'signed') {
      return NextResponse.json({ error: 'Este pacto já foi selado.' }, { status: 400 });
    }

    // 2. Verificar se o e-mail informado ou da sessão está na lista de signatários do pacto
    const matchingSigner = signature.signers.find((s: any) => {
      const signerEmail = (s.email || '').toLowerCase().trim();
      return (checkEmail && signerEmail === checkEmail) || (userEmail && signerEmail === userEmail);
    });

    if (!matchingSigner) {
      return NextResponse.json({ error: 'Este e-mail não faz parte da lista de signatários autorizados para este pacto.' }, { status: 403 });
    }

    const authorizedEmail = matchingSigner.email;

    // 3. Captura de Evidências Finais
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const timestamp = new Date().toISOString();

    // 4. Ritual de Selamento Final (Certificação)
    const finalManifesto = {
      ...signature.manifesto,
      signed_at: timestamp,
      evidence: {
        ip_address: ip,
        user_agent: userAgent,
        authorized_email: authorizedEmail
      },
      status: "COMPLETED_RITUAL"
    };

    // Criar o cliente Admin usando a Service Role Key para contornar restrições de RLS do signatário nos updates
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 5. Atualizar para Status SIGNED usando o cliente Admin
    const { error: updateError } = await supabaseAdmin
      .from('signatures')
      .update({
        status: 'signed',
        manifesto: finalManifesto
      })
      .eq('contract_id', contractId);

    if (updateError) throw updateError;

    // Atualizar o contrato também usando o cliente Admin
    const { error: contractUpdateError } = await supabaseAdmin
      .from('contracts')
      .update({ status: 'signed' })
      .eq('id', contractId);

    if (contractUpdateError) throw contractUpdateError;

    return NextResponse.json({ 
      success: true, 
      message: "Pacto selado com sucesso. A integridade digital foi garantida." 
    });

  } catch (error: any) {
    console.error("Final Sealing Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

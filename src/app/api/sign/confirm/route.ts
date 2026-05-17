import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { contractId, sealingCode } = await request.json();

    if (!contractId || !sealingCode) {
      return NextResponse.json({ error: 'ID do contrato e código são obrigatórios' }, { status: 400 })
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

    // 2. Verificar se o usuário logado está na lista de signatários do pacto
    const isSigner = signature.signers.some((s: any) => s.email.toLowerCase() === user.email?.toLowerCase());
    if (!isSigner) {
      return NextResponse.json({ error: 'Você não tem permissão para selar este pacto.' }, { status: 403 });
    }

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
        authorized_email: user.email
      },
      status: "COMPLETED_RITUAL"
    };

    // 5. Atualizar para Status SIGNED
    const { error: updateError } = await supabase
      .from('signatures')
      .update({
        status: 'signed',
        manifesto: finalManifesto
      })
      .eq('contract_id', contractId);

    if (updateError) throw updateError;

    // Atualizar o contrato também
    await supabase.from('contracts').update({ status: 'signed' }).eq('id', contractId);

    return NextResponse.json({ 
      success: true, 
      message: "Pacto selado com sucesso. A integridade digital foi garantida." 
    });

  } catch (error: any) {
    console.error("Final Sealing Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

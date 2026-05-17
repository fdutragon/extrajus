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
      return NextResponse.json({ error: 'Você precisa estar autenticado para selar o pacto.' }, { status: 401 })
    }

    // [SEGURANÇA] Se o usuário está logado, ele SÓ pode assinar com o próprio e-mail da sessão.
    // Isso evita que alguém assine por outro sabendo o código e o e-mail.
    if (user && checkEmail && userEmail !== checkEmail) {
      return NextResponse.json({ error: 'Tentativa de usurpação de identidade detectada. Você só pode selar com seu próprio e-mail autenticado.' }, { status: 403 });
    }

    const emailToVerify = userEmail || checkEmail;

    // 1. Validar se o pacto existe e se o código está correto
    const { data: signature, error: sigError } = await supabase
      .from('signatures')
      .select('*')
      .eq('contract_id', contractId)
      .eq('protocolo', sealingCode)
      .single();

    if (sigError || !signature) {
      return NextResponse.json({ error: 'Código de selamento inválido para este pacto.' }, { status: 403 });
    }

    if (signature.status === 'signed') {
      return NextResponse.json({ error: 'Este pacto já foi totalmente selado.' }, { status: 400 });
    }

    // 2. Verificar se o e-mail está na lista de signatários e se já não assinou
    const matchingSignerIndex = signature.signers.findIndex((s: any) => {
      const signerEmail = (s.email || '').toLowerCase().trim();
      return signerEmail === emailToVerify;
    });

    if (matchingSignerIndex === -1) {
      return NextResponse.json({ error: 'Este e-mail não faz parte da lista de signatários autorizados para este pacto.' }, { status: 403 });
    }

    if (signature.signers[matchingSignerIndex].signed) {
      return NextResponse.json({ error: 'Você já selou este pacto anteriormente.' }, { status: 400 });
    }

    // 3. Captura de Evidências Finais
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const timestamp = new Date().toISOString();

    const evidence = {
      ip_address: ip,
      user_agent: userAgent,
      authorized_email: emailToVerify
    };

    // 4. Ritual de Selamento Incremental
    const updatedSigners = [...signature.signers];
    updatedSigners[matchingSignerIndex] = {
      ...updatedSigners[matchingSignerIndex],
      signed: true,
      signed_at: timestamp,
      evidence
    };

    const allSigned = updatedSigners.every((s: any) => s.signed);
    const finalStatus = allSigned ? 'signed' : 'partially_signed';

    const finalManifesto = {
      ...signature.manifesto,
      last_activity: timestamp,
      latest_evidence: evidence,
      version: "3.0.2-INCREMENTAL"
    };

    // Criar o cliente Admin usando a Service Role Key
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 5. Atualizar Registro de Assinatura
    const { error: updateError } = await supabaseAdmin
      .from('signatures')
      .update({
        status: finalStatus,
        signers: updatedSigners,
        manifesto: finalManifesto
      })
      .eq('contract_id', contractId);

    if (updateError) throw updateError;

    // Atualizar o contrato apenas se todos assinaram
    if (allSigned) {
      const { error: contractUpdateError } = await supabaseAdmin
        .from('contracts')
        .update({ status: 'signed' })
        .eq('id', contractId);

      if (contractUpdateError) throw contractUpdateError;
    } else {
      // Opcionalmente marcar contrato como parcialmente assinado
      await supabaseAdmin
        .from('contracts')
        .update({ status: 'partially_signed' })
        .eq('id', contractId);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Pacto selado com sucesso. A integridade digital foi garantida." 
    });

  } catch (error: any) {
    console.error("Final Sealing Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

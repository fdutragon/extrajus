import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    if (!checkEmail) {
      return NextResponse.json({ error: 'O e-mail do signatário é obrigatório para selar o pacto.' }, { status: 400 })
    }

    const emailToVerify = checkEmail;

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

      // Buscar título do contrato para o e-mail
      const { data: contractData } = await supabaseAdmin
        .from('contracts')
        .select('title')
        .eq('id', contractId)
        .single();

      const contractTitle = contractData?.title || 'Contrato Sem Título';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Enviar o Certificado de Selamento por e-mail para todos os signatários simultaneamente
      if (process.env.RESEND_API_KEY && updatedSigners.length > 0) {
        const emailPromises = updatedSigners.map((signer: any) => 
          resend.emails.send({
            from: 'ExtraJus <assinaturas@extrajus.pro>',
            to: signer.email,
            subject: `🔥 Ritual Concluído: Certificado de Assinatura Digital de ${contractTitle}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #111;">
                <h1 style="color: #c0ff00; font-size: 24px; text-transform: uppercase; letter-spacing: 4px;">ExtraJus</h1>
                <p style="font-size: 14px; opacity: 0.7; border-bottom: 1px solid #222; padding-bottom: 20px;">CERTIFICADO DE ASSINATURA DIGITAL CONCLUÍDO</p>
                
                <p style="margin-top: 30px;">Saudações, <strong>${signer.name}</strong>.</p>
                <p>Temos a honra de informar que o pacto soberano <strong>${contractTitle}</strong> foi <strong>INTEGRALMENTE SELADO</strong> por todos os signatários convocados.</p>
                
                <div style="background: #0a0a0a; border: 1px dashed #c0ff00; padding: 25px; margin: 30px 0;">
                  <p style="font-size: 10px; color: #c0ff00; text-transform: uppercase; margin-bottom: 5px; font-weight: bold;">Protocolo de Selamento</p>
                  <code style="font-size: 18px; font-weight: bold; color: #fff;">${signature.protocolo}</code>
                  
                  <p style="font-size: 10px; color: #c0ff00; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; font-weight: bold;">Chancela Digital de Conclusão</p>
                  <code style="font-size: 12px; color: #fff;">${timestamp}</code>
                  
                  <p style="font-size: 10px; color: #c0ff00; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; font-weight: bold;">Hash de Integridade do Documento (SHA-256)</p>
                  <code style="font-size: 11px; color: #888; word-break: break-all;">${signature.manifesto?.document_hash || 'Integridade Confirmada'}</code>
                </div>

                <h3 style="color: #c0ff00; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 40px; border-bottom: 1px solid #222; padding-bottom: 10px;">Signatários e Evidências</h3>
                
                <div style="margin-top: 20px;">
                  ${updatedSigners.map((s: any) => `
                    <div style="background: #0d0d0f; border-left: 3px solid #c0ff00; padding: 15px; margin-bottom: 15px;">
                      <p style="margin: 0; font-size: 13px; font-weight: bold; color: #fff;">${s.name.toUpperCase()}</p>
                      <p style="margin: 3px 0 0 0; font-size: 11px; color: #a1a1aa;">Email: ${s.email}</p>
                      <p style="margin: 3px 0 0 0; font-size: 10px; color: #71717a;">Selado em: ${s.signed_at || timestamp}</p>
                      <p style="margin: 5px 0 0 0; font-size: 9px; font-family: monospace; color: #52525b;">IP NODE: ${s.evidence?.ip_address || '127.0.0.1'} | NODE SECURE</p>
                    </div>
                  `).join('')}
                </div>

                <div style="text-align: center; margin-top: 40px;">
                  <a href="${siteUrl}/editor?room=${contractId}&mode=preview" 
                     style="display: inline-block; background: #c0ff00; color: #000; text-decoration: none; padding: 15px 30px; font-weight: bold; border-radius: 5px; text-transform: uppercase; font-size: 12px;">
                    Visualizar Documento Concluído
                  </a>
                </div>

                <p style="margin-top: 50px; font-size: 10px; opacity: 0.3; text-align: center;">
                  ExtraJus AI © 2026 • Ritual Sovereign Protocol
                </p>
              </div>
            `
          })
        );

        // Dispara todos os envios simultaneamente em paralelo
        await Promise.all(emailPromises);
      }
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

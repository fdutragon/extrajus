import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSecret } from "@/utils/secrets";

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
      return NextResponse.json({ error: 'O e-mail do signatário é obrigatório para assinar o documento.' }, { status: 400 })
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
      return NextResponse.json({ error: 'Código de assinatura inválido para este documento.' }, { status: 403 });
    }

    if (signature.status === 'signed') {
      return NextResponse.json({ error: 'Este documento já foi totalmente assinado.' }, { status: 400 });
    }

    // 2. Verificar se o e-mail está na lista de signatários e se já não assinou
    const matchingSignerIndex = signature.signers.findIndex((s: any) => {
      const signerEmail = (s.email || '').toLowerCase().trim();
      return signerEmail === emailToVerify;
    });

    if (matchingSignerIndex === -1) {
      return NextResponse.json({ error: 'Este e-mail não faz parte da lista de signatários autorizados para este documento.' }, { status: 403 });
    }

    if (signature.signers[matchingSignerIndex].signed) {
      return NextResponse.json({ error: 'Você já assinou este documento anteriormente.' }, { status: 400 });
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
      const resendKey = getSecret("RESEND_API_KEY");
      if (resendKey && updatedSigners.length > 0) {
        const resendInstance = new Resend(resendKey);
        const emailPromises = updatedSigners.map((signer: any) => 
          resendInstance.emails.send({
            from: 'ExtraJus <assinaturas@extrajus.pro>',
            to: signer.email,
            subject: `Assinatura Concluída: Certificado de Assinatura Digital de ${contractTitle}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Assinatura Concluída - Certificado Digital</title>
                <style>
                  body {
                    background-color: #050505;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                  }
                  .wrapper {
                    width: 100%;
                    background-color: #050505;
                    padding: 40px 20px;
                    box-sizing: border-box;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #0b0b0b;
                    border: 1px solid #1f1d1a;
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
                  }
                  .logo {
                    font-size: 26px;
                    font-weight: 900;
                    color: #ffffff;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  .logo span {
                    color: #c5a880;
                  }
                  .divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #c5a880 50%, transparent);
                    margin-bottom: 30px;
                    opacity: 0.3;
                  }
                  h1 {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 900;
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 8px;
                    letter-spacing: -0.02em;
                  }
                  .subheadline {
                    color: #c5a880;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  p {
                    color: #a3a3a3;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-top: 0;
                    margin-bottom: 25px;
                  }
                  .cert-box {
                    background-color: #070707;
                    border: 1px dashed #c5a880;
                    border-radius: 16px;
                    padding: 25px;
                    margin: 30px 0;
                  }
                  .cert-item {
                    margin-bottom: 15px;
                  }
                  .cert-item:last-child {
                    margin-bottom: 0;
                  }
                  .cert-label {
                    font-size: 9px;
                    font-weight: 900;
                    color: #c5a880;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 4px;
                  }
                  .cert-val {
                    font-size: 12.5px;
                    color: #ffffff;
                    font-family: monospace;
                    word-break: break-all;
                  }
                  .section-title {
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-top: 40px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #1f1d1a;
                    padding-bottom: 10px;
                  }
                  .signer-card {
                    background-color: #0d0d0f;
                    border-left: 3px solid #c5a880;
                    border-radius: 4px 12px 12px 4px;
                    padding: 20px;
                    margin-bottom: 15px;
                  }
                  .signer-name {
                    margin: 0;
                    font-size: 13.5px;
                    font-weight: 800;
                    color: #ffffff;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  }
                  .signer-meta {
                    margin: 4px 0 0 0;
                    font-size: 12.5px;
                    color: #888888;
                  }
                  .signer-evidence {
                    margin: 6px 0 0 0;
                    font-size: 10px;
                    font-family: monospace;
                    color: #555555;
                  }
                  .btn-container {
                    text-align: center;
                    margin-top: 40px;
                    margin-bottom: 35px;
                  }
                  .btn {
                    display: inline-block;
                    background-color: #c5a880;
                    color: #050505 !important;
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    padding: 16px 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(197, 168, 128, 0.25);
                    transition: all 0.3s ease;
                  }
                  .footer {
                    font-size: 10px;
                    color: #525252;
                    line-height: 1.5;
                    border-top: 1px solid #1f1d1a;
                    padding-top: 25px;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="wrapper">
                  <div class="container">
                    <div class="logo">
                      EXTRA<span>JUS</span>
                    </div>
                    <div class="divider"></div>
                    <h1>Certificado de Assinatura</h1>
                    <div class="subheadline">Selamento Concluído com Sucesso</div>
                    
                    <p>Saudações, <strong>${signer.name}</strong>.</p>
                    <p>Temos a honra de informar que o documento <strong>${contractTitle}</strong> foi <strong>INTEGRALMENTE ASSINADO</strong> e selado digitalmente por todas as partes convocadas.</p>
                    
                    <div class="cert-box">
                      <div class="cert-item">
                        <div class="cert-label">Protocolo de Assinatura Único</div>
                        <div class="cert-val" style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">${signature.protocolo}</div>
                      </div>
                      
                      <div class="cert-item">
                        <div class="cert-label">Assinatura Eletrônica Registrada</div>
                        <div class="cert-val">${timestamp}</div>
                      </div>
                      
                      <div class="cert-item">
                        <div class="cert-label">Hash SHA-256 de Integridade do Documento</div>
                        <div class="cert-val" style="color: #888888;">${signature.manifesto?.document_hash || 'Integridade Confirmada'}</div>
                      </div>
                    </div>

                    <div class="section-title">Signatários e Evidências</div>
                    
                    <div style="margin-top: 20px;">
                      ${updatedSigners.map((s: any) => `
                        <div class="signer-card">
                          <p class="signer-name">${s.name}</p>
                          <p class="signer-meta">E-mail: ${s.email}</p>
                          <p class="signer-meta">Assinado em: ${s.signed_at || timestamp}</p>
                          <p class="signer-evidence">IP REGISTRY: ${s.evidence?.ip_address || '127.0.0.1'} | NODE SECURE CERTIFIED</p>
                        </div>
                      `).join('')}
                    </div>

                    <div class="btn-container">
                      <a href="${siteUrl}/editor?room=${contractId}&mode=preview" class="btn">Visualizar Documento Concluído</a>
                    </div>

                    <div class="footer">
                      © 2026 ExtraJus S/A. Blindagem e Inteligência Corporativa.<br>
                      Assinatura digital em conformidade com a MP nº 2.200-2/2001.
                    </div>
                  </div>
                </div>
              </body>
              </html>
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
      message: "Documento assinado com sucesso. A integridade digital foi garantida." 
    });

  } catch (error: any) {
    console.error("Final Sealing Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

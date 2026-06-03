import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSecret } from "@/utils/secrets";

interface Signer {
  name: string;
  email: string;
}

interface SignRequest {
  contractId: string;
  title?: string;
  content: string;
  signers: Signer[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { contractId, title, content, signers } = await request.json() as SignRequest;

    if (!contractId) {
      return NextResponse.json({ error: 'ID do contrato é obrigatório' }, { status: 400 })
    }

    // Validar e descontar créditos de Sinapses para disparo de assinatura (4 Sinapses)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    const currentCredits = profile?.credits ?? 0;
    const signatureCost = 50;

    if (currentCredits < signatureCost) {
      return NextResponse.json({ 
        error: `Saldo de Sinapses insuficiente para enviar assinaturas. Este fluxo exige ${signatureCost} Sinapses, mas você possui apenas ${currentCredits}.` 
      }, { status: 403 });
    }

    // Deduzir créditos e registrar auditoria no ledger
    await supabase
      .from('profiles')
      .update({ credits: currentCredits - signatureCost })
      .eq('id', user.id);

    await supabase
      .from('credit_ledger')
      .insert({
        user_id: user.id,
        amount: -signatureCost,
        action_type: 'signature_sent',
        reference_id: contractId
      });

    // Buscar perfil do criador do contrato no banco para pegar o nome oficial
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const creatorEmail = (user.email || '').toLowerCase().trim();
    const creatorName = creatorProfile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Criador do Pacto";

    // Verificar se o criador já foi explicitamente adicionado
    const hasCreator = signers.some(s => (s.email || '').toLowerCase().trim() === creatorEmail);
    const finalSigners = [...signers];

    if (!hasCreator && creatorEmail) {
      finalSigners.unshift({
        name: creatorName,
        email: creatorEmail
      });
    }

    // 1. Geração de Código de Selamento Único (6 Dígitos) Inviolável
    const sealingCode = crypto.randomInt(100000, 999999).toString();
    
    const timestamp = new Date().toISOString();
    const documentHash = crypto
      .createHash('sha256')
      .update(content + (title || ''))
      .digest('hex');

    // 2. Registrar/Atualizar Registro de Assinatura como PENDENTE
    const { error: sigError } = await supabase.from('signatures').upsert({
      contract_id: contractId,
      status: 'pending',
      signers: finalSigners,
      protocolo: sealingCode,
      manifesto: { 
        invited_at: timestamp,
        document_hash: documentHash,
        version: "3.0.1-SECURE"
      }
    }, { onConflict: 'contract_id' });

    if (sigError) throw sigError;

    // Atualizar status do contrato
    await supabase.from('contracts').update({ status: 'pending' }).eq('id', contractId);

    // 3. Enviar Convocação via Resend (Bombardeio Paralelo)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const resendKey = getSecret("RESEND_API_KEY");
    if (resendKey && finalSigners.length > 0) {
      const resendInstance = new Resend(resendKey);
      const emailPromises = finalSigners.map(signer => 
        resendInstance.emails.send({
          from: 'SmartDoc <assinaturas@smartdoc.work>',
          to: signer.email,
          subject: `📜 Convocação para Assinatura: ${title || 'Novo Contrato'}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Convocação para Assinatura</title>
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
                .code-box {
                  background-color: #070707;
                  border: 1px dashed #c5a880;
                  border-radius: 16px;
                  padding: 30px;
                  margin: 30px 0;
                  text-align: center;
                }
                .code-label {
                  font-size: 9px;
                  font-weight: 900;
                  color: #c5a880;
                  text-transform: uppercase;
                  letter-spacing: 0.2em;
                  margin-bottom: 10px;
                }
                .code-val {
                  font-size: 32px;
                  font-weight: 900;
                  letter-spacing: 10px;
                  color: #ffffff;
                  margin: 0;
                  font-family: monospace;
                }
                .btn-container {
                  text-align: center;
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
                  <h1>Convocação de Assinatura</h1>
                  <div class="subheadline">Protocolo de Segurança Ativo</div>
                  
                  <p>Saudações, <strong>${signer.name}</strong>.</p>
                  <p>Um novo documento corporativo aguarda a sua assinatura digital: <strong>${title || 'Sem Título'}</strong>.</p>
                  
                  <div class="code-box">
                    <div class="code-label">Seu Código de Assinatura Único</div>
                    <div class="code-val">${sealingCode}</div>
                  </div>

                  <p>
                    Para visualizar o documento na íntegra e realizar a assinatura, clique no botão abaixo. Você poderá revisar os termos em modo de leitura segura antes de validar com o seu código de selamento.
                  </p>

                  <div class="btn-container">
                    <a href="${siteUrl}/editor?room=${contractId}&mode=preview" class="btn">Visualizar e Assinar</a>
                  </div>

                  <div class="footer">
                    © 2026 SmartDoc S/A. Blindagem e Inteligência Corporativa.<br>
                    Secure Signature Protocol // Evidências Criptográficas ICP-Brasil.
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        })
      );

      // Dispara todas as convocações simultaneamente
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true, message: "Convites enviados e contrato em estado pendente." });

  } catch (error: any) {
    console.error("SmartDoc Signature API Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

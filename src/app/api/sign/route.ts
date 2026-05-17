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
          from: 'ExtraJus <assinaturas@extrajus.pro>',
          to: signer.email,
          subject: `📜 Convocação para Selamento: ${title || 'Novo Pacto'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #111;">
              <h1 style="color: #c0ff00; font-size: 24px; text-transform: uppercase; letter-spacing: 4px;">ExtraJus</h1>
              <p style="font-size: 14px; opacity: 0.7; border-bottom: 1px solid #222; padding-bottom: 20px;">RITUAL DE ASSINATURA DIGITAL</p>
              
              <p style="margin-top: 30px;">Saudações, <strong>${signer.name}</strong>.</p>
              <p>Um novo pacto soberano aguarda seu selamento: <strong>${title || 'Sem Título'}</strong>.</p>
              
              <div style="background: #0a0a0a; border: 1px dashed #c0ff00; padding: 30px; margin: 30px 0; text-align: center;">
                <p style="font-size: 10px; color: #c0ff00; text-transform: uppercase; margin-bottom: 10px;">Seu Código de Selamento</p>
                <code style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #fff;">${sealingCode}</code>
              </div>

              <p style="font-size: 13px; line-height: 1.6; opacity: 0.8;">
                Para visualizar e selar este pacto, clique no link abaixo. Você poderá ver o documento completo em modo de somente leitura e inserir seu código para assinar digitalmente.
              </p>

              <a href="${siteUrl}/editor?room=${contractId}&mode=preview" 
                 style="display: inline-block; background: #c0ff00; color: #000; text-decoration: none; padding: 15px 30px; font-weight: bold; border-radius: 5px; margin-top: 20px; text-transform: uppercase; font-size: 12px;">
                Visualizar e Selar Pacto
              </a>

              <p style="margin-top: 50px; font-size: 10px; opacity: 0.3; text-align: center;">
                ExtraJus AI © 2026 • Ritual Sovereign Protocol
              </p>
            </div>
          `
        })
      );

      // Dispara todas as convocações simultaneamente
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true, message: "Convites enviados e pacto em estado pendente." });

  } catch (error: any) {
    console.error("ExtraJus Signature API Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

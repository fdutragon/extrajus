import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getSecret } from "@/utils/secrets";
import { sendTelegramNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const bodyClone = request.clone();
    const payload = await request.json();
    console.log("[Webhook GG Pix] Recebido:", payload);

    // Validação de segurança e origem do Webhook
    const signature = request.headers.get("X-GG-Signature") || request.headers.get("x-gg-signature");
    const authorization = request.headers.get("Authorization") || request.headers.get("authorization");

    const secret = process.env.GGPIX_WEBHOOK_SECRET || process.env.GGPIX_API_KEY || "";

    console.log("[Webhook GG Pix Debug] Dados de validação:", {
      signature,
      authorization: authorization ? `${authorization.substring(0, 15)}...` : null,
      hasSecret: !!secret,
      secretLength: secret.length,
      secretPrefix: secret ? secret.substring(0, 8) : "",
      usingFallbackKey: !process.env.GGPIX_WEBHOOK_SECRET && !!process.env.GGPIX_API_KEY
    });

    if (secret) {
      const isSimpleToken = authorization === secret || authorization === `Bearer ${secret}` || signature === secret;
      
      let isHmacValid = false;
      let computedHash = "";
      let bodyText = "";

      if (signature && !isSimpleToken) {
        try {
          bodyText = await bodyClone.text();
          computedHash = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
          isHmacValid = signature === computedHash;
          
          console.log("[Webhook GG Pix Debug] HMAC processado:", {
            isHmacValid,
            signature,
            computedHash,
            bodyLength: bodyText.length
          });
        } catch (err: any) {
          console.error("[Webhook GG Pix Debug] Falha ao ler stream ou computar HMAC:", err.message);
        }
      }

      console.log("[Webhook GG Pix Debug] Status final de autenticação:", {
        isSimpleToken,
        isHmacValid
      });

      if (!isSimpleToken && !isHmacValid) {
        console.warn("[Webhook GG Pix] Bloqueada tentativa de requisição falsa sem assinatura válida.");
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const { status, externalId, amount } = payload;

    if (status === "COMPLETE" && externalId) {
      // Criar o cliente Admin usando a Service Role Key para contornar RLS no webhook
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Buscar a transação pendente
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("user_id, status")
        .eq("external_id", externalId)
        .single();

      if (fetchError || !transaction) {
        console.error("[Webhook] Transação não encontrada:", externalId);
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
      }

      // Evitar processamento duplicado
      if (transaction.status === "COMPLETE") {
        return NextResponse.json({ success: true, message: "Já processado" });
      }

      // 2. Atualizar status da transação
      const { error: updateTxError } = await supabase
        .from("transactions")
        .update({ status: "COMPLETE" })
        .eq("external_id", externalId);

      if (updateTxError) throw updateTxError;

      // Notificar o Cadelo via Telegram
      const formattedAmount = (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      await sendTelegramNotification(`💰 <b>VENDA CONFIRMADA!</b>\n\n💵 Valor: <b>${formattedAmount}</b>\n🆔 ID: <code>${externalId}</code>\n👤 Usuário: <code>${transaction.user_id}</code>\n🚀 O império está crescendo!`);

      // Intercept paydoc flows
      if (externalId.startsWith("paydoc_")) {
        const docId = externalId.replace("paydoc_", "");
        
        // Destrava o documento
        const { error: updateDocError } = await supabase
          .from("documents")
          .update({ is_paid: true })
          .eq("id", docId);

        if (updateDocError) console.error("Erro ao destravar documento:", updateDocError);

        // Também atualiza o status na tabela de contratos do usuário
        const { error: updateContractError } = await supabase
          .from("contracts")
          .update({ status: "draft" })
          .eq("id", docId);

        if (updateContractError) console.error("Erro ao destravar contrato correspondente:", updateContractError);

        // Buscar dados do documento para o envio do e-mail via Resend
        try {
          const { data: docData } = await supabase
            .from("documents")
            .select("title, content")
            .eq("id", docId)
            .single();

          const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id);
          
          const resendKey = getSecret("RESEND_API_KEY") || process.env.RESEND_API_KEY;
          
          if (resendKey && userData?.user?.email && docData?.content) {
            const resendInstance = new Resend(resendKey);
            
            const emailHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #09090b;
                    color: #f4f4f5;
                    margin: 0;
                    padding: 40px 20px;
                  }
                  .container {
                    max-width: 650px;
                    margin: 0 auto;
                    background-color: #09090b;
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                  }
                  .logo {
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  .logo h2 {
                    color: #8b5cf6;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    margin: 0;
                    text-transform: uppercase;
                  }
                  .greeting {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #ffffff;
                  }
                  .message {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #a1a1aa;
                    margin-bottom: 30px;
                  }
                  .document-box {
                    background-color: #ffffff;
                    color: #18181b;
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 30px;
                    border: 1px solid rgba(0,0,0,0.05);
                    max-height: 500px;
                    overflow-y: auto;
                    font-family: 'Cambria', 'Georgia', serif;
                  }
                  .document-box h1 {
                    text-align: center;
                    font-size: 18px;
                    color: #000000;
                    margin-bottom: 20px;
                  }
                  .document-box p {
                    font-size: 11px;
                    line-height: 1.5;
                    margin-bottom: 10px;
                    text-align: justify;
                  }
                  .footer {
                    text-align: center;
                    font-size: 11px;
                    color: #52525b;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 20px;
                    margin-top: 30px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <h2>ExtraJus</h2>
                  </div>
                  <div class="greeting">Olá, ${userData.user.user_metadata?.full_name || 'Cliente'}!</div>
                  <div class="message">
                    Seu pagamento foi confirmado com sucesso. Como parte do seu desbloqueio de documento, aqui está a minuta oficial do seu <strong>${docData.title || 'Documento ExtraJus'}</strong> em formato digital.
                    <br><br>
                    Você pode visualizar o texto completo abaixo ou copiá-lo diretamente para uso. Caso precise realizar alterações futuras no editor ou fazer novas exportações em formato DOCX, você poderá fazê-las na plataforma ExtraJus.
                  </div>
                  <div class="document-box">
                    ${docData.content}
                  </div>
                  <div class="footer">
                    Este é um e-mail automático enviado pela ExtraJus. Por favor, não responda a esta mensagem.
                    <br>
                    © ${new Date().getFullYear()} ExtraJus. Todos os direitos reservados.
                  </div>
                </div>
              </body>
              </html>
            `;

            let sendResult = await resendInstance.emails.send({
              from: "ExtraJus AI <documentos@extrajus.pro>",
              to: userData.user.email,
              subject: `⚔️ Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
              html: emailHtml
            });

            if (sendResult.error) {
              console.warn(`[Webhook] Falha ao enviar com remetente oficial (Código ${sendResult.error.statusCode}). Tentando fallback sandbox...`);
              sendResult = await resendInstance.emails.send({
                from: "ExtraJus AI <onboarding@resend.dev>",
                to: userData.user.email,
                subject: `⚔️ [Sandbox] Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
                html: emailHtml
              });
              
              if (sendResult.error) {
                console.error("[Webhook] Falha no fallback do Resend:", sendResult.error);
              } else {
                console.log(`[Webhook] E-mail enviado com remetente sandbox (onboarding) para ${userData.user.email}`);
              }
            } else {
              console.log(`[Webhook] E-mail com contrato enviado com sucesso para ${userData.user.email}`);
            }
          }
        } catch (emailErr: any) {
          console.error("[Webhook] Erro no envio de e-mail com contrato:", emailErr.message);
        }

        console.log(`[Webhook] Documento e Contrato ${docId} destravados com sucesso para o usuário ${transaction.user_id}`);
        return NextResponse.json({ success: true });
      }

      // 3. Adicionar créditos ao usuário recalibrado (fluxo padrão de recarga)
      let creditsToAdd = Math.floor(amount / 13);
      const amountCents = amount; // amount vem em centavos do GG Pix
      if (amountCents === 1990) {
        creditsToAdd = 150;
      } else if (amountCents === 4990) {
        creditsToAdd = 500;
      } else if (amountCents === 9990) {
        creditsToAdd = 1200;
      }
      const { error: updateProfileError } = await supabase.rpc('increment_credits', {
        user_id: transaction.user_id,
        amount: creditsToAdd
      });

      // Se a RPC não existir, fazemos via select/update (menos seguro contra race conditions, mas funciona)
      if (updateProfileError) {
         console.warn("[Webhook] RPC 'increment_credits' falhou, tentando fallback manual...");
         const { data: profile } = await supabase
           .from('profiles')
           .select('credits')
           .eq('id', transaction.user_id)
           .single();
         
         const newCredits = (profile?.credits || 0) + creditsToAdd;
         
         await supabase
           .from('profiles')
           .update({ credits: newCredits })
           .eq('id', transaction.user_id);
      }

      console.log(`[Webhook] Sucesso: ${creditsToAdd} créditos adicionados ao usuário ${transaction.user_id}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Status não é COMPLETE ou externalId ausente" });

  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

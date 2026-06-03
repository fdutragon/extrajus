import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getSecret } from "@/utils/secrets";
import { sendTelegramNotification } from "@/lib/notifications";

// Função para compilar o conteúdo em formato HTML compatível com o Word (.docx)
function compileWordHtml(title: string, content: string): string {
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title || 'Documento SmartDoc'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 72.0pt 72.0pt 72.0pt 72.0pt; /* Margens de 2.54cm (padrão) */
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
          font-size: 12.0pt;
          line-height: 1.6;
          color: #000000;
        }
        h1 {
          font-size: 16.0pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin-top: 12.0pt;
          margin-bottom: 24.0pt;
          color: #000000;
        }
        h2 {
          font-size: 13.0pt;
          font-weight: bold;
          margin-top: 18.0pt;
          margin-bottom: 6.0pt;
          color: #000000;
        }
        p {
          text-align: justify;
          margin-bottom: 12.0pt;
          line-height: 1.6;
        }
        p:not([data-node-text-align="center"]):not([data-node-text-align="right"]):not(.align-center):not(.align-right):not(.no-indent) {
          text-indent: 3.5em;
        }
        p.dense-metadata {
          margin-bottom: 2.0pt;
        }
        /* Suporte completo à estrutura de Legal Nodes do SmartDoc */
        .legal-node {
          margin-bottom: 12.0pt;
          text-align: justify;
        }
        .legal-node-level-1 {
          font-weight: bold;
          font-size: 13.0pt;
          margin-top: 18.0pt;
          color: #000000;
        }
        .legal-node-level-2 {
          margin-left: 24.0pt;
        }
        .legal-node-level-3 {
          margin-left: 48.0pt;
        }
        .legal-node-level-4 {
          margin-left: 72.0pt;
        }
        .legal-node-counter {
          font-weight: bold;
          margin-right: 8.0pt;
          display: inline-block;
        }
        .legal-node-content {
          display: inline;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12.0pt;
          margin-bottom: 12.0pt;
        }
        td, th {
          border: 1.0pt solid #000000;
          padding: 8.0pt 10.0pt;
          text-align: left;
          vertical-align: top;
        }
        strong, b {
          font-weight: bold;
        }
        em, i {
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${content}
      </div>
    </body>
    </html>
  `;
}

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

      // 1 e 2. Operação Atômica: Atualizar APENAS se for PENDING e retornar a linha
      const { data: updatedTransactions, error: updateTxError } = await supabase
        .from("transactions")
        .update({ status: "COMPLETE" })
        .eq("external_id", externalId)
        .eq("status", "PENDING")
        .select("user_id, status");

      if (updateTxError) throw updateTxError;

      if (!updatedTransactions || updatedTransactions.length === 0) {
        console.log(`[Webhook] Transação não encontrada como PENDING ou já processada: ${externalId}`);
        return NextResponse.json({ success: true, message: "Já processado ou inexistente" });
      }

      const transaction = updatedTransactions[0];

      // Notificar o Cadelo via Telegram
      const formattedAmount = (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      await sendTelegramNotification(`#SISTEMA_ORDEM 💰 <b>VENDA CONFIRMADA!</b>\n\n💵 Valor: <b>${formattedAmount}</b>\n🆔 ID: <code>${externalId}</code>\n👤 Usuário: <code>${transaction.user_id}</code>\n🚀 O império está crescendo!`);

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
          console.log(`\n\n--- [Webhook Email Debug] Iniciando fluxo para docId: ${docId}, userId: ${transaction.user_id} ---`);
          const { data: docData } = await supabase
            .from("documents")
            .select("title, content")
            .eq("id", docId)
            .single();

          const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id);
          
          console.log(`[Webhook Email Debug] docData encontrado: ${!!docData}, userData encontrado: ${!!userData}, email: ${userData?.user?.email}`);
          
          const resendKey = getSecret("RESEND_API_KEY") || process.env.RESEND_API_KEY;
          console.log(`[Webhook Email Debug] resendKey configurada: ${!!resendKey}`);
          
          if (resendKey && userData?.user?.email && docData?.content) {
            console.log(`[Webhook Email Debug] Condições atendidas. Gerando DOCX e HTML...`);
            const resendInstance = new Resend(resendKey);
            const { generateEmailTemplate } = await import('@/utils/email-template');
            const emailHtml = generateEmailTemplate(userData.user.user_metadata?.full_name, docData.title);

            const { generateDocxBase64 } = await import('@/utils/docx');
            console.log(`[Webhook Email Debug] Utilitário docx importado, gerando base64...`);
            const docxBase64 = await generateDocxBase64(docData.title, docData.content);
            const filename = `${(docData.title || 'documento').replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;
            console.log(`[Webhook Email Debug] DOCX gerado com sucesso. Tamanho: ${docxBase64.length} caracteres.`);

            const isDev = process.env.NODE_ENV === "development" || (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.includes("localhost"));
            const toEmail = userData.user.email;
            const fromEmail = "SmartDoc AI <contato@smartdoc.work>"; 
            const emailSubject = isDev 
              ? `⚔️ [DEV DEBUG] Documento liberado (Original: ${userData.user.email}) - ${docData.title || 'Contrato'}`
              : `Seu documento SmartDoc está liberado: ${docData.title || 'Contrato'}`;

            console.log(`[Webhook Email Debug] Disparando para a API da Resend... De: ${fromEmail} Para: ${toEmail}`);
            const sendResult = await resendInstance.emails.send({
              from: fromEmail,
              to: toEmail,
              subject: emailSubject,
              html: emailHtml,
              attachments: [
                {
                  filename,
                  content: docxBase64,
                }
              ]
            });

            if (sendResult.error) {
              console.error("[Webhook Email Debug] Falha retoranda pela Resend:", sendResult.error);
            } else {
              console.log(`[Webhook Email Debug] E-mail ACEITO pela Resend! ID: ${sendResult.data?.id}`);
            }
          } else {
            console.warn(`[Webhook Email Debug] ABORTADO. Faltou alguma coisa:`, {
               hasResendKey: !!resendKey, 
               hasEmail: !!userData?.user?.email, 
               hasContent: !!docData?.content 
            });
          }
          console.log(`--- [Webhook Email Debug] Fim do bloco ---\n\n`);
        } catch (emailErr: any) {
          console.error("[Webhook Email Debug] Crash total no bloco de e-mail:", emailErr.message, emailErr.stack);
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

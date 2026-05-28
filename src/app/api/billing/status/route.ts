import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSecret } from "@/utils/secrets";

// Função para compilar o conteúdo em formato HTML compatível com o Word (.docx)
function compileWordHtml(title: string, content: string): string {
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title || 'Documento ExtraJus'}</title>
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
        /* Suporte completo à estrutura de Legal Nodes do ExtraJus */
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get("externalId");

    if (!externalId) {
      return NextResponse.json({ error: "ID externo ausente" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isPayDoc = externalId.startsWith("paydoc_");

    if (!user && !isPayDoc) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabaseAdmin
      .from("transactions")
      .select("status, amount_cents, user_id")
      .eq("external_id", externalId);

    if (!isPayDoc) {
      query = query.eq("user_id", user?.id);
    }

    const { data: transaction, error } = await query.single();

    if (error || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    let actionLink: string | undefined = undefined;
    let emailAddress: string | undefined = undefined;
    let tempPassword: string | undefined = undefined;

    // Se o pagamento foi concluído e for um desbloqueio de documento, extrai credenciais, envia e-mail via Resend e gera magiclink
    if (transaction.status === "COMPLETE" && isPayDoc) {
      try {
        const docId = externalId.replace("paydoc_", "");
        
        // 1. Buscar dados do documento e verificar status de pagamento para evitar duplicidade de e-mails
        const { data: docData } = await supabaseAdmin
          .from("documents")
          .select("title, content, is_paid")
          .eq("id", docId)
          .single();

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        
        if (userData?.user?.email && docData) {
          emailAddress = userData.user.email;
          tempPassword = userData.user.user_metadata?.temp_pass;
          
          // Se o documento ainda não está registrado como pago, destrava-o e envia o e-mail com a minuta
          if (!docData.is_paid) {
            // Destrava documento
            await supabaseAdmin
              .from("documents")
              .update({ is_paid: true })
              .eq("id", docId);

            // Também atualiza status do contrato no dashboard
            await supabaseAdmin
              .from("contracts")
              .update({ status: "draft" })
              .eq("id", docId);

            // Envio de e-mail via Resend
            const resendKey = getSecret("RESEND_API_KEY") || process.env.RESEND_API_KEY;
            
            if (resendKey && docData.content) {
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
                       Seu pagamento foi confirmado com sucesso! 🎉
                       <br><br>
                       A minuta oficial do seu documento <strong>${docData.title || 'Documento ExtraJus'}</strong> foi gerada com sucesso e já está **anexada a este e-mail no formato editável Word (.DOCX)**.
                       <br><br>
                       Caso precise realizar alterações, fazer novas exportações ou baixar novamente, você poderá acessar o documento a qualquer momento diretamente pela plataforma ExtraJus.
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

              const wordHtml = compileWordHtml(docData.title, docData.content);
              const docxBase64 = Buffer.from('\ufeff' + wordHtml, 'utf-8').toString('base64');
              const filename = `${(docData.title || 'documento').replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;

              let sendResult = await resendInstance.emails.send({
                from: "ExtraJus AI <contato@extrajus.pro>",
                to: userData.user.email,
                subject: `⚔️ Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
                html: emailHtml,
                attachments: [
                  {
                    filename,
                    content: docxBase64,
                  }
                ]
              });

              if (sendResult.error) {
                console.warn(`[Polling Status] Falha ao enviar com remetente oficial (Código ${sendResult.error.statusCode}). Tentando fallback sandbox...`);
                sendResult = await resendInstance.emails.send({
                  from: "ExtraJus AI <onboarding@resend.dev>",
                  to: userData.user.email,
                  subject: `⚔️ [Sandbox] Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
                  html: emailHtml,
                  attachments: [
                    {
                      filename,
                      content: docxBase64,
                    }
                  ]
                });
                
                if (sendResult.error) {
                  console.error("[Polling Status] Falha no fallback do Resend:", sendResult.error);
                } else {
                  console.log(`[Polling Status] E-mail enviado com remetente sandbox (onboarding) para ${userData.user.email}`);
                }
              } else {
                console.log(`[Polling Status] E-mail com contrato enviado com sucesso para ${userData.user.email}`);
              }
            }
          }

          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/editor?room=${docId}`
            }
          });
          if (linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        }
      } catch (err: any) {
        console.error("Erro ao enviar e-mail de contrato no polling:", err.message);
      }
    }

    return NextResponse.json({ 
      status: transaction.status,
      amountCents: transaction.amount_cents,
      actionLink,
      email: emailAddress,
      tempPassword
    });

  } catch (error: any) {
    console.error("[Status API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { externalId } = await request.json();

    if (!externalId) {
      return NextResponse.json({ error: "ID externo ausente" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Buscar transação
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("user_id, status")
      .eq("external_id", externalId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // Verificar se é o usuário master para liberar o bypass de simulação em produção
    let isMasterUser = false;
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
      if (userData?.user?.email === "felipedutra@outlook.com") {
        isMasterUser = true;
      }
    } catch (e) {
      console.error("Erro ao verificar usuário master para bypass:", e);
    }

    if (process.env.NODE_ENV !== "development" && !isMasterUser) {
      return NextResponse.json({ error: "Proibido em produção" }, { status: 403 });
    }

    // 2. Atualizar transação
    await supabaseAdmin
      .from("transactions")
      .update({ status: "COMPLETE" })
      .eq("external_id", externalId);

    let actionLink: string | undefined = undefined;
    let emailAddress: string | undefined = undefined;
    let tempPassword: string | undefined = undefined;

    // 3. Se for paydoc, destravar doc
    if (externalId.startsWith("paydoc_")) {
      const docId = externalId.replace("paydoc_", "");
      
      // Destrava documento
      await supabaseAdmin
        .from("documents")
        .update({ is_paid: true })
        .eq("id", docId);

      // Também destrava/atualiza status do contrato correspondente no dashboard do usuário
      await supabaseAdmin
        .from("contracts")
        .update({ status: "draft" })
        .eq("id", docId);

      // Buscar dados do documento para o envio do e-mail via Resend (Simulação)
      try {
        const { data: docData } = await supabaseAdmin
          .from("documents")
          .select("title, content")
          .eq("id", docId)
          .single();

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        
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
                  Seu pagamento foi confirmado com sucesso! 🎉
                  <br><br>
                  A minuta oficial do seu documento <strong>${docData.title || 'Documento ExtraJus'}</strong> foi gerada com sucesso e já está **anexada a este e-mail no formato editável Word (.DOCX)**.
                  <br><br>
                  Caso precise realizar alterações, fazer novas exportações ou baixar novamente, você poderá acessar o documento a qualquer momento diretamente pela plataforma ExtraJus.
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

          const wordHtml = compileWordHtml(docData.title, docData.content);
          const docxBase64 = Buffer.from('\ufeff' + wordHtml, 'utf-8').toString('base64');
          const filename = `${(docData.title || 'documento').replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;

          let sendResult = await resendInstance.emails.send({
            from: "ExtraJus AI <contato@extrajus.pro>",
            to: userData.user.email,
            subject: `⚔️ Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
            html: emailHtml,
            attachments: [
              {
                filename,
                content: docxBase64,
              }
            ]
          });

          if (sendResult.error) {
            console.warn(`[Simulação Billing Status] Falha ao enviar com remetente oficial (Código ${sendResult.error.statusCode}). Tentando fallback sandbox...`);
            sendResult = await resendInstance.emails.send({
              from: "ExtraJus AI <onboarding@resend.dev>",
              to: userData.user.email,
              subject: `⚔️ [Sandbox] Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
              html: emailHtml,
              attachments: [
                {
                  filename,
                  content: docxBase64,
                }
              ]
            });
            
            if (sendResult.error) {
              console.error("[Simulação Billing Status] Falha no fallback do Resend:", sendResult.error);
            } else {
              console.log(`[Simulação Billing Status] E-mail enviado com remetente sandbox (onboarding) para ${userData.user.email}`);
            }
          } else {
            console.log(`[Simulação Billing Status] E-mail com contrato enviado com sucesso para ${userData.user.email}`);
          }
        }
      } catch (emailErr: any) {
        console.error("[Simulação Billing Status] Erro no envio de e-mail com contrato:", emailErr.message);
      }

      // Gerar credenciais e link de login automático pós-pagamento
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        if (userData?.user?.email) {
          emailAddress = userData.user.email;
          tempPassword = userData.user.user_metadata?.temp_pass;
          
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/editor?room=${docId}`
            }
          });
          if (linkData?.properties?.action_link) {
            actionLink = linkData.properties.action_link;
          }
        }
      } catch (err) {
        console.error("Erro ao gerar link de redirecionamento pós-pagamento simulado:", err);
      }
    }

    return NextResponse.json({ success: true, actionLink, email: emailAddress, tempPassword });
  } catch (error: any) {
    console.error("[Simulate Payment Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

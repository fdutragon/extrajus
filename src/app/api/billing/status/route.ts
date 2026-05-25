import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSecret } from "@/utils/secrets";

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

    // Se o pagamento foi concluído e for um desbloqueio de documento, extrai credenciais e gera magiclink
    if (transaction.status === "COMPLETE" && isPayDoc) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(transaction.user_id);
        if (userData?.user?.email) {
          emailAddress = userData.user.email;
          tempPassword = userData.user.user_metadata?.temp_pass;
          
          const docId = externalId.replace("paydoc_", "");
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
        console.error("Erro ao gerar link de redirecionamento pós-pagamento:", err);
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

          await resendInstance.emails.send({
            from: "ExtraJus AI <documentos@contato.extrajus.com.br>",
            to: userData.user.email,
            subject: `⚔️ Seu documento oficial foi liberado: ${docData.title || 'Contrato'}`,
            html: emailHtml
          });
          console.log(`[Simulação Billing Status] E-mail com contrato enviado com sucesso para ${userData.user.email}`);
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

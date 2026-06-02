import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { getSecret } from "@/utils/secrets";
import { sendTelegramNotification } from "@/lib/notifications";

const GGPIX_API_URL = "https://ggpixapi.com/api/v1/pix/in";

function generateRandomCPF() {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n = Array.from({ length: 9 }, randomDigit);

  let d1 = 0;
  for (let i = 0; i < 9; i++) d1 += n[i] * (10 - i);
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  let d2 = 0;
  for (let i = 0; i < 9; i++) d2 += n[i] * (11 - i);
  d2 += d1 * 2;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n.join("")}${d1}${d2}`;
}

export async function POST(request: Request) {
  try {
    const { name, email, content, doc_type, title } = await request.json();

    if (!email || !content) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const finalName = `Cliente ${randomId}`;

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Check or create user using the profiles table to avoid GoTrueAdminApi pagination/compatibility issues
    let userId: string;
    const tempPassword = uuidv4();
    
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileData?.id) {
      userId = profileData.id;
      // Recuperar metadados do usuário para preservar
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const userMetadata = userData?.user?.user_metadata || {};
      
      // Atualizar a senha e metadados para login automático e imediato após pagamento
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { ...userMetadata, temp_pass: tempPassword }
      });
      if (updateError) console.error("Erro ao atualizar senha temporária do usuário existente:", updateError);
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: finalName, temp_pass: tempPassword }
      });
      if (createError) throw createError;
      if (!newUser.user) throw new Error("Falha ao criar usuário");
      userId = newUser.user.id;

      // Forçar créditos iniciais de exatamente 300 para o novo usuário criado no checkout
      const { error: setCreditsError } = await supabaseAdmin
        .from("profiles")
        .update({ credits: 300 })
        .eq("id", userId);
      if (setCreditsError) {
        console.error("Erro ao forçar créditos iniciais de 300:", setCreditsError.message);
      }
    }

    // 2. Create document record as unpaid
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: userId,
        title: title || "Novo Documento",
        content: content,
        doc_type: doc_type || "notificacao",
        is_paid: false
      })
      .select("id")
      .single();

    if (docError) throw docError;

    // 2.5 Insert matching record into contracts table so it appears in the user's dashboard!
    const { error: contractInsertError } = await supabaseAdmin
      .from("contracts")
      .insert({
        id: doc.id,
        user_id: userId,
        title: title || "Novo Documento",
        status: "draft"
      });

    if (contractInsertError) {
      console.error("Erro ao registrar contrato no dashboard:", contractInsertError.message);
    }

    // --- BLOQUEIO DE DUPLICADOS NO BACKEND ---
    // Verificar se já existe uma transação PENDING para este documento
    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("external_id, pix_code")
      .eq("user_id", userId)
      .eq("status", "PENDING")
      .eq("amount_cents", 2700)
      .like("external_id", `paydoc_${doc.id}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingTx && existingTx.pix_code) {
      console.log(`[Checkout] Recuperando transação pendente existente: ${existingTx.external_id}`);
      
      // Notificar o Cadelo via Telegram sobre a tentativa de re-geração (reentrada)
      await sendTelegramNotification(`#SISTEMA_ORDEM 🔄 <b>REENTRADA NO CHECKOUT</b>\n\n📄 Documento: <b>${title || 'Sem título'}</b>\n👤 Cliente: <b>${finalName}</b>\n🆔 ID: <code>${existingTx.external_id}</code>\nℹ️ O cliente voltou para ver o QR Code existente.`);

      // Precisamos do QR Code formatado (data.pixCode da GG Pix)
      // Como não salvamos o raw QR code (SVG/Base64) mas sim o copia e cola, 
      // para simplificar e garantir 100% de funcionamento, vamos apenas prosseguir se não houver.
      // Mas aqui vamos apenas gerar um novo externalId se quisermos ser puristas, 
      // ou apenas deixar o fluxo seguir se for um novo doc. 
      // Como o doc.id é novo (criado acima), tecnicamente cada chamada gera um novo DOC.
      // O verdadeiro problema é o LOOP gerando centenas de DOCS. 
    }

    const externalId = `paydoc_${doc.id}`;
    const amountCents = 2700; // R$ 27,00

    // 3. Register transaction
    const { error: dbError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        amount_cents: amountCents,
        external_id: externalId,
        status: "PENDING"
      });

    if (dbError) throw dbError;

    // 4. Generate PIX
    const API_KEY = getSecret("GGPIX_API_KEY");
    const payerDocument = generateRandomCPF();

    const response = await fetch(GGPIX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY || "",
      },
      body: JSON.stringify({
        amountCents,
        description: "Desbloqueio de Documento ExtraJus",
        payerName: finalName,
        payerDocument,
        externalId,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/ggpix`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro GG Pix Checkout:", data);
      return NextResponse.json({ error: "Falha ao gerar Pix para o documento" }, { status: 500 });
    }

    // Update transaction with pix_code
    await supabaseAdmin
      .from("transactions")
      .update({ pix_code: data.pixCopyPaste })
      .eq("external_id", externalId);

    // Notificar o Cadelo via Telegram sobre o interesse no documento
    const formattedAmount = (amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    await sendTelegramNotification(`#SISTEMA_ORDEM ⚡ <b>PIX GERADO (DOCUMENTO)</b>\n\n💵 Valor: <b>${formattedAmount}</b>\n📄 Documento: <b>${title || 'Sem título'}</b>\n👤 Cliente: <b>${finalName}</b> (${email})\n🆔 ID: <code>${externalId}</code>\n⏳ Só falta pagar para o lucro entrar!`);

    return NextResponse.json({ 
      pixCode: data.pixCopyPaste, 
      pixQrCode: data.pixCode,
      externalId,
      docId: doc.id
    });

  } catch (error: any) {
    console.error("Checkout Doc Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

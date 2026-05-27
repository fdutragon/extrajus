import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { getSecret } from "@/utils/secrets";

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

    if (!name || !email || !content) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Check or create user
    let userId: string;
    const { data: existingUsers, error: userFetchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userFetchError) {
      console.error("Error fetching users:", userFetchError);
      throw new Error("Erro ao buscar usuários");
    }

    const existingUser = existingUsers.users.find(u => u.email === email);
    const tempPassword = uuidv4();
    
    if (existingUser) {
      userId = existingUser.id;
      // Atualizar a senha e metadados para login automático e imediato após pagamento
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: { ...existingUser.user_metadata, temp_pass: tempPassword }
      });
      if (updateError) console.error("Erro ao atualizar senha temporária do usuário existente:", updateError);
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name, temp_pass: tempPassword }
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
        doc_type: doc_type || "contrato",
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

    const externalId = `paydoc_${doc.id}`;
    const amountCents = 2990; // R$ 29,90

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
        payerName: name,
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

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from 'next/server'
import crypto from "crypto";
import { sendTelegramNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  // Criar o cliente Admin usando a Service Role Key para contornar RLS no webhook
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  try {
    const bodyClone = request.clone();
    const payload = await request.json()
    console.log("[Webhook Assinafy] Received payload:", payload)

    // Validação de segurança e origem do Webhook Assinafy
    const signature = request.headers.get("X-Assinafy-Signature");
    const authorization = request.headers.get("Authorization");

    const secret = process.env.ASSINAFY_WEBHOOK_SECRET || process.env.ASSINAFY_API_KEY || "";

    if (secret) {
      const isSimpleToken = authorization === secret || authorization === `Bearer ${secret}` || signature === secret;
      
      let isHmacValid = false;
      if (signature && !isSimpleToken) {
        const bodyText = await bodyClone.text();
        const hash = crypto.createHmac("sha256", secret).update(bodyText).digest("hex");
        isHmacValid = signature === hash;
      }

      if (!isSimpleToken && !isHmacValid) {
        console.warn("[Webhook Assinafy] Bloqueada tentativa de requisição falsa sem assinatura válida.");
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const { id: documentId, status } = payload

    if (!documentId) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 })
    }

    // Map Assinafy status to SmartDoc status
    // Assuming: 'signed' -> 'signed', 'rejected' -> 'rejected', etc.
    const mappedStatus = status === 'completed' || status === 'signed' ? 'signed' : status

    // 1. Update Signatures table
    const { data: updatedSignature, error: sigError } = await supabase
      .from('signatures')
      .update({ status: mappedStatus, updated_at: new Date().toISOString() })
      .eq('external_id', documentId)
      .select('contract_id')
      .single()

    if (sigError) {
      console.error("[Webhook Assinafy] Error updating signature:", sigError)
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 })
    }

    // 2. Update Contracts table
    if (updatedSignature?.contract_id) {
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq('id', updatedSignature.contract_id)

      if (contractError) {
        console.error("[Webhook Assinafy] Error updating contract:", contractError)
      } else if (mappedStatus === 'signed') {
        // Notificar o Cadelo via Telegram sobre a assinatura
        await sendTelegramNotification(`🖋️ <b>CONTRATO ASSINADO!</b>\n\n📄 Documento: <code>${documentId}</code>\n✅ Status: <b>ASSINADO</b>\n🔥 Menos um problema, mais um passo para o topo.`);
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Webhook Assinafy] Critical failure:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

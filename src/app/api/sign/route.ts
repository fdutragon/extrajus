import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contractId, title, content, signers } = await request.json()

  const assinafyApiKey = process.env.ASSINAFY_API_KEY;

  if (!assinafyApiKey) {
    return NextResponse.json({ error: 'ASSINAFY_API_KEY not configured' }, { status: 500 })
  }

  try {
    // 1. Prepare payload for Assinafy
    // Note: Assuming standard API structure based on previous mock
    const assinafyResponse = await fetch('https://api.assinafy.com.br/v1/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${assinafyApiKey}`,
      },
      body: JSON.stringify({
        title: title || 'Contrato ExtraJus',
        content_base64: Buffer.from(content).toString('base64'),
        signers: signers.map((s: any) => ({
          name: s.name,
          email: s.email,
          role: 'signer'
        })),
        workflow: 'parallel'
      })
    })

    const result = await assinafyResponse.json()

    if (!assinafyResponse.ok) {
      throw new Error(result.message || 'Erro na Assinafy')
    }

    const documentId = result.id;
    const signUrl = result.sign_url;

    // 2. Persist in Supabase 'signatures' table
    if (contractId) {
      const { error: sigError } = await supabase.from('signatures').insert({
        contract_id: contractId,
        external_id: documentId,
        status: 'pending',
        signers: signers
      })

      if (sigError) {
        console.error("Error saving signature to DB:", sigError);
      }

      // 3. Update contract status
      await supabase
        .from('contracts')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', contractId)
    }

    return NextResponse.json({ 
      success: true, 
      documentId: documentId,
      signUrl: signUrl 
    })
  } catch (error: any) {
    console.error("Signature Ritual Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

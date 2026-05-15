import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const payload = await request.json()
    console.log("[Webhook Assinafy] Received payload:", payload)

    const { id: documentId, status } = payload

    if (!documentId) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 })
    }

    // Map Assinafy status to ExtraJus status
    // Assuming: 'signed' -> 'signed', 'rejected' -> 'rejected', etc.
    const mappedStatus = status === 'completed' || status === 'signed' ? 'signed' : status

    // 1. Update Signatures table
    const { data: signature, error: sigError } = await supabase
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
    if (signature?.contract_id) {
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq('id', signature.contract_id)

      if (contractError) {
        console.error("[Webhook Assinafy] Error updating contract:", contractError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Webhook Assinafy] Critical failure:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

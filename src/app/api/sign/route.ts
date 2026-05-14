import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, signers } = await request.json()

  // In a real scenario, you'd use a PDF generation library here.
  // For this implementation, we'll simulate the Assinafy API call.
  // Docs: https://api.assinafy.com.br/v1/docs#tag/Documentos/operation/createDocument
  
  try {
    const response = await fetch('https://api.assinafy.com.br/v1/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASSINAFY_API_KEY}`,
      },
      body: JSON.stringify({
        title: title || 'Contrato ExtraJus',
        content_base64: Buffer.from(content).toString('base64'), // Mocking HTML to base64
        signers: signers.map((s: any) => ({
          name: s.name,
          email: s.email,
          role: 'signer'
        })),
        workflow: 'parallel'
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Erro na Assinafy')
    }

    return NextResponse.json({ 
      success: true, 
      documentId: result.id,
      signUrl: result.sign_url 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

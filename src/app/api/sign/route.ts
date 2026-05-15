import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, signers } = await request.json()

  const assinafyApiKey = process.env.ASSINAFY_API_KEY;

  // --- MOCK LOGIC ---
  if (!assinafyApiKey) {
    console.log("ASSINAFY_API_KEY não encontrada. Usando mock para simular sucesso.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência da rede
    return NextResponse.json({ 
      success: true, 
      documentId: `mock_${new Date().getTime()}`,
      signUrl: "https://assinafy.com.br/mock-url-assinado-com-sucesso"
    });
  }
  // --- END MOCK LOGIC ---
  
  try {
    const response = await fetch('https://api.assinafy.com.br/v1/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${assinafyApiKey}`,
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

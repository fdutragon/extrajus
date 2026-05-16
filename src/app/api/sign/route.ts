import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface Signer {
  name: string;
  email: string;
}

interface SignRequest {
  contractId?: string;
  title?: string;
  content: string;
  signers: Signer[];
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contractId, title, content, signers } = await request.json() as SignRequest;

  const assinafyApiKey = process.env.ASSINAFY_API_KEY;
  const assinafyWorkspaceId = process.env.ASSINAFY_WORKSPACE_ID; // Importante: Deve ser configurado no .env

  if (!assinafyApiKey || !assinafyWorkspaceId) {
    return NextResponse.json({ 
      error: 'Configuração da Assinafy incompleta (API Key ou Workspace ID ausente no .env)' 
    }, { status: 500 })
  }

  try {
    // 1. Upload do Documento (Multipart Form Data)
    // Criamos um arquivo HTML temporário a partir do conteúdo do editor
    const formData = new FormData();
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h1 style="text-align: center;">${title || 'Contrato ExtraJus'}</h1>
        ${content}
      </body>
      </html>
    `;
    
    // Convertemos para Blob para simular um arquivo real no FormData
    const blob = new Blob([fullHtml], { type: 'text/html' });
    formData.append('file', blob, `${title?.replace(/\s+/g, '_') || 'contrato'}.html`);

    const uploadResponse = await fetch(`https://api.assinafy.com.br/v1/accounts/${assinafyWorkspaceId}/documents`, {
      method: 'POST',
      headers: {
        'X-Api-Key': assinafyApiKey,
      },
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(uploadResult.message || 'Erro no upload do documento para Assinafy');
    }

    const documentId = uploadResult.id || uploadResult.data?.id;

    // 2. Criação/Vinculação de Signatários
    const signerIds: string[] = [];
    for (const s of signers) {
      const signerResponse = await fetch(`https://api.assinafy.com.br/v1/accounts/${assinafyWorkspaceId}/signers`, {
        method: 'POST',
        headers: {
          'X-Api-Key': assinafyApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: s.name,
          email: s.email
        })
      });
      
      const signerResult = await signerResponse.json();
      // O Assinafy pode retornar 200 se criar ou se o signatário já existir dependendo da versão
      const sId = signerResult.data?.id || signerResult.id;
      if (sId) {
        signerIds.push(sId);
      } else {
        console.warn(`Signatário ${s.email} não pôde ser processado:`, signerResult.message);
      }
    }

    if (signerIds.length === 0) {
      throw new Error("Não foi possível registrar os signatários no Assinafy.");
    }

    // 3. Solicitação de Assinatura (Assignment)
    const assignmentResponse = await fetch(`https://api.assinafy.com.br/v1/documents/${documentId}/assignments`, {
      method: 'POST',
      headers: {
        'X-Api-Key': assinafyApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'virtual',
        signerIds: signerIds
      })
    });

    const assignmentResult = await assignmentResponse.json();
    if (!assignmentResponse.ok) {
      throw new Error(assignmentResult.message || 'Erro ao criar o fluxo de assinaturas');
    }

    // 4. Persistência no Supabase
    if (contractId) {
      const { error: sigError } = await supabase.from('signatures').insert({
        contract_id: contractId,
        external_id: documentId,
        status: 'pending',
        signers: signers
      })

      if (sigError) console.error("Error saving signature to DB:", sigError);

      await supabase
        .from('contracts')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', contractId)
    }

    return NextResponse.json({ 
      success: true, 
      documentId: documentId,
      signUrl: assignmentResult.data?.signing_url || uploadResult.data?.signing_url
    })

  } catch (error: any) {
    console.error("Assinafy API Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

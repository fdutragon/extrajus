import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const assinafyApiKey = process.env.ASSINAFY_API_KEY

async function testAssinafyPost() {
  console.log('🧪 Testando Ritual de Assinatura (POST)...')
  
  try {
    const response = await fetch('https://api.assinafy.com.br/v1/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${assinafyApiKey}`,
      },
      body: JSON.stringify({
        title: 'Teste de Integridade ExtraJus',
        content_base64: Buffer.from('Conteúdo de Teste').toString('base64'),
        signers: [
          { name: 'Arquiteto Teste', email: 'teste@extrajus.com.br', role: 'signer' }
        ]
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ RITUAL BEM-SUCEDIDO!')
      console.log('📄 Documento ID:', result.id)
    } else {
      console.log('❌ Assinafy respondeu com erro:', response.status)
      console.log('📝 Mensagem:', result.message || JSON.stringify(result))
    }
  } catch (error) {
    console.error('💥 Erro:', error.message)
  }
}

testAssinafyPost()

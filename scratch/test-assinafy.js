import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const assinafyApiKey = process.env.ASSINAFY_API_KEY

if (!assinafyApiKey) {
  console.error('❌ Missing ASSINAFY_API_KEY')
  process.exit(1)
}

async function testAssinafy() {
  console.log('🔮 Invocando Portal da Assinafy...')
  
  try {
    // Teste de "Listar Documentos" ou similar para validar a chave
    const response = await fetch('https://api.assinafy.com.br/v1/documents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${assinafyApiKey}`,
      }
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Conexão com Assinafy ESTABELECIDA.')
      console.log(`📊 Total de documentos detectados: ${result.total || result.length || 0}`)
    } else {
      console.error('❌ Assinafy recusou a conexão:', result.message || JSON.stringify(result))
      if (response.status === 401) {
         console.log('💡 Dica: Sua API Key pode estar inválida ou expirada.')
      }
    }
  } catch (error) {
    console.error('💥 Falha catastrófica ao contactar Assinafy:', error.message)
  }
}

testAssinafy()

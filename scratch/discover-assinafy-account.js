import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const assinafyApiKey = process.env.ASSINAFY_API_KEY

async function discoverAccountId() {
  console.log('🔍 Buscando Account ID no labirinto da Assinafy...')
  
  try {
    const response = await fetch('https://api.assinafy.com.br/v1/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${assinafyApiKey}`,
      }
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Accounts encontradas:')
      console.log(JSON.stringify(result, null, 2))
      if (Array.isArray(result) && result.length > 0) {
         console.log(`\n💡 Seu Account ID principal é: ${result[0].id}`)
      } else if (result.data && Array.isArray(result.data)) {
         console.log(`\n💡 Seu Account ID principal é: ${result.data[0].id}`)
      }
    } else {
      console.error('❌ Falha ao listar contas:', result.message || JSON.stringify(result))
    }
  } catch (error) {
    console.error('💥 Erro:', error.message)
  }
}

discoverAccountId()

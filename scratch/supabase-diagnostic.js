import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('🚀 Starting Full Supabase Diagnostics...\n')

  const tables = ['profiles', 'contracts', 'signatures', 'yjs_updates', 'templates']
  const results = []

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1)

      if (error) {
        results.push({ table, status: 'ERROR', error: error.message })
      } else {
        results.push({ table, status: 'OK', count: count || 0 })
      }
    } catch (e) {
      results.push({ table, status: 'FATAL', error: e.message })
    }
  }

  console.log('\n📊 Summary:')
  results.forEach(r => {
    const icon = r.status === 'OK' ? '✅' : '❌'
    console.log(`${icon} ${r.table.padEnd(15)} | Status: ${r.status.padEnd(6)} | Count: ${String(r.count || '-').padEnd(5)} | ${r.error || ''}`)
  })

  const hasErrors = results.some(r => r.status !== 'OK')
  if (hasErrors) {
    console.log('\n⚠️ Algumas tabelas apresentam falhas ou estão inacessíveis.')
  } else {
    console.log('\n✨ Todas as tabelas do núcleo estão operacionais.')
  }
}

testSupabase().catch(console.error)

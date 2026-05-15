import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUpdates() {
  console.log('Checking yjs_updates table...')
  const { data, error } = await supabase
    .from('yjs_updates')
    .select('*')
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Found updates:', data?.length)
  data?.forEach(row => {
    console.log(`ID: ${row.id}, Contract: ${row.contract_id}`)
    console.log(`Update type: ${typeof row.update}`)
    if (typeof row.update === 'string') {
        console.log(`Update (first 20 chars): ${row.update.slice(0, 20)}`)
    } else {
        console.log(`Update (Buffer/Object/Uint8Array):`, row.update instanceof Uint8Array ? 'Uint8Array' : typeof row.update)
        if (row.update && typeof row.update === 'object') {
             console.log('Keys:', Object.keys(row.update).slice(0, 10))
        }
    }
    console.log('---')
  })
}

debugUpdates()

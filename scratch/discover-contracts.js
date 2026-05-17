import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkContracts() {
  const { data, error } = await supabase.from('contracts').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Sample Contract Row:', data[0])
  }
}

checkContracts()

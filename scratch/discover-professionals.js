import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfessionals() {
  console.log('🔍 Checking professionals table in Supabase...')
  const { data, error, count } = await supabase
    .from('professionals')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error fetching from professionals:', error.message)
  } else {
    console.log('✅ Connected to professionals table successfully!')
    console.log('📊 Count of records:', data ? data.length : 0)
    console.log('🔑 Columns/Keys:', data[0] ? Object.keys(data[0]) : 'No rows found')
    console.log('📄 Sample row:', data[0] || 'No row found')
  }
}

checkProfessionals()

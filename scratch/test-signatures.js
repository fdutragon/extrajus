import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getColumns() {
  const { data, error } = await supabase
    .from('signatures')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching signatures:', error)
  } else {
    console.log('Signatures columns/keys:', data[0] ? Object.keys(data[0]) : 'No records found')
    console.log('Sample record:', data[0])
  }
}

getColumns()

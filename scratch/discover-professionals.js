import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDiscovery() {
  console.log('⚡ Inserting mock professional with expertise to probe further...')
  
  // 1. Insert a temporary record with name and expertise
  const { data: inserted, error: insertError } = await supabase
    .from('professionals')
    .insert({ 
      id: '00000000-0000-0000-0000-000000000000', 
      name: 'Lilith Cripto-Advogada',
      expertise: 'Cripto-Direito'
    })
    .select()

  if (insertError) {
    console.error('❌ Insert failed:', insertError)
    return
  }

  console.log('✅ Temporary professional inserted successfully!')
  console.log('🔑 Exact columns/schema found in record:')
  console.log(inserted[0])

  // 2. Clean up and delete the record
  console.log('🧹 Cleaning up database, deleting temporary record...')
  const { error: deleteError } = await supabase
    .from('professionals')
    .delete()
    .eq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('❌ Failed to delete temporary record:', deleteError.message)
  } else {
    console.log('✨ Cleanup finished. Database is pristine.')
  }
}

runDiscovery()

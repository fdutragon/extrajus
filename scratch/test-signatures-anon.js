import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAnonQuery() {
  console.log("--- 1. Testing signatures select with left join ---")
  const { data: sig1, error: err1 } = await supabase
    .from('signatures')
    .select('*, contracts(id, title, user_id)')

  if (err1) {
    console.error("Select Error:", err1)
  } else {
    console.log("Success! Signatures Count:", sig1?.length)
    if (sig1 && sig1.length > 0) {
      console.log("Sample Signature Join:", sig1[0])
    }
  }
}

testAnonQuery()

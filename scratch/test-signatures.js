import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testJoinQuery() {
  console.log("--- Testing combined left join query ---")
  const { data, error } = await supabase
    .from('signatures')
    .select('*, contracts(id, title, user_id)')

  if (error) {
    console.error("Join Query Error:", error)
  } else {
    console.log("Success! Total signatures fetched:", data.length)
    if (data[0]) {
      console.log("Sample merged row:", {
        id: data[0].id,
        status: data[0].status,
        contract: data[0].contracts
      })
    }
  }
}

testJoinQuery()

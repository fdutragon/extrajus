
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkContracts() {
  const { data, error } = await supabase.from('contracts').select('id, title');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Valid Contracts:', JSON.stringify(data, null, 2));
  }
}

checkContracts();

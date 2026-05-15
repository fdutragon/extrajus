
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkColumns() {
  // Query information_schema via RPC or direct SQL if possible
  // Since we don't have SQL access directly, let's try to fetch a row and look at keys
  const { data, error } = await supabase.from('contracts').select('*').limit(1);
  if (error) {
    console.error('Error fetching columns:', error);
  } else {
    console.log('Available columns in contracts table:', Object.keys(data[0] || {}));
  }
}

checkColumns();

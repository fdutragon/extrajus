
/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'contracts' });
  if (error) {
    // If RPC doesn't exist, try a direct query to get one row
    console.log('RPC failed, trying direct select...');
    const { data: oneRow, error: selectError } = await supabase.from('contracts').select('*').limit(1);
    if (selectError) {
       console.error('Select Error:', selectError);
    } else {
       console.log('Table structure (one row):', oneRow);
    }
  } else {
    console.log('Schema:', JSON.stringify(data, null, 2));
  }
}

checkSchema();

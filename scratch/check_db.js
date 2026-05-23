const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Try to query 'documents'
  const { data: docs, error: docsError } = await supabase.from('documents').select('*').limit(1);
  console.log('Documents table:', docsError ? docsError.message : 'Exists');
  
  // Try to query 'profiles'
  const { data: profs, error: profsError } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles table:', profsError ? profsError.message : 'Exists');
}

check();

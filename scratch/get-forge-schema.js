const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking forge_requests...");
  const { data, error } = await supabase.from('forge_requests').select('*').limit(1);
  if (error) {
    console.error("Error fetching forge_requests:", error);
  } else {
    console.log("Sample forge_request:", data);
  }
}

run();

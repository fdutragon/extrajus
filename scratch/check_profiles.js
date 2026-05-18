const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Fetching profiles...");
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  if (error) {
    console.error("Error fetching profiles:", error);
    process.exit(1);
  }

  console.log("Profiles found:", profiles);
}

run();

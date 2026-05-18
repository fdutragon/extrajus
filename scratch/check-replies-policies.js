const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

async function test() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: policies, error } = await supabaseAdmin
    .rpc('get_policies'); // If we have an rpc, otherwise we can query pg_policies via pg client if direct query is allowed.
  
  // Or we can just query pg_policies using custom sql if possible, but wait, we can run a select to check.
  // Let's run a direct query using postgres client in Supabase if we have access, otherwise we can try a simple query.
  const { data, error: sqlError } = await supabaseAdmin
    .from('notification_replies')
    .select('*')
    .limit(1);

  console.log("Direct replies query error:", sqlError);
  console.log("Direct replies query data:", data);
}

test();

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

async function test() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name');

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("Registered Profiles in database:");
  profiles.forEach(p => console.log(`- ID: ${p.id} | Email: ${p.email} | Name: ${p.full_name}`));
}

test();

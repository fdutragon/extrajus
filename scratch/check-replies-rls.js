const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

async function test() {
  // Test using the ANON client (just like the browser frontend)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('notification_replies')
    .select('*');

  console.log("Anon Client Query Results:");
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS! Row count:", data.length);
    console.log("Data:", data);
  }
}

test();

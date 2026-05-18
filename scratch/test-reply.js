const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

async function test() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Get a notification to use
  const { data: notifications, error: notifError } = await supabaseAdmin
    .from('notifications')
    .select('id, user_id, title')
    .limit(1);

  if (notifError) {
    console.error("Error fetching notifications:", notifError);
    return;
  }

  if (!notifications || notifications.length === 0) {
    console.log("No notifications found to reply to.");
    return;
  }

  const notif = notifications[0];
  console.log("Found notification:", notif);

  // 2. Try to insert a reply
  const { data: reply, error: replyError } = await supabaseAdmin
    .from('notification_replies')
    .insert({
      notification_id: notif.id,
      sender_id: notif.user_id,
      sender_name: "Test User",
      sender_email: "test@example.com",
      message: "Oi, este é um teste de réplica!"
    })
    .select();

  if (replyError) {
    console.error("Error inserting reply:", replyError);
  } else {
    console.log("Successfully inserted reply:", reply);
  }
}

test();

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

async function run() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const userId = "feb91a90-9e17-4b65-89d5-6415548210c3";
  const notificationId = "4f91b933-2a6c-4a0f-829a-cfdedb3c4f50";
  const originalTitle = "teste";
  const replyMessage = "Oi, estou respondendo aqui!";

  try {
    console.log("Step 1: Fetching profile for user:", userId);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    console.log("Found profile:", profile);

    const userName = profile?.full_name || "Recruta";
    const userEmail = profile?.email || "felipe.dutragon@gmail.com";

    console.log("Step 2: Fetching admin profile...");
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', 'felipedutra@outlook.com')
      .single();

    if (adminError) throw adminError;
    console.log("Found admin:", admin);

    console.log("Step 3: Inserting notification for admin...");
    const { data: notif, error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: admin.id,
        title: `📬 Resposta de ${userName}`,
        message: `Em resposta ao alerta "${originalTitle}": "${replyMessage}" (E-mail: ${userEmail})`,
        type: 'user_reply',
        link: '/admin'
      })
      .select();

    if (notifError) throw notifError;
    console.log("Inserted notification:", notif);

    console.log("Step 4: Inserting reply in notification_replies...");
    const { data: reply, error: replyError } = await supabaseAdmin
      .from('notification_replies')
      .insert({
        notification_id: notificationId,
        sender_id: userId,
        sender_name: userName,
        sender_email: userEmail,
        message: replyMessage
      })
      .select();

    if (replyError) throw replyError;
    console.log("Inserted reply successfully:", reply);

  } catch (err) {
    console.error("DIAGNOSTIC CRASHED:", err);
  }
}

run();

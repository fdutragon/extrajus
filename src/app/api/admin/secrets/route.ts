import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getImperialSecrets, writeImperialSecrets } from "@/utils/secrets";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const secrets = getImperialSecrets();
    
    return NextResponse.json({
      success: true,
      secrets: {
        GGPIX_API_KEY_configured: !!(secrets.GGPIX_API_KEY || process.env.GGPIX_API_KEY),
        GGPIX_WEBHOOK_SECRET_configured: !!(secrets.GGPIX_WEBHOOK_SECRET || process.env.GGPIX_WEBHOOK_SECRET),
        RESEND_API_KEY_configured: !!(secrets.RESEND_API_KEY || process.env.RESEND_API_KEY),
        GEMINI_API_KEY_configured: !!(secrets.GEMINI_API_KEY || process.env.GEMINI_API_KEY)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipe.dutragon@gmail.com") {
      return NextResponse.json({ error: "Acesso proibido." }, { status: 403 });
    }

    const { GGPIX_API_KEY, GGPIX_WEBHOOK_SECRET, RESEND_API_KEY, GEMINI_API_KEY } = await request.json();

    const updates: any = {};
    if (GGPIX_API_KEY && GGPIX_API_KEY !== "••••••••••••••••") updates.GGPIX_API_KEY = GGPIX_API_KEY;
    if (GGPIX_WEBHOOK_SECRET && GGPIX_WEBHOOK_SECRET !== "••••••••••••••••") updates.GGPIX_WEBHOOK_SECRET = GGPIX_WEBHOOK_SECRET;
    if (RESEND_API_KEY && RESEND_API_KEY !== "••••••••••••••••") updates.RESEND_API_KEY = RESEND_API_KEY;
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "••••••••••••••••") updates.GEMINI_API_KEY = GEMINI_API_KEY;

    writeImperialSecrets(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

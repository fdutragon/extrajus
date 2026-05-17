import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Validar se o usuário é o Admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== "felipedutra@outlook.com") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const ggpixApiKey = process.env.GGPIX_API_KEY;
    if (!ggpixApiKey) {
      return NextResponse.json({ error: "Chave API GGPix não configurada no servidor." }, { status: 500 });
    }

    console.log("[GGPIX Balance] Consultando saldo na GGPix...");

    const response = await fetch("https://ggpixapi.com/api/v1/balance", {
      method: "GET",
      headers: {
        "X-API-Key": ggpixApiKey
      }
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("[GGPix Balance Error]:", resData);
      return NextResponse.json({ error: resData.message || resData.error || "Erro ao consultar saldo na GGPix." }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      balance: resData.balance, 
      balanceFormatted: resData.balanceFormatted 
    });

  } catch (error: any) {
    console.error("GGPix Balance Fetch Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

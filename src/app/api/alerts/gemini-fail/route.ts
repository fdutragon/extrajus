import { NextResponse } from "next/server";
import { sendTelegramAlert } from "@/lib/telegram-alert";

export async function POST(req: Request) {
  try {
    const { error, context } = await req.json();

    const errorMsg = error || "Erro desconhecido";
    const contextMsg = context || "Frontend (editor)";

    const message =
      `🔴 *SmartDoc — Falha na API Gemini*\n\n` +
      `*Contexto:* ${contextMsg}\n` +
      `*Erro:* \`${errorMsg}\`\n` +
      `*Horário:* ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`;

    await sendTelegramAlert(message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[GeminiFailAlert] Erro ao processar alerta:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

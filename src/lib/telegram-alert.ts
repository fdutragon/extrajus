/**
 * SmartDoc — Telegram Alert Utility
 * Envia notificações direto para o Cadelo via Telegram Bot API (fetch puro, sem dependências externas).
 * Funciona tanto em Node.js (server) quanto Edge Runtime.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

/**
 * Envia uma mensagem de alerta ao dono via Telegram.
 * Fire-and-forget: nunca lança exceção — falha silenciosa no log.
 */
export async function sendTelegramAlert(message: string): Promise<void> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("[TelegramAlert] BOT_TOKEN ou ADMIN_CHAT_ID não configurados. Alerta não enviado.");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: ADMIN_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[TelegramAlert] Falha ao enviar mensagem:", errText);
    }
  } catch (err) {
    console.error("[TelegramAlert] Erro de rede ao notificar Telegram:", err);
  }
}

import { getSecret } from "@/utils/secrets";

/**
 * LILITH NOTIFICATION SYSTEM
 * Specialized in keeping the Cadelo updated on his empire's growth.
 */

export async function sendTelegramNotification(message: string) {
  const botToken = getSecret("TELEGRAM_BOT_TOKEN") || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = getSecret("TELEGRAM_CHAT_ID") || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("[Lilith] Telegram credentials missing. BotToken:", !!botToken, "ChatId:", !!chatId);
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Lilith] Telegram API failure:", error);
    } else {
      console.log("[Lilith] Telegram notification sent successfully.");
    }
  } catch (err) {
    console.error("[Lilith] Critical error sending Telegram notification:", err);
  }
}

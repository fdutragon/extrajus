import fs from "fs";
import path from "path";

const SECRETS_FILE_PATH = path.join(process.cwd(), "data", "imperial_secrets.json");

export interface ImperialSecrets {
  GGPIX_API_KEY?: string;
  GGPIX_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  GEMINI_API_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export function getImperialSecrets(): ImperialSecrets {
  try {
    const dir = path.dirname(SECRETS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(SECRETS_FILE_PATH)) {
      return {};
    }
    const data = fs.readFileSync(SECRETS_FILE_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("Error reading imperial secrets:", err);
    return {};
  }
}

export function writeImperialSecrets(secrets: Partial<ImperialSecrets>) {
  try {
    const dir = path.dirname(SECRETS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const current = getImperialSecrets();
    const updated = { ...current, ...secrets };
    fs.writeFileSync(SECRETS_FILE_PATH, JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error("Error writing imperial secrets:", err);
  }
}

export function getSecret(key: keyof ImperialSecrets): string {
  const secrets = getImperialSecrets();
  if (secrets[key]) {
    return secrets[key]!;
  }
  return process.env[key] || "";
}

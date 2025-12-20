import { Telegraf } from "telegraf";
import { ENV } from "./env.js";

if (!ENV.TELEGRAM_TOKEN) {
  throw new Error("❌ TELEGRAM_BOT_TOKEN yuklanmadi");
}

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN);

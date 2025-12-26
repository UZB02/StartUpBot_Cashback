import "../config/db.js";
import { bot } from "../config/telegram.js";
import User from "../models/User.js";
import {
  startHandler,
  languageHandler,
  contactHandler,
  fullnameHandler,
  autoNumberHandler,
  menuTextHandler,
  filialHandler,
  regionHandler,
  filialInfoHandler,
} from "./handlers.js";
import { getMenu, getText } from "../services/locale.service.js";
import { getMainMenuKeyboard } from "../services/telegram.service.js";

// /start
bot.start(startHandler);

// Til tanlash (inline keyboard)
bot.action(/^lang_/, languageHandler);

// Region va filial action
bot.action(/^region_/, regionHandler);
bot.action(/^filial_/, filialInfoHandler);

// MESSAGE handler
bot.on("message", async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return;

  // Contact xabar
  if (ctx.message.contact) return contactHandler(ctx);

  // Main menu tugmalari
  const menu = getMenu(user);
  if (menu.includes(ctx.message.text)) return menuTextHandler(ctx);

  // Step handler
  switch (user.step) {
    case "fullname":
      return fullnameHandler(ctx, user);
    case "auto":
      return autoNumberHandler(ctx, user);
    case "done":
      return ctx.replyWithPhoto(
        { source: Buffer.from(user.qrcode.split(",")[1], "base64") },
        {
          caption: `👤 ${user.fullname}\n📞 ${user.phone}\n🚗 ${
            user.autoNumber
          }\n💰 ${getText(user, "balanceText", {
            balance: Math.floor(user.balance),
            purchase: user.latestPurchase?.amount || 0,
          })}`,
          reply_markup: getMainMenuKeyboard(user).reply_markup,
        }
      );
    default:
      return ctx.reply(
        getText(user, "invalidAction"),
        getMainMenuKeyboard(user)
      );
  }
});

bot.launch();
console.log("Telegram bot started!");

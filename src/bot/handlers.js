import User from "../models/User.js";
import { generateQRCode } from "../services/qr.service.js";
import { generateCardNumber,formatCardNumber } from "../services/cardnumber.service.js";
import {
  languageKeyboard,
  phoneKeyboard,
  removeKeyboard,
  getMainMenuKeyboard,
} from "../services/telegram.service.js";
import { getText, getMenu } from "../services/locale.service.js";

/* /start */
export const startHandler = async (ctx) => {
  let user = await User.findOne({ telegramId: ctx.from.id });

  if (!user) {
    user = await User.create({
      telegramId: ctx.from.id,
      step: "language",
      balance: 0,
    });

    return ctx.reply(getText(user, "selectLanguage"), languageKeyboard);
  }

  switch (user.step) {
    case "language":
      return ctx.reply(getText(user, "selectLanguage"), languageKeyboard);

    case "phone":
      return ctx.reply(getText(user, "phoneRequest"), phoneKeyboard);

    case "fullname":
      return ctx.reply(getText(user, "fullnameRequest"), removeKeyboard);

    case "auto":
      return ctx.reply(getText(user, "autoRequest"), removeKeyboard);

    case "done":
      return ctx.replyWithPhoto(
        { source: Buffer.from(user.qrcode.split(",")[1], "base64") },
        {
          caption:
            `👤 ${user.fullname}\n` +
            `📞 ${user.phone}\n` +
            `🚗 ${user.autoNumber}\n` +
            `💳 ${user.cardNumber}\n` +
            `💰 ${getText(user, "balanceText", {
              balance: user.balance,
              purchase: user.latestPurchase?.amount || 0,
            })}`,
          reply_markup: getMainMenuKeyboard(user).reply_markup,
        }
      );

    default:
      user.step = "language";
      await user.save();
      return ctx.reply(getText(user, "selectLanguage"), languageKeyboard);
  }
};

/* Til tanlash */
export const languageHandler = async (ctx) => {
  const lang = ctx.callbackQuery.data.split("_")[1];
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return;

  user.language = lang;

  if (!user.phone) {
    user.step = "phone";
    await user.save();
    await ctx.answerCbQuery();
    return ctx.reply(getText(user, "phoneRequest"), phoneKeyboard);
  }

  await user.save();
  await ctx.answerCbQuery();
  return ctx.reply(getText(user, "languageChanged"), getMainMenuKeyboard(user));
};

/* Telefon raqam */
export const contactHandler = async (ctx) => {
  const contact = ctx.message.contact;

  if (String(contact.user_id) !== String(ctx.from.id)) {
    return ctx.reply(getText({ language: "uz" }, "invalidPhone"));
  }

  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return;

  user.phone = contact.phone_number;
  user.step = "fullname";
  await user.save();

  return ctx.reply(getText(user, "fullnameRequest"), removeKeyboard);
};

/* Ism familiya */
export const fullnameHandler = async (ctx, user) => {
  user.fullname = ctx.message.text;
  user.step = "auto";
  await user.save();

  return ctx.reply(getText(user, "autoRequest"), removeKeyboard);
};

/* Avtomobil raqami */
export const autoNumberHandler = async (ctx, user) => {
  // 🚗 Avto raqam
  user.autoNumber = ctx.message.text;

  // 💳 Karta raqami faqat 1 marta yaratiladi
  if (!user.cardNumber) {
    user.cardNumber = generateCardNumber();
  }

  // 🔳 QR ichida userId + cardNumber
  const qr = await generateQRCode({
    userId: user._id,
    cardNumber: user.cardNumber,
  });

  user.qrcode = qr;
  user.step = "done";
  await user.save();

  return ctx.replyWithPhoto(
    { source: Buffer.from(qr.split(",")[1], "base64") },
    {
      caption:
        `${getText(user, "registrationDone")}\n\n` +
        `👤 ${user.fullname}\n` +
        `📞 ${user.phone}\n` +
        `🚗 ${user.autoNumber}\n` +
        `💳 ${user.cardNumber}\n` +
        `💰 ${getText(user, "balanceText", {
          balance: user.balance,
          purchase: user.latestPurchase?.amount || 0,
        })}`,
      reply_markup: getMainMenuKeyboard(user).reply_markup,
    }
  );
};

/* Main menu tugmalari */
export const menuTextHandler = async (ctx) => {
  const text = ctx.message.text;
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return;

  const menu = getMenu(user);

  switch (text) {
    case menu[0]:
      return ctx.replyWithPhoto(
        { source: Buffer.from(user.qrcode.split(",")[1], "base64") },
        {
          caption:
            `👤 ${user.fullname}\n` +
            `📞 ${user.phone}\n` +
            `🚗 ${user.autoNumber}\n` +
            `💳 ${user.cardNumber}\n` +
            `💰 ${getText(user, "balanceText", {
              balance: user.balance,
              purchase: user.latestPurchase?.amount || 0,
            })}`,
          reply_markup: getMainMenuKeyboard(user).reply_markup,
        }
      );

    case menu[1]:
      user.step = "fullname";
      await user.save();
      return ctx.reply(getText(user, "changeFullname"), removeKeyboard);

    case menu[2]:
      user.step = "auto";
      await user.save();
      return ctx.reply(getText(user, "changeAuto"), removeKeyboard);

    case menu[3]:
      return ctx.reply(getText(user, "selectLanguage"), languageKeyboard);

    default:
      return ctx.reply(
        getText(user, "invalidAction"),
        getMainMenuKeyboard(user)
      );
  }
};

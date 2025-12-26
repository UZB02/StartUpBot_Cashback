import User from "../models/User.js";
import Filial from "../models/Filial.js";
import { generateQRCode } from "../services/qr.service.js";
import { generateCardNumber } from "../services/cardnumber.service.js";
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
              balance: Math.floor(user.balance),
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
  user.autoNumber = ctx.message.text;

  if (!user.cardNumber) user.cardNumber = generateCardNumber();

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
          balance: Math.floor(user.balance),
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
    case menu[0]: // Balans
      return ctx.replyWithPhoto(
        { source: Buffer.from(user.qrcode.split(",")[1], "base64") },
        {
          caption:
            `👤 ${user.fullname}\n` +
            `📞 ${user.phone}\n` +
            `🚗 ${user.autoNumber}\n` +
            `💳 ${user.cardNumber}\n` +
            `💰 ${getText(user, "balanceText", {
              balance: Math.floor(user.balance),
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

    case menu[4]: // Filiallarimiz
      return filialHandler(ctx);

    default:
      return ctx.reply(
        getText(user, "invalidAction"),
        getMainMenuKeyboard(user)
      );
  }
};

/* ---------------- Filiallar qo‘shimchalari ---------------- */

// Filiallar inline keyboard
export const filialHandler = async (ctx) => {
  const regions = [
    "Namangan",
    "Andijon",
    "Farg'ona",
    "Samarqand",
    "Toshkent",
    "Buxoro",
    "Xorazm",
    "Qashqadaryo",
    "Surxondaryo",
    "Jizzax",
    "Sirdaryo",
    "Navoiy",
    "Toshkent shahar",
    "Qoraqalpog‘iston",
  ];

  const keyboard = regions.map((region) => [
    { text: region, callback_data: `region_${region}` },
  ]);
  return ctx.reply("📍 Iltimos, viloyatingizni tanlang:", {
    reply_markup: { inline_keyboard: keyboard },
  });
};

// Region tanlanganda filiallar chiqarish
export const regionHandler = async (ctx) => {
  const region = ctx.callbackQuery.data.split("_")[1];
  const filials = await Filial.find({ region, isActive: true });

  if (!filials.length)
    return ctx.reply("❌ Bu regionda faol filiallar mavjud emas.");

  const keyboard = filials.map((f) => [
    { text: f.name, callback_data: `filial_${f._id}` },
  ]);
  await ctx.answerCbQuery();
  return ctx.reply(`🏢 ${region} filiallari:`, {
    reply_markup: { inline_keyboard: keyboard },
  });
};

// Filial tanlanganda ma'lumot va joylashuvni yuborish
export const filialInfoHandler = async (ctx) => {
  try {
    const filialId = ctx.callbackQuery.data.split("_")[1];
    const filial = await Filial.findById(filialId);

    if (!filial) {
      await ctx.answerCbQuery();
      return ctx.reply("❌ Filial topilmadi.");
    }

    // Filial ma'lumotlari matni
    const info =
      `🏢 Filial: ${filial.name}\n` +
      `📍 Manzil: ${filial.address}\n` +
      `⏰ Ish vaqti: ${filial.workingHours.start} - ${filial.workingHours.end}`;

    await ctx.answerCbQuery(); // callbackQueryni javoblash
    await ctx.reply(info); // matnni yuborish

    // Agar location mavjud bo‘lsa, xarita yuborish
    if (filial.location && filial.location.coordinates) {
      const [long, lat] = filial.location.coordinates; // coordinates: [longitude, latitude]
      await ctx.telegram.sendLocation(ctx.chat.id, lat, long);
    }
  } catch (err) {
    console.error("Filial info xatolik:", err);
    return ctx.reply("❌ Filial ma'lumotlarini yuborishda xatolik yuz berdi.");
  }
};

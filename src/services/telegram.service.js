import { getMenu } from "./locale.service.js";

/* Til tanlash inline keyboard */
export const languageKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🇺🇿 O‘zbek", callback_data: "lang_uz" }],
      [{ text: "🇺🇿 Ўзбек", callback_data: "lang_uzk" }],
      [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
    ],
  },
};

/* Telefon raqam yuborish uchun keyboard */
export const phoneKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "📞 Telefon raqamni yuborish", request_contact: true }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

/* Keyboardni yashirish */
export const removeKeyboard = {
  reply_markup: { remove_keyboard: true },
};

/* Main menu – dinamik */
export const getMainMenuKeyboard = (user) => {
  const menu = getMenu(user);
  return {
    reply_markup: {
      keyboard: [
        [{ text: menu[0] }, { text: menu[1] }], // Balans [0]  // Ma'lumotlarni o'zgartirish[1]
        [{ text: menu[2] }, { text: menu[3] }], // Avto raqamni o'zgartirish [2] // Tilni o'zgartirish [3]
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
};

/* Default fallback main menu (uz tilida) */
export const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "💰 Balans" }],
      [{ text: "📝 Ma'lumotlarni o‘zgartirish" }],
      [{ text: "🚗 Avto raqamni o‘zgartirish" }],
      [{ text: "🌐 Tilni o‘zgartirish" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

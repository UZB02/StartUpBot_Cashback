import { uz } from "../locales/uz.js";
import { ru } from "../locales/ru.js";
import { uzk } from "../locales/uzk.js";

const locales = { uz, ru, uzk };

export const getText = (user, key, vars = {}) => {
  const lang = user?.language || "uz";
  const messages = locales[lang] || locales["uz"];
  let text = messages[key] || key;

  for (const varName in vars) {
    text = text.replace(`{${varName}}`, vars[varName]);
  }

  return text;
};

// Menu tugmalarini olish
export const getMenu = (user) => {
  const lang = user?.language || "uz";
  const messages = locales[lang] || locales["uz"];
  return [
    messages.menu.balance,
    messages.menu.editInfo,
    messages.menu.editAuto,
    messages.menu.changeLang,
  ];
};

const escape = (text = "") => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");

export const buildMarketingMessage = ({
  user,
  affordableProducts,
  filial,
  adminMessage,
}) => {
  let msg = `👋 Assalomu alaykum, ${escape(
    user.fullname || "hurmatli mijoz"
  )}!\n\n`;

  if (adminMessage) {
    msg += `📢 *${escape(adminMessage)}*\n\n`;
  }

  msg += `🏢 *${escape(filial.name)}*\n`;
  msg += `📍 ${escape(filial.address)}\n`;
  msg += `⏰ ${filial.workingHours.start} - ${filial.workingHours.end}\n\n`;

  msg += `💰 Balansingiz: *${user.balance.toLocaleString()} so'm*\n\n`;
  msg += `🛒 Balansingiz bilan olishingiz mumkin:\n\n`;

  affordableProducts.forEach((p) => {
    msg += `▪️ *${escape(p.name)}* — ${p.canBuy} ${p.unit}\n`;
  });

  msg += `\n🎁 Bonuslardan foydalanishga shoshiling!`;

  return msg;
};

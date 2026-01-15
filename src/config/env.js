export const ENV = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
  TELEGRAM_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  CASHBACK_PERCENT: Number(process.env.CASHBACK_PERCENT || 5),
};

// TELEGRAM_TOKEN: "8569358865:AAF-uuS9xsD-q8jWhyuLarZbCoeiL1o1vg0",
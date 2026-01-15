export const ENV = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES || "1d",
  CASHBACK_PERCENT: Number(process.env.CASHBACK_PERCENT || 5),
};

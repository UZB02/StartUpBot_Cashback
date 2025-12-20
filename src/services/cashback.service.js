export const calculateCashback = (amount) => {
  const percent = Number(process.env.CASHBACK_PERCENT);
  return (amount * percent) / 100;
};

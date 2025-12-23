/**
 * Cashback va umumiy summani hisoblash
 * @param {number|string} price - Mahsulot narxi (1 dona/litr)
 * @param {number|string} quantity - Mahsulot miqdori
 * @param {number|string} discount - Mahsulot chegirmasi (%)
 * @param {number|string} percent - Cashback foizi (%)
 * @returns {{ amount: number, cashback: number }}
 */
export const calculateCashback = (
  price,
  quantity,
  discount = 0,
  percent = 1
) => {
  const p = Number(price) || 0;
  const q = Number(quantity) || 0;
  const d = Number(discount) || 0;
  const cPercent = Number(percent) || 1;

  // Amount: discount inobatga olinmaydi
  const amount = p * q;

  // Cashback: discount inobatga olinadi
  const cashback = amount * (cPercent / 100);

  return {
    amount: Number(amount.toFixed(2)),
    cashback: Number(cashback.toFixed(2)),
  };
};

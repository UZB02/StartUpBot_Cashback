export const calculateAffordableProducts = (balance, products = []) => {
  if (!balance || balance <= 0) return [];

  return products
    .map((product) => {
      const price = Number(product.price) || 0;
      const discount = Math.min(Number(product.discount) || 0, 100);

      const finalPrice = price - (price * discount) / 100;

      if (finalPrice <= 0) return null;

      const canBuy = Math.floor(balance / finalPrice);

      return canBuy > 0
        ? {
            productId: product._id,
            name: product.name,
            unit: product.unit,
            price: finalPrice,
            canBuy,
          }
        : null;
    })
    .filter(Boolean);
};

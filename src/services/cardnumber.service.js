// utils/cardNumber.js

export const generateCardNumber = () => {
  const prefix = "4780";
  let number = "";

  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10);
  }

  return prefix + number; // 16 xonali
};

export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return "";
  return cardNumber.replace(/(.{4})/g, "$1 ").trim();
};

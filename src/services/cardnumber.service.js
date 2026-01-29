// export const generateCardNumber = () => {
//   const prefix = "4780";
//   let number = "";

//   for (let i = 0; i < 12; i++) {
//     number += Math.floor(Math.random() * 10);
//   }

//   return prefix + number;
// };
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return "";
  return cardNumber
    .replace(/\s+/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};

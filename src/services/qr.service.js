import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { v4 as uuid } from "uuid";
import { formatCardNumber } from "./cardnumber.service.js";


export const generateQRCode = async ({ userId, cardNumber }) => {
  const token = uuid();

  const qrData = JSON.stringify({
    userId,
    cardNumber,
    token,
  });

  // 1️⃣ Oddiy QR yaratamiz
  const qrBase64 = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 2,
  });

  // 2️⃣ Canvas tayyorlaymiz
  const qrImage = await loadImage(qrBase64);

  const canvasWidth = qrImage.width;
  const canvasHeight = qrImage.height + 50; // pastiga joy

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // 3️⃣ Oq fon
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 4️⃣ QR rasm
  ctx.drawImage(qrImage, 0, 0);

  // 5️⃣ Pastidagi karta raqami
  ctx.fillStyle = "#000000";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";

ctx.fillText(
  formatCardNumber(cardNumber),
  canvasWidth / 2,
  qrImage.height + 35
);


  // 6️⃣ Yakuniy base64
  return canvas.toDataURL("image/png");
};

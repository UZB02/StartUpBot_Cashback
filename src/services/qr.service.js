import QRCode from "qrcode";
import { v4 as uuid } from "uuid";

export const generateQRCode = async ({ userId, cardNumber }) => {
  const token = uuid();

  const qrData = JSON.stringify({
    userId,
    cardNumber,
    token,
  });

  const qrBase64 = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 2,
  });

  return qrBase64; // PNG base64
};

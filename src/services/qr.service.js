import QRCode from "qrcode";
import { v4 as uuid } from "uuid";

export const generateQRCode = async (userId) => {
  const token = uuid();
  const data = JSON.stringify({ userId, token });
  return await QRCode.toDataURL(data);
};

import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateToken = (payload) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET aniqlanmagan (.env yuklanmagan)");
  }

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES,
  });
};

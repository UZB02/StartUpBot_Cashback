import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Telefon va parol majburiy" });
    }

    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(404).json({ message: "Admin topilmadi" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Xato parol" });
    }

    const token = generateToken({
      id: admin._id,
      role: admin.role,
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        phone: admin.phone,
        role: admin.role,
        filial: admin.filial,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi" });
  }
};

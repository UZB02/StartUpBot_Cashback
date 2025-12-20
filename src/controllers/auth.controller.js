import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const login = async (req, res) => {
  const { login, password } = req.body;

  const admin = await Admin.findOne({ login });
  if (!admin) return res.status(404).json({ message: "Topilmadi" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: "Xato parol" });

  const token = generateToken({
    id: admin._id,
    role: admin.role,
  });

  res.json({ token });
};

import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

export const createAdmin = async (req, res) => {
  const { fullname, login, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    fullname,
    login,
    password: hashed,
    role,
  });

  res.json(admin);
};

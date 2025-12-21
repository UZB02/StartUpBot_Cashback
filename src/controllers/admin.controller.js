import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

// 1️⃣ Admin yaratish
export const createAdmin = async (req, res) => {
  try {
    const { fullname, phone, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      fullname,
      phone,
      password: hashed,
      role,
    });

    res.json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

// 2️⃣ Barcha adminlarni olish
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").populate("filial");
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

// 3️⃣ Bitta adminni olish (id bo‘yicha)
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id)
      .select("-password")
      .populate("filial");
    if (!admin) return res.status(404).json({ message: "Admin topilmadi" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

// 4️⃣ Adminni tahrirlash
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, phone, password, role } = req.body;

    const updateData = { fullname, phone, role };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedAdmin)
      return res.status(404).json({ message: "Admin topilmadi" });

    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

// 5️⃣ Adminni o'chirish
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Admin topilmadi" });
    res.json({ message: "Admin o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

/* CREATE FIRST (ONLY) SUPERADMIN */
export const createSuperAdmin = async (req, res) => {
  try {
    const { fullname, phone, password } = req.body;

    // Agar superadmin allaqachon mavjud bo‘lsa
    const superAdminExists = await Admin.findOne({ role: "superadmin" });
    if (superAdminExists) {
      return res
        .status(403)
        .json({ message: "Super admin allaqachon yaratilgan" });
    }

    if (!fullname || !phone || !password) {
      return res.status(400).json({ message: "Barcha maydonlar majburiy" });
    }

    const phoneExists = await Admin.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({ message: "Telefon allaqachon mavjud" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      fullname,
      phone,
      password: hashed,
      role: "superadmin",
    });

    res.status(201).json({
      message: "Super admin muvaffaqiyatli yaratildi",
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi" });
  }
};

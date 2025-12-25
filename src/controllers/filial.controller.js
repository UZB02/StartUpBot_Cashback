import Filial from "../models/Filial.js";
import Admin from "../models/Admin.js";
import mongoose from "mongoose";

/* ================== FILIAL CRUD ================== */

/* ➕ Filial qo‘shish */
export const createFilial = async (req, res) => {
  try {
    const { name, address, region, location, workingHours } = req.body;
    if (!name) return res.status(400).json({ message: "Filial nomi majburiy" });
    if (!region) return res.status(400).json({ message: "Viloyat majburiy" });

    const filial = await Filial.create({
      name,
      address,
      region,
      admins: [],
      location: location || { type: "Point", coordinates: [0, 0] },
      workingHours: workingHours || { start: "09:00", end: "18:00" },
    });

    res.status(201).json(filial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 📄 Barcha filiallar */
export const getFilials = async (req, res) => {
  try {
    let filials;

    if (req.user.role === "superadmin") {
      filials = await Filial.find()
        .sort({ createdAt: -1 })
        .populate("admins", "-password");
    } else {
      filials = await Filial.find({
        admins: new mongoose.Types.ObjectId(req.user.id),
      })
        .sort({ createdAt: -1 })
        .populate("admins", "-password");
    }

    res.json(filials);
  } catch (err) {
    console.error("getFilials error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* 📄 Bitta filial */
export const getFilialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Noto‘g‘ri ID" });

    const filial = await Filial.findById(id).populate("admins", "-password");
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    res.json(filial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ✏️ Filialni tahrirlash */
export const updateFilial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, region, isActive, location, workingHours } =
      req.body;

    if (!region) return res.status(400).json({ message: "Viloyat majburiy" }); // ✅ qo‘shish

    const filial = await Filial.findByIdAndUpdate(
      id,
      {
        name,
        address,
        region, // ✅ region qo‘shildi
        isActive,
        location: location || { type: "Point", coordinates: [0, 0] },
        workingHours: workingHours || { start: "09:00", end: "18:00" },
      },
      { new: true }
    ).populate("admins", "-password");

    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    res.json(filial);
  } catch (err) {
    console.error("updateFilial error:", err); // ❗ log qo‘shish
    res.status(500).json({ message: err.message });
  }
};


/* 🗑 Filialni o‘chirish */
export const deleteFilial = async (req, res) => {
  try {
    const { id } = req.params;
    const filial = await Filial.findByIdAndDelete(id);
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    // Shu filialga bog‘langan adminlarni bo‘shatish
    await Admin.updateMany({ filial: id }, { $unset: { filial: "" } });

    res.json({ message: "Filial o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================== ADMIN ↔ FILIAL ================== */

/* 🔗 Adminni filialga biriktirish */
export const assignAdminToFilial = async (req, res) => {
  try {
    const { adminId, filialId } = req.body;
    if (!adminId || !filialId)
      return res.status(400).json({ message: "adminId va filialId majburiy" });

    const filial = await Filial.findById(filialId);
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin topilmadi" });

    admin.filial = filialId;
    await admin.save();

    if (!filial.admins.includes(adminId)) {
      filial.admins.push(adminId);
      await filial.save();
    }

    const result = await Admin.findById(adminId).select("-password");
    res.json({ message: "Admin filialga biriktirildi", admin: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ❌ Adminni filialdan olib tashlash */
export const removeAdminFromFilial = async (req, res) => {
  try {
    const { adminId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adminId))
      return res.status(400).json({ message: "Noto‘g‘ri admin ID" });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin topilmadi" });

    const filial = await Filial.findById(admin.filial);
    if (filial) {
      filial.admins = filial.admins.filter((id) => id.toString() !== adminId);
      await filial.save();
    }

    admin.filial = null;
    await admin.save();

    res.json({ message: "Admin filialdan olib tashlandi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* 👥 Filial adminlari */
export const getFilialAdmins = async (req, res) => {
  try {
    const { filialId } = req.params;
    const admins = await Admin.find({ filial: filialId })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

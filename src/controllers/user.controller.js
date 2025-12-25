import User from "../models/User.js";

/**
 * 🔍 Telefon yoki autoNumber bo‘yicha user topish
 * GET /api/users/find?phone=... yoki ?autoNumber=...
 */
export const findUser = async (req, res) => {
  try {
    const { phone, autoNumber, fullname, qrcode, userId } = req.query;

    if (!phone && !autoNumber && !fullname && !qrcode && !userId) {
      return res.status(400).json({
        message:
          "phone, autoNumber, fullname, qrcode yoki userId yuborilishi kerak",
      });
    }

    const orQuery = [];

    if (userId) orQuery.push({ _id: userId });
    if (phone) orQuery.push({ phone });
    if (autoNumber) orQuery.push({ autoNumber });
    if (qrcode) orQuery.push({ qrcode });
    if (fullname) {
      orQuery.push({
        fullname: { $regex: fullname, $options: "i" },
      });
    }

    const user = await User.findOne({ $or: orQuery }).populate("companyFilial");

    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📋 Barcha foydalanuvchilarni olish
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("companyFilial")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 👤 ID bo‘yicha user olish
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("companyFilial");

    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ✏️ Foydalanuvchini tahrirlash
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("companyFilial");

    if (!updatedUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🗑 Foydalanuvchini o‘chirish
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    res.json({ message: "Foydalanuvchi o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

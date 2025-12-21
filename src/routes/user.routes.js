import { Router } from "express";
import {
  findUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// 🔍 Telefon yoki autoNumber orqali qidirish
router.get("/find", authMiddleware, findUser);

// 📋 Barcha foydalanuvchilar
router.get("/", authMiddleware, getAllUsers);

// 👤 ID bo‘yicha bitta foydalanuvchi
router.get("/:id", authMiddleware, getUserById);

// ✏️ Tahrirlash
router.put("/:id", authMiddleware, updateUser);

// 🗑 O‘chirish
router.delete("/:id", authMiddleware, deleteUser);

export default router;

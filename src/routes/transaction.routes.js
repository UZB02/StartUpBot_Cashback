import { Router } from "express";
import {
  addPurchase,
  spendBalance,
  getTransactions,
  getProductsByFilial,
} from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

/* ➕ Xarid qo‘shish (earn) */
router.post("/add", authMiddleware, addPurchase);

/* 💸 Balansdan sarflash (spend) */
router.post("/spend", authMiddleware, spendBalance);

/* 📄 Barcha tranzaksiyalarni olish */
router.get("/", authMiddleware, getTransactions);

/* 🔹 Filialga qarab mahsulotlarni olish */
router.get("/products", authMiddleware, getProductsByFilial);

export default router;

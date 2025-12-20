import { Router } from "express";
import {
  addPurchase,
  spendBalance,
} from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/add", authMiddleware, addPurchase);
router.post("/spend", authMiddleware, spendBalance);
export default router;

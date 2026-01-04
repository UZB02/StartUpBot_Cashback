import { Router } from "express";
import {
  getTransactionSummary,
  getLatestTransactions,
  getTopUsersByEarn,
  getTransactionStats,
  getProductComparison,
  getProductGrowth
} from "../controllers/transaction.dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", authMiddleware, getTransactionSummary);
router.get("/latest", authMiddleware, getLatestTransactions);
router.get("/top-users", authMiddleware, getTopUsersByEarn);
router.get("/stats", authMiddleware, getTransactionStats);
// 🔥 PRODUCT COMPARISON
router.get("/product-comparison", authMiddleware, getProductComparison);
router.get("/product-growth", authMiddleware, getProductGrowth);



export default router;

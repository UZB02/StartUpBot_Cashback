import { Router } from "express";
import {
  getTransactionSummary,
  getLatestTransactions,
  getTopUsersByEarn,
  getTransactionStats,
} from "../controllers/transaction.dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", authMiddleware, getTransactionSummary);
router.get("/latest", authMiddleware, getLatestTransactions);
router.get("/top-users", authMiddleware, getTopUsersByEarn);
router.get("/stats", authMiddleware, getTransactionStats);

export default router;

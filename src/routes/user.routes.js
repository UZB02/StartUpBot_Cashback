import { Router } from "express";
import { findUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.get("/find", authMiddleware, findUser);
export default router;

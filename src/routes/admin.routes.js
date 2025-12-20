import { Router } from "express";
import { createAdmin } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();
router.post("/", authMiddleware, checkRole(["superadmin"]), createAdmin);
export default router;

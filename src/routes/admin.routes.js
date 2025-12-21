import { Router } from "express";
import {
  createAdmin,
  createSuperAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = Router();

// 🔹 Superadmin yaratish (faqat bitta)
router.post("/superadmin/init", createSuperAdmin);

// 🔹 Admin CRUD (faqat superadmin)
router.post("/", authMiddleware, checkRole(["superadmin"]), createAdmin);
router.get("/", authMiddleware, checkRole(["superadmin"]), getAdmins);
router.get("/:id", authMiddleware, checkRole(["superadmin"]), getAdminById);
router.put("/:id", authMiddleware, checkRole(["superadmin"]), updateAdmin);
router.delete("/:id", authMiddleware, checkRole(["superadmin"]), deleteAdmin);

export default router;

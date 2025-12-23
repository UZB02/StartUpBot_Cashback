import express from "express";
import {
  createFilial,
  updateFilial,
  deleteFilial,
  assignAdminToFilial,
  getFilials,
  getFilialById,
  getFilialAdmins,
  removeAdminFromFilial,
} from "../controllers/filial.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

/* 🔒 FAQAT SUPERADMIN */
router.post("/", authMiddleware, checkRole(["superadmin"]), createFilial);
router.put("/:id", authMiddleware, checkRole(["superadmin"]), updateFilial);
router.delete("/:id", authMiddleware, checkRole(["superadmin"]), deleteFilial);

router.post(
  "/assign-admin",
  authMiddleware,
  checkRole(["superadmin"]),
  assignAdminToFilial
);
router.put(
  "/remove-admin/:adminId",
  authMiddleware,
  checkRole(["superadmin"]),
  removeAdminFromFilial
);

router.get(
  "/:filialId/admins",
  authMiddleware,
  checkRole(["superadmin"]),
  getFilialAdmins
);

/* (ixtiyoriy) */
router.get("/", authMiddleware, checkRole(["admin","superadmin"]), getFilials);
router.get("/:id", authMiddleware, checkRole(["superadmin"]), getFilialById);

export default router;

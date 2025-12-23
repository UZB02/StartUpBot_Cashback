import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyGlobalDiscount,
} from "../controllers/product.controller.js";

const router = express.Router();

// CRUD
router.post("/", createProduct); // filial tanlash majburiy
router.get("/", getProducts); // filial bilan
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Umumiy chegirma
router.put("/discount/all", applyGlobalDiscount);

export default router;

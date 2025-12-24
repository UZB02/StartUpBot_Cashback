import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  applyGlobalDiscount,
  getProductsByFilial
} from "../controllers/product.controller.js";

const router = express.Router();

// CRUD
// Filial bo'yicha productlar
router.get("/by-filial", getProductsByFilial);
router.post("/", createProduct); // filial tanlash majburiy
router.get("/", getProducts); // filial bilan
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);



// Umumiy chegirma
router.put("/discount/all", applyGlobalDiscount);

export default router;

import Product from "../models/Product.js";
import Filial from "../models/Filial.js";
import mongoose from "mongoose";

/* ➕ Product qo'shish */
export const createProduct = async (req, res) => {
  try {
    const { name, unit, price, discount, quantity, filial } = req.body;

    if (!name || !price || !filial) {
      return res
        .status(400)
        .json({ message: "Name, price va filial majburiy" });
    }

    // Filial mavjudligini tekshirish
    const existingFilial = await Filial.findById(filial);
    if (!existingFilial)
      return res.status(404).json({ message: "Filial topilmadi" });

    const product = new Product({
      name,
      unit,
      price,
      discount,
      quantity: quantity ?? 0, // quantity default 0
      filial,
    });

    await product.save();
    res.status(201).json({ message: "Product qo'shildi", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* 📝 Barcha productlarni olish (filial bilan) */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("filial", "name address")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔍 Bitta productni ID bo'yicha olish (filial bilan) */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "filial",
      "name address"
    );
    if (!product) return res.status(404).json({ message: "Product topilmadi" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ✏️ Productni yangilash */
export const updateProduct = async (req, res) => {
  try {
    const { name, unit, price, discount, quantity, isActive, filial } =
      req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product topilmadi" });

    if (filial) {
      const existingFilial = await Filial.findById(filial);
      if (!existingFilial)
        return res.status(404).json({ message: "Filial topilmadi" });
      product.filial = filial;
    }

    product.name = name ?? product.name;
    product.unit = unit ?? product.unit;
    product.price = price ?? product.price;
    product.discount = discount ?? product.discount;
    product.quantity = quantity ?? product.quantity; // ✅ quantity yangilash
    product.isActive = isActive ?? product.isActive;

    await product.save();
    res.json({ message: "Product yangilandi", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ❌ Productni o'chirish */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product topilmadi" });
    res.json({ message: "Product o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 💰 Barcha productlarga umumiy chegirma qo'yish */
export const applyGlobalDiscount = async (req, res) => {
  try {
    const { discount } = req.body; // foiz
    if (discount == null)
      return res.status(400).json({ message: "Discount majburiy" });

    await Product.updateMany({}, { discount });
    res.json({ message: `Barcha productlarga ${discount}% chegirma qo'yildi` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔍 Filial bo'yicha productlarni olish yoki barcha productlar */
export const getProductsByFilial = async (req, res) => {
  try {
    const { filial } = req.query;

    // Filter obyektini yaratamiz
    const filter = {};

    if (filial) {
      // ID validligini tekshirish
      if (!mongoose.Types.ObjectId.isValid(filial)) {
        return res.status(400).json({ message: "Filial ID noto‘g‘ri" });
      }

      // Filial mavjudligini tekshirish
      const existingFilial = await Filial.findById(filial);
      if (!existingFilial) {
        return res.status(404).json({ message: "Filial topilmadi" });
      }

      filter.filial = filial;
    }

    // Productlarni filter bo‘yicha olish
    const products = await Product.find(filter)
      .populate("filial", "name address")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("getProductsByFilial error:", error);
    res.status(500).json({ message: "Server xatoligi: " + error.message });
  }
};
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Filial from "../models/Filial.js";
import { calculateCashback } from "../services/cashback.service.js";

/* ➕ Xarid qo‘shish (earn) */
export const addPurchase = async (req, res) => {
  try {
    const { userId, filialId, items } = req.body;

    if (!userId || !filialId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "userId, filialId va items majburiy" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const filial = await Filial.findById(filialId);
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    let totalAmount = 0;
    let totalCashback = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res
          .status(404)
          .json({ message: `Product topilmadi: ${item.productId}` });

      const { amount, cashback } = calculateCashback(
        product.price,
        item.quantity,
        product.discount || 0,
        1
      );

      totalAmount += amount;
      totalCashback += cashback;

      transactionItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount || 0,
        amount,
        cashback,
      });
    }

    const transaction = await Transaction.create({
      user: userId,
      admin: req.user.id,
      filial: filialId,
      type: "earn",
      items: transactionItems,
      totalAmount,
      totalCashback,
    });

    user.balance = (user.balance || 0) + totalCashback;
    await user.save();

    res.json({ message: "Xarid muvaffaqiyatli qo‘shildi", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* 💸 Balansdan sarflash (spend) */
export const spendBalance = async (req, res) => {
  try {
    const { userId, filialId, items } = req.body;

    if (!userId || !filialId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "userId, filialId va items majburiy" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const filial = await Filial.findById(filialId);
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    let totalAmount = 0;
    const transactionItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res
          .status(404)
          .json({ message: `Product topilmadi: ${item.productId}` });

      const quantity = Number(item.quantity);
      const price = product.price;
      const discount = product.discount || 0;

      const amount = price * quantity - discount;
      totalAmount += amount;

      transactionItems.push({
        product: product._id,
        quantity,
        price,
        discount,
        amount,
        cashback: 0,
      });
    }

    if ((user.balance || 0) < totalAmount) {
      return res.status(400).json({ message: "Balans yetarli emas" });
    }

    const transaction = await Transaction.create({
      user: userId,
      admin: req.user.id,
      filial: filialId,
      type: "spend",
      items: transactionItems,
      totalAmount,
      totalCashback: 0,
    });

    user.balance -= totalAmount;
    await user.save();

    res.json({
      message: "Balansdan muvaffaqiyatli sarflandi",
      transaction,
      balance: user.balance,
    });
  } catch (error) {
    console.error("spendBalance error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 📄 Barcha tranzaksiyalarni olish */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "fullname phone")
      .populate("admin", "fullname")
      .populate("filial", "name")
      .populate("items.product", "name price unit");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 🔹 Filialga qarab productlarni olish */
export const getProductsByFilial = async (req, res) => {
  try {
    const { filialId } = req.query;
    if (!filialId)
      return res.status(400).json({ message: "filialId majburiy" });

    const products = await Product.find({ filial: filialId });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

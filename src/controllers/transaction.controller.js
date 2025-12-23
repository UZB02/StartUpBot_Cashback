import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Filial from "../models/Filial.js";
import { calculateCashback } from "../services/cashback.service.js";

/* ➕ Xarid qo‘shish (earn) */
export const addPurchase = async (req, res) => {
  try {
    const { userId, productId, filialId, quantity } = req.body;

    if (!userId || !productId || !filialId || !quantity) {
      return res.status(400).json({ message: "userId, productId, filialId va quantity majburiy" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product topilmadi" });

    const filial = await Filial.findById(filialId);
    if (!filial) return res.status(404).json({ message: "Filial topilmadi" });

    // Amount va cashback hisoblash
    const { amount, cashback } = calculateCashback(product.price, quantity, product.discount, 1); // cashback foizi 1%

    // Transaction yaratish
    const transaction = await Transaction.create({
      user: userId,
      admin: req.user.id,
      product: productId,
      filial: filialId,
      type: "earn",
      quantity,
      amount,
      cashback,
    });

    // User balansini yangilash
    user.balance = (user.balance || 0) + cashback;
    user.latestPurchase = {
      product: productId,
      filial: filialId,
      quantity,
      amount,
      cashback,
      date: new Date(),
    };
    await user.save();

    res.json({ message: "Xarid qo‘shildi", transaction, cashback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* 💸 Balansdan sarflash (spend) */
export const spendBalance = async (req, res) => {
  try {
    const { userId, amount, productId, filialId } = req.body;

    if (!userId || !amount || !productId || !filialId) {
      return res.status(400).json({
        message: "userId, productId, filialId va amount majburiy",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    if (user.balance < amount) {
      return res.status(400).json({ message: "Balans yetarli emas" });
    }

    // Transaction yaratish (optional quantity, amount bilan)
    await Transaction.create({
      user: userId,
      admin: req.user.id,
      product: productId,
      filial: filialId,
      type: "spend",
      amount,
    });

    // Balansdan shunchaki ayirish
    user.balance -= amount;
    await user.save();

    res.json({ message: "Balansdan ayirildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


/* 📄 Barcha tranzaksiyalarni olish (filial va product bilan populate) */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "fullname phone")
      .populate("admin", "fullname")
      .populate("product", "name unit price")
      .populate("filial", "name");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

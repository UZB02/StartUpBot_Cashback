import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Filial from "../models/Filial.js";
import { calculateCashback } from "../services/cashback.service.js";

/* =====================================================
   ➕ Xarid qo‘shish (EARN / Cashback olish)
===================================================== */
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

    // 🔁 PRODUCTLAR BO‘YICHA AYLANAMIZ
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product topilmadi: ${item.productId}`,
        });
      }

      const quantity = Number(item.quantity);

      if (quantity <= 0) {
        return res.status(400).json({
          message: "Quantity noto‘g‘ri",
        });
      }

      // ❗ Omborda yetarlimi?
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `${product.name} uchun yetarli miqdor yo‘q`,
        });
      }

      const { amount, cashback } = calculateCashback(
        product.price,
        quantity,
        product.discount || 0,
        1
      );

      totalAmount += amount;
      totalCashback += cashback;

      transactionItems.push({
        product: product._id,
        quantity,
        price: product.price,
        discount: product.discount || 0,
        amount,
        cashback,
      });

      // 🔥 OMBORDAN AYIRAMIZ
      product.quantity -= quantity;
      await product.save();
    }

    // ➕ TRANSACTION YARATISH
    const transaction = await Transaction.create({
      user: userId,
      admin: req.user.id,
      filial: filialId,
      type: "earn",
      items: transactionItems,
      totalAmount,
      totalCashback,
    });

    // 🔥 USER BALANS + OXIRGI XARID
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: totalCashback },
        $set: {
          latestPurchase: {
            amount: totalAmount,
            cashback: totalCashback,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({
      message: "Xarid muvaffaqiyatli qo‘shildi",
      transaction,
    });
  } catch (error) {
    console.error("addPurchase error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   💸 Balansdan sarflash (SPEND)
===================================================== */
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

    // 🔁 PRODUCTLAR BO‘YICHA AYLANAMIZ
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product topilmadi: ${item.productId}`,
        });
      }

      const quantity = Number(item.quantity);

      if (quantity <= 0) {
        return res.status(400).json({
          message: "Quantity noto‘g‘ri",
        });
      }

      // ❗ Ombor tekshiruvi
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `${product.name} uchun yetarli miqdor yo‘q`,
        });
      }

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

      // 🔥 OMBORDAN AYIRAMIZ
      product.quantity -= quantity;
      await product.save();
    }

    // ❗ BALANS TEKSHIRUVI
    if ((user.balance || 0) < totalAmount) {
      return res.status(400).json({
        message: "Balans yetarli emas",
      });
    }

    // ➖ TRANSACTION YARATISH
    const transaction = await Transaction.create({
      user: userId,
      admin: req.user.id,
      filial: filialId,
      type: "spend",
      items: transactionItems,
      totalAmount,
      totalCashback: 0,
    });

    // 🔥 USER BALANS UPDATE
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: -totalAmount },
        $set: {
          latestPurchase: {
            amount: totalAmount,
            cashback: 0,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({
      message: "Balansdan muvaffaqiyatli sarflandi",
      transaction,
    });
  } catch (error) {
    console.error("spendBalance error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   📄 Barcha tranzaksiyalar
===================================================== */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "fullname phone")
      .populate("admin", "fullname")
      .populate("filial", "name")
      .populate("items.product", "name price unit");

    res.json(transactions);
  } catch (error) {
    console.error("getTransactions error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🔹 Filialga qarab productlar
===================================================== */
export const getProductsByFilial = async (req, res) => {
  try {
    const { filialId } = req.query;
    if (!filialId) {
      return res.status(400).json({ message: "filialId majburiy" });
    }

    const products = await Product.find({ filial: filialId });
    res.json(products);
  } catch (error) {
    console.error("getProductsByFilial error:", error);
    res.status(500).json({ message: error.message });
  }
};

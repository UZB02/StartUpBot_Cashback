import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { calculateCashback } from "../services/cashback.service.js";

export const addPurchase = async (req, res) => {
  const { userId, amount } = req.body;

  const cashback = calculateCashback(amount);

  await Transaction.create({
    user: userId,
    admin: req.user.id,
    type: "earn",
    amount,
    percent: process.env.CASHBACK_PERCENT,
  });

  await User.findByIdAndUpdate(userId, {
    $inc: { balance: cashback },
    latestPurchase: {
      amount,
      cashback,
      date: new Date(),
    },
  });

  res.json({ message: "Qo‘shildi", cashback });
};

export const spendBalance = async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);

  if (user.balance < amount) {
    return res.status(400).json({ message: "Balans yetarli emas" });
  }

  await Transaction.create({
    user: userId,
    admin: req.user.id,
    type: "spend",
    amount,
  });

  user.balance -= amount;
  await user.save();

  res.json({ message: "Ayirildi" });
};

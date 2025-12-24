import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Product from "../models/Product.js"; // mahsulot modeli

/* ---------- HELPER: date range ---------- */
const getDateRange = (period, year, month, from) => {
  const now = new Date();
  let startDate, endDate;

  if (period === "day") {
    // agar from kelsa — o‘sha kun, bo‘lmasa — bugun
    const day = from ? new Date(from) : new Date();

    startDate = new Date(day);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(day);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  // qolgan periodlar o‘z holicha
  const selectedYear = Number(year) || now.getFullYear();
  const selectedMonth = Number(month) || now.getMonth() + 1;

  if (period === "year") {
    startDate = new Date(selectedYear, 0, 1);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
  } else if (period === "month") {
    startDate = new Date(selectedYear, selectedMonth - 1, 1);
    endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
  } else if (period === "week") {
    const today = new Date();
    const day = today.getDay() || 7;

    startDate = new Date(today);
    startDate.setDate(today.getDate() - day + 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/* ---------- HELPER: Build match ---------- */
const buildMatch = (req) => {
  const { period, year, month, from, to, filial } = req.query;

  const { startDate, endDate } = getDateRange(period, year, month, from, to);

  // himoya: sana yo‘q bo‘lsa
  if (!startDate || !endDate) {
    throw new Error("Date range noto‘g‘ri berilgan");
  }

  const match = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (req.user.role !== "superadmin") {
    match.admin = new mongoose.Types.ObjectId(req.user.id);
  }

  if (filial) {
    match.filial = new mongoose.Types.ObjectId(filial);
  }

  return match;
};


/* ---------- GET PRODUCTS BY FILIAL ---------- */
export const getProductsByFilial = async (req, res) => {
  try {
    const { filial } = req.query;

    if (!filial) return res.status(400).json({ message: "Filial ID required" });

    const products = await Product.find({ filial, isActive: true }).select(
      "_id name unit price"
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- SUMMARY ---------- */
export const getTransactionSummary = async (req, res) => {
  try {
    const match = buildMatch(req);
    const productId = req.query.product;

    let pipeline = [{ $match: match }];

    if (productId) {
      pipeline.push({ $unwind: "$items" });
      pipeline.push({
        $match: { "items.product": new mongoose.Types.ObjectId(productId) },
      });
      pipeline.push({
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$items.amount" },
          count: { $sum: 1 },
        },
      });
    } else {
      pipeline.push({
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      });
    }

    const data = await Transaction.aggregate(pipeline);

    const summary = {
      earn: 0,
      spend: 0,
      earnCount: 0,
      spendCount: 0,
      balance: 0,
    };

    data.forEach((item) => {
      if (item._id === "earn") {
        summary.earn = item.totalAmount;
        summary.earnCount = item.count;
      }
      if (item._id === "spend") {
        summary.spend = item.totalAmount;
        summary.spendCount = item.count;
      }
    });

    summary.balance = summary.earn - summary.spend;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- STATS / CHART ---------- */
export const getTransactionStats = async (req, res) => {
  try {
    const { period = "year" } = req.query;
    const match = buildMatch(req);
    const productId = req.query.product;

    let dateFormat = "%Y-%m";
    if (period === "month" || period === "week") dateFormat = "%Y-%m-%d";
    if (period === "day") dateFormat = "%H:00";

    let pipeline = [{ $match: match }];
    if (productId) {
      pipeline.push({ $unwind: "$items" });
      pipeline.push({
        $match: { "items.product": new mongoose.Types.ObjectId(productId) },
      });
    }

    pipeline.push({
      $group: {
        _id: {
          label: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          type: "$type",
        },
        total: productId ? { $sum: "$items.amount" } : { $sum: "$totalAmount" },
      },
    });

    pipeline.push({
      $group: {
        _id: "$_id.label",
        earn: {
          $sum: { $cond: [{ $eq: ["$_id.type", "earn"] }, "$total", 0] },
        },
        spend: {
          $sum: { $cond: [{ $eq: ["$_id.type", "spend"] }, "$total", 0] },
        },
      },
    });

    pipeline.push({ $sort: { _id: 1 } });

    const data = await Transaction.aggregate(pipeline);

    res.json(
      data.map((i) => ({
        label: i._id,
        earn: i.earn,
        spend: i.spend,
        balance: i.earn - i.spend,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- LATEST TRANSACTIONS ---------- */
export const getLatestTransactions = async (req, res) => {
  try {
    const match = buildMatch(req);
    const productId = req.query.product;

    let transactions = await Transaction.find(match)
      .populate("user", "fullname phone")
      .populate("admin", "fullname phone role")
      .populate("filial", "name")
      .populate("items.product", "name unit price")
      .sort({ createdAt: -1 })
      .limit(10);

    if (productId) {
      transactions = transactions.map((tx) => {
        const filteredItems = tx.items.filter(
          (item) => item.product._id.toString() === productId
        );
        const totalAmount = filteredItems.reduce((sum, i) => sum + i.amount, 0);
        const totalCashback = filteredItems.reduce(
          (sum, i) => sum + i.cashback,
          0
        );
        return {
          ...tx.toObject(),
          items: filteredItems,
          totalAmount,
          totalCashback,
        };
      });
    }

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- TOP USERS BY EARN ---------- */
export const getTopUsersByEarn = async (req, res) => {
  try {
    const match = buildMatch(req);
    const productId = req.query.product;
    match.type = "earn";

    let pipeline = [{ $match: match }];
    if (productId) {
      pipeline.push({ $unwind: "$items" });
      pipeline.push({
        $match: { "items.product": new mongoose.Types.ObjectId(productId) },
      });
      pipeline.push({
        $group: { _id: "$user", totalEarn: { $sum: "$items.amount" } },
      });
    } else {
      pipeline.push({
        $group: { _id: "$user", totalEarn: { $sum: "$totalAmount" } },
      });
    }

    pipeline.push({ $sort: { totalEarn: -1 } });
    pipeline.push({ $limit: 5 });

    let users = await Transaction.aggregate(pipeline);
    const populated = await User.populate(users, {
      path: "_id",
      select: "fullname phone balance",
    });

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

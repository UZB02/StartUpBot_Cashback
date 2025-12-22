import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

/* ---------- HELPER: date range ---------- */
const getDateRange = (period, year, month, from, to) => {
  const now = new Date();
  const selectedYear = Number(year) || now.getFullYear();
  const selectedMonth = Number(month) || now.getMonth() + 1;

  let startDate, endDate;

  if (from && to) {
    startDate = new Date(from);
    endDate = new Date(to);
  } else if (period === "year") {
    startDate = new Date(selectedYear, 0, 1);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
  } else if (period === "month") {
    startDate = new Date(selectedYear, selectedMonth - 1, 1);
    endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
  } else if (period === "week") {
    const today = new Date();
    const day = today.getDay() || 7;
    startDate = new Date(today);
    startDate.setDate(today.getDate() - day + 1);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (period === "day") {
    startDate = new Date(selectedYear, selectedMonth - 1, now.getDate());
    endDate = new Date(
      selectedYear,
      selectedMonth - 1,
      now.getDate(),
      23,
      59,
      59
    );
  }

  return { startDate, endDate };
};

/* ---------- SUMMARY ---------- */
export const getTransactionSummary = async (req, res) => {
  try {
    const { period, year, month, from, to } = req.query;
    const { startDate, endDate } = getDateRange(period, year, month, from, to);

    // rolga qarab match
    let match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (req.user.role !== "superadmin") {
      match.admin = new mongoose.Types.ObjectId(req.user.id);
    }

    const data = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

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
    const { period = "year", year, month, from, to } = req.query;
    const { startDate, endDate } = getDateRange(period, year, month, from, to);

    let dateFormat = "%Y-%m";
    if (period === "month" || period === "week") dateFormat = "%Y-%m-%d";
    if (period === "day") dateFormat = "%H:00";

    let match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (req.user.role !== "superadmin") {
      match.admin = new mongoose.Types.ObjectId(req.user.id);
    }

    const data = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            label: {
              $dateToString: { format: dateFormat, date: "$createdAt" },
            },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.label",
          earn: {
            $sum: { $cond: [{ $eq: ["$_id.type", "earn"] }, "$total", 0] },
          },
          spend: {
            $sum: { $cond: [{ $eq: ["$_id.type", "spend"] }, "$total", 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

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

/* ---------- LATEST ---------- */
export const getLatestTransactions = async (req, res) => {
  try {
    const { period, year, month, from, to } = req.query;
    const { startDate, endDate } = getDateRange(period, year, month, from, to);

    let match = { createdAt: { $gte: startDate, $lte: endDate } };
    if (req.user.role !== "superadmin") {
      match.admin = new mongoose.Types.ObjectId(req.user.id);
    }

    const transactions = await Transaction.find(match)
      .populate("user", "fullname phone")
      .populate("admin", "fullname phone role")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------- TOP USERS ---------- */
export const getTopUsersByEarn = async (req, res) => {
  try {
    const { period, year, month, from, to } = req.query;
    const { startDate, endDate } = getDateRange(period, year, month, from, to);

    let match = { type: "earn", createdAt: { $gte: startDate, $lte: endDate } };
    if (req.user.role !== "superadmin") {
      match.admin = new mongoose.Types.ObjectId(req.user.id);
    }

    const users = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$user", totalEarn: { $sum: "$amount" } } },
      { $sort: { totalEarn: -1 } },
      { $limit: 5 },
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

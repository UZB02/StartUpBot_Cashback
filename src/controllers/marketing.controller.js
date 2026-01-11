import User from "../models/User.js";
import Product from "../models/Product.js";
import Filial from "../models/Filial.js";
import { bot } from "../config/telegram.js";

import { calculateAffordableProducts } from "../utils/Marketing/calculateAffordableProducts.js";
import { buildMarketingMessage } from "../utils/Marketing/marketingMessage.js";

export const sendMarketingByFilial = async (req, res) => {
  try {
    const { filialId, message: adminMessage } = req.body;

    if (!filialId) {
      return res.status(400).json({ error: "Filial tanlanmadi" });
    }

    const filial = await Filial.findById(filialId);
    if (!filial) {
      return res.status(404).json({ error: "Filial topilmadi" });
    }

    const products = await Product.find({
      filial: filialId,
      isActive: true,
    });

    if (!products.length) {
      return res.status(400).json({
        error: "Bu filialda faol mahsulotlar yo‘q",
      });
    }

    const users = await User.find({
      telegramId: { $exists: true },
      balance: { $gt: 0 },
    });

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        const affordableProducts = calculateAffordableProducts(
          user.balance,
          products
        );

        if (!affordableProducts.length) continue;

        const message = buildMarketingMessage({
          user,
          affordableProducts,
          filial,
          adminMessage,
        });

        await bot.telegram.sendMessage(user.telegramId, message, {
          parse_mode: "Markdown",
        });

        successCount++;
        await new Promise((r) => setTimeout(r, 50));
      } catch (err) {
        failedCount++;
        console.error(`❌ ${user.telegramId} yuborilmadi`);
      }
    }

    return res.json({
      success: true,
      message: "Marketing yuborildi",
      stats: {
        totalUsers: users.length,
        successCount,
        failedCount,
      },
    });
  } catch (err) {
    console.error("Marketing error:", err);
    return res.status(500).json({ error: "Marketing xatosi" });
  }
};

export const previewMarketingMessage = async (req, res) => {
  try {
    const { filialId, message } = req.body;
    if (!filialId) return res.status(400).json({ error: "Filial tanlanmadi" });

    const filial = await Filial.findById(filialId);
    if (!filial) return res.status(404).json({ error: "Filial topilmadi" });

    const products = await Product.find({ filial: filialId, isActive: true });
    if (!products.length)
      return res.status(400).json({ error: "Mahsulot yo‘q" });

    const user = { fullname: "Hurmatli mijoz", balance: 10000 }; // Preview uchun dummy user
    const affordableProducts = calculateAffordableProducts(
      user.balance,
      products
    );

    const preview = buildMarketingMessage({
      user,
      affordableProducts,
      filial,
      adminMessage: message,
    });

    res.json({ preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xatolik yuz berdi" });
  }
};

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, unique: true },
    fullname: String,
    phone: String,
    autoNumber: String,
    qrcode: String,
    cardNumber: { type: String, unique: true, sparse: true,},
    language: String,
    step: { type: String, default: "language" },
    companyFilial: { type: mongoose.Schema.Types.ObjectId, ref: "Filial" },
    balance: { type: Number, default: 0 },
    latestPurchase: {
      amount: Number,
      cashback: Number,
      date: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

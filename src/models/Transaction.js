import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    filial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filial",
      required: true,
    }, // qaysi filialda
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    }, // qaysi product
    type: { type: String, enum: ["earn", "spend"], required: true },
    amount: { type: Number, required: true }, // miqdor (price)
    percent: { type: Number, default: 0 }, // cashback foiz
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);

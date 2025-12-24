import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // product.price
    discount: { type: Number, default: 0 },
    amount: { type: Number, required: true }, // price * qty - discount
    cashback: { type: Number, default: 0 },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    filial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filial",
      required: true,
    },

    type: { type: String, enum: ["earn", "spend"], required: true },

    items: [transactionItemSchema], // ✅ KO‘P PRODUCT

    totalAmount: { type: Number, required: true },
    totalCashback: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);

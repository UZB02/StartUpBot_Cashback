import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    type: { type: String, enum: ["earn", "spend"] },
    amount: Number,
    percent: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);

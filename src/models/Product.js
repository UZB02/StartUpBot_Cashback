import mongoose from "mongoose";
import Filial from "./Filial.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, enum: ["dona", "litr", "kg"], default: "dona" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // foiz
    quantity: { type: Number, default: 0 }, // ✅ ja'mi miqdor
    isActive: { type: Boolean, default: true },
    filial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filial",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

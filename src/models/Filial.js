import mongoose from "mongoose";

const filialSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Filial", filialSchema);

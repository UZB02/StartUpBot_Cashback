import mongoose from "mongoose";

const filialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    isActive: { type: Boolean, default: true },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Filial", filialSchema);

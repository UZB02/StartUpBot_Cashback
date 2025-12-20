import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullname: String,
    login: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    filial: { type: mongoose.Schema.Types.ObjectId, ref: "Filial" },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);

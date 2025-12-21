import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    filial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filial",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);

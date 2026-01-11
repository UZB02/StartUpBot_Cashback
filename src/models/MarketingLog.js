import mongoose from "mongoose";

const marketingLogSchema = new mongoose.Schema(
  {
    message: String,
    totalUsers: Number,
    successCount: Number,
    failedCount: Number,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MarketingLog", marketingLogSchema);

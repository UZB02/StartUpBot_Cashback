import mongoose from "mongoose";

const filialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    isActive: { type: Boolean, default: true },

    // Viloyat / region
    region: {
      type: String,
      enum: [
        "Namangan",
        "Andijon",
        "Farg'ona",
        "Samarqand",
        "Toshkent",
        "Buxoro",
        "Xorazm",
        "Qashqadaryo",
        "Surxondaryo",
        "Jizzax",
        "Sirdaryo",
        "Navoiy",
        "Toshkent shahar",
        "Qoraqalpog‘iston",
      ], // kerakli viloyatlarni qo‘shing
      required: true,
    },

    // Adminlar
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],

    // Google Maps joylashuv (latitude + longitude)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Ish vaqti
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" },
    },
  },
  { timestamps: true }
);

// Geospatial index
filialSchema.index({ location: "2dsphere" });

export default mongoose.model("Filial", filialSchema);

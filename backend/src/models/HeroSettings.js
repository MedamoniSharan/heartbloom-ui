import mongoose from "mongoose";

const heroSettingsSchema = new mongoose.Schema(
  {
    happyCustomers: { type: Number, default: 70000, min: 0 },
    magnetsPrinted: { type: Number, default: 800000, min: 0 },
    avgRating: { type: Number, default: 4.9, min: 0, max: 5 },
    /** Full URL, site path, or data URL. Empty = client uses built-in default. */
    heroImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("HeroSettings", heroSettingsSchema);

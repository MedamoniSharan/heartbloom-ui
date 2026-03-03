import mongoose from "mongoose";

const eventPackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Heart" },
    image: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    savings: { type: Number, default: 0, min: 0 },
    features: [{ type: String }],
    color: { type: String, default: "from-pink to-pink-dark" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventPackSchema.index({ order: 1 });

export default mongoose.model("EventPack", eventPackSchema);

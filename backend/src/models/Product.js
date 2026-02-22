import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, sparse: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
    customizable: { type: Boolean, default: false },
    whatsappMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);

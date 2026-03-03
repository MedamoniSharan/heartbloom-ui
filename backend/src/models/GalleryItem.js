import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    caption: { type: String, default: "", trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    likes: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryItemSchema.index({ order: 1 });

export default mongoose.model("GalleryItem", galleryItemSchema);

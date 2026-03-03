import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, required: true, trim: true },
    userAvatar: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    helpful: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);

import mongoose from "mongoose";

const journeyVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    platform: { type: String, enum: ["instagram", "facebook"], default: "instagram" },
    thumbnailUrl: { type: String, default: "" },
    username: { type: String, default: "heartprinted", trim: true },
    views: { type: String, default: "" },
    likes: { type: String, default: "" },
    comments: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

journeyVideoSchema.index({ order: 1 });

export default mongoose.model("JourneyVideo", journeyVideoSchema);

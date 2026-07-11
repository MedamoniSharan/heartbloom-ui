import mongoose from "mongoose";

const courseSettingsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Courses" },
    description: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    book1to1Label: { type: String, default: "Book 1:1 Session" },
    book1to1Description: { type: String, default: "One-on-one with our expert" },
    book1to1Url: { type: String, default: "" },
    book1to1Points: [{ type: String }],
    book1to1Price: { type: Number, default: 0, min: 0 },
    bookGroupLabel: { type: String, default: "Book Group Session" },
    bookGroupDescription: { type: String, default: "Join a group workshop" },
    bookGroupUrl: { type: String, default: "" },
    bookGroupPoints: [{ type: String }],
    bookGroupPrice: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("CourseSettings", courseSettingsSchema);

import express from "express";
import JourneyVideo from "../models/JourneyVideo.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    url: o.url,
    platform: o.platform || "instagram",
    thumbnailUrl: o.thumbnailUrl || "",
    username: o.username || "heartprinted",
    views: o.views || "",
    likes: o.likes || "",
    comments: o.comments || "",
    order: o.order ?? 0,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const list = await JourneyVideo.find().sort({ order: 1 }).lean();
    res.json(list.map((v) => toResponse(v)));
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { url, platform, thumbnailUrl, username, views, likes, comments, order } = req.body;
    if (!url) return res.status(400).json({ message: "url is required" });
    const video = await JourneyVideo.create({
      url,
      platform: platform === "facebook" ? "facebook" : "instagram",
      thumbnailUrl: thumbnailUrl || "",
      username: username || "heartprinted",
      views: views != null ? String(views) : "",
      likes: likes != null ? String(likes) : "",
      comments: comments != null ? String(comments) : "",
      order: order != null ? Number(order) : 0,
    });
    res.status(201).json(toResponse(video));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { url, platform, thumbnailUrl, username, views, likes, comments, order } = req.body;
    const update = {};
    if (url !== undefined) update.url = url;
    if (platform !== undefined) update.platform = platform === "facebook" ? "facebook" : "instagram";
    if (thumbnailUrl !== undefined) update.thumbnailUrl = thumbnailUrl;
    if (username !== undefined) update.username = username;
    if (views !== undefined) update.views = String(views);
    if (likes !== undefined) update.likes = String(likes);
    if (comments !== undefined) update.comments = String(comments);
    if (order !== undefined) update.order = Number(order);
    const video = await JourneyVideo.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(toResponse(video));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const video = await JourneyVideo.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

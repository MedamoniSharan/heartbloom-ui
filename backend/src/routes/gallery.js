import express from "express";
import GalleryItem from "../models/GalleryItem.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: (o._id || o.id)?.toString(),
    image: o.image,
    name: o.name,
    location: o.location || "",
    caption: o.caption || "",
    rating: o.rating,
    likes: o.likes || 0,
    order: o.order || 0,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const list = await GalleryItem.find().sort({ order: 1 }).lean();
    res.json(list.map(toResponse));
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json(toResponse(item));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(toResponse(item));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/like", async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(toResponse(item));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

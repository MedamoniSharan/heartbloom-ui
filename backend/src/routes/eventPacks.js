import express from "express";
import EventPack from "../models/EventPack.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: (o._id || o.id)?.toString(),
    name: o.name,
    tagline: o.tagline || "",
    description: o.description || "",
    icon: o.icon || "Heart",
    image: o.image,
    qty: o.qty,
    pricePerUnit: o.pricePerUnit,
    totalPrice: o.totalPrice,
    savings: o.savings || 0,
    features: o.features || [],
    color: o.color || "from-pink to-pink-dark",
    active: o.active !== false,
    order: o.order || 0,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const list = await EventPack.find({ active: true }).sort({ order: 1 }).lean();
    res.json(list.map(toResponse));
  } catch (e) {
    next(e);
  }
});

router.get("/all", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const list = await EventPack.find().sort({ order: 1 }).lean();
    res.json(list.map(toResponse));
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await EventPack.create(req.body);
    res.status(201).json(toResponse(item));
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await EventPack.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(toResponse(item));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await EventPack.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

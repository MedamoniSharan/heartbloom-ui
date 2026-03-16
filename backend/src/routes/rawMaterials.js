import express from "express";
import RawMaterial from "../models/RawMaterial.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.equipmentId) filter.equipmentId = req.query.equipmentId;
    if (!req.query.all) filter.active = true;
    const items = await RawMaterial.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.get("/all", authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const items = await RawMaterial.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { equipmentId, name, group, variants, active, order } = req.body;
    if (!equipmentId || !name) {
      return res.status(400).json({ message: "equipmentId and name are required" });
    }
    const item = await RawMaterial.create({
      equipmentId,
      name,
      group: group || "",
      variants: variants || [],
      active: active !== false,
      order: order || 0,
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await RawMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Raw material not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const item = await RawMaterial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Raw material not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

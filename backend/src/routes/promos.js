import express from "express";
import PromoCode from "../models/PromoCode.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toPromoResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    code: o.code,
    discount: o.discount,
    description: o.description,
    active: o.active ?? true,
    expiresAt: o.expiresAt,
  };
}

router.get("/validate/:code", async (req, res, next) => {
  try {
    const code = (req.params.code || "").toUpperCase().trim();
    const promo = await PromoCode.findOne({ code, active: true }).lean();
    if (!promo) return res.status(404).json({ message: "Invalid or expired promo code" });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Promo code has expired" });
    }
    res.json(toPromoResponse(promo));
  } catch (e) {
    next(e);
  }
});

router.get("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const list = await PromoCode.find().lean();
    res.json(list.map(toPromoResponse));
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { code, discount, description, expiresAt } = req.body;
    if (!code || discount == null || !description) {
      return res.status(400).json({ message: "code, discount and description required" });
    }
    const promo = await PromoCode.create({
      code: String(code).toUpperCase().trim(),
      discount: Number(discount),
      description,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
    res.status(201).json(toPromoResponse(promo));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { active } = req.body;
    const promo = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { active: !!active },
      { new: true }
    ).lean();
    if (!promo) return res.status(404).json({ message: "Promo not found" });
    res.json(toPromoResponse(promo));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: "Promo not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

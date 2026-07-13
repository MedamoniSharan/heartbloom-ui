import express from "express";
import HeroSettings from "../models/HeroSettings.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const DEFAULTS = {
  happyCustomers: 70000,
  magnetsPrinted: 800000,
  avgRating: 4.9,
  heroImageUrl: "",
};

function toResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    happyCustomers: Number(o.happyCustomers) || DEFAULTS.happyCustomers,
    magnetsPrinted: Number(o.magnetsPrinted) || DEFAULTS.magnetsPrinted,
    avgRating: Number(o.avgRating) || DEFAULTS.avgRating,
    heroImageUrl: typeof o.heroImageUrl === "string" ? o.heroImageUrl : "",
  };
}

async function getHeroSettings() {
  let doc = await HeroSettings.findOne();
  if (!doc) {
    doc = await HeroSettings.create(DEFAULTS);
  }
  return doc;
}

router.get("/", async (_req, res, next) => {
  try {
    const doc = await getHeroSettings();
    res.json(toResponse(doc));
  } catch (e) {
    next(e);
  }
});

router.put("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const customers = Number(body.happyCustomers);
    const magnets = Number(body.magnetsPrinted);
    const rating = Number(body.avgRating);
    const heroImageUrl =
      typeof body.heroImageUrl === "string" ? body.heroImageUrl.trim() : "";

    if (
      !Number.isFinite(customers) ||
      !Number.isFinite(magnets) ||
      !Number.isFinite(rating) ||
      customers < 0 ||
      magnets < 0 ||
      rating < 0 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Invalid values. Rating must be 0–5; counts must be ≥ 0.",
      });
    }

    // MongoDB BSON doc limit is 16MB; keep headroom for other fields.
    if (heroImageUrl.length > 12 * 1024 * 1024) {
      return res.status(400).json({
        message: "Hero image is too large. Use a smaller image or a hosted URL.",
      });
    }

    const updates = {
      happyCustomers: Math.round(customers),
      magnetsPrinted: Math.round(magnets),
      avgRating: Math.round(rating * 10) / 10,
      heroImageUrl,
    };

    let doc = await HeroSettings.findOne();
    if (!doc) {
      doc = await HeroSettings.create(updates);
    } else {
      Object.assign(doc, updates);
      await doc.save();
    }
    res.json(toResponse(doc));
  } catch (e) {
    next(e);
  }
});

export default router;

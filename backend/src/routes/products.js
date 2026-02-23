import express from "express";
import Product from "../models/Product.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toProductResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    name: o.name,
    description: o.description,
    longDescription: o.longDescription,
    price: o.price,
    image: o.image,
    images: o.images,
    category: o.category,
    slug: o.slug,
    rating: o.rating ?? 4.5,
    reviews: o.reviews ?? 0,
    inStock: o.inStock ?? true,
    customizable: o.customizable,
    whatsappMessage: o.whatsappMessage,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const list = await Product.find().lean();
    res.json(list.map((p) => ({ ...toProductResponse(p), id: p._id.toString() })));
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ ...toProductResponse(product), id: product._id.toString() });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(toProductResponse(product));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(toProductResponse(product));
  } catch (e) {
    next(e);
  }
});

export default router;

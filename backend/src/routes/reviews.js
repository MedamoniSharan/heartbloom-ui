import express from "express";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function toReviewResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: (o._id || o.id)?.toString(),
    productId: o.productId?.toString(),
    userId: o.userId?.toString() || null,
    userName: o.userName,
    userAvatar: o.userAvatar || "",
    rating: o.rating,
    comment: o.comment,
    helpful: o.helpful || 0,
    createdAt: o.createdAt?.toISOString?.() || o.createdAt,
  };
}

async function recalcProductRating(productId) {
  const agg = await Review.aggregate([
    { $match: { productId: productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg.length ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg.length ? agg[0].count : 0;
  await Product.findByIdAndUpdate(productId, { rating: avg || 0, reviews: count });
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    const list = await Review.find(filter).sort({ createdAt: -1 }).lean();
    res.json(list.map(toReviewResponse));
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "productId, rating, and comment are required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "",
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.slice(0, 1000),
    });

    await recalcProductRating(product._id);

    res.status(201).json(toReviewResponse(review));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/helpful", async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(toReviewResponse(review));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await recalcProductRating(review.productId);
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;

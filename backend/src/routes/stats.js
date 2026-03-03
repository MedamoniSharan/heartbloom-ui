import express from "express";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [orderCount, reviewAgg] = await Promise.all([
      Order.countDocuments(),
      Review.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);

    const avgRating = reviewAgg.length ? Math.round(reviewAgg[0].avg * 10) / 10 : 4.9;
    const totalReviews = reviewAgg.length ? reviewAgg[0].count : 0;

    let totalMagnets = 0;
    const orders = await Order.find({}, "items").lean();
    for (const o of orders) {
      for (const item of o.items || []) {
        totalMagnets += item.quantity || 1;
      }
    }

    res.json({
      totalCustomers: orderCount,
      totalMagnets,
      avgRating,
      totalReviews,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

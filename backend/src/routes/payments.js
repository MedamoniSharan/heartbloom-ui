import express from "express";
import { computeOrderTotalRupees, rupeesToPaise } from "../lib/orderPricing.js";
import { getRazorpay, isRazorpayEnabled } from "../lib/razorpayClient.js";

const router = express.Router();

router.get("/config", (req, res) => {
  res.json({
    enabled: isRazorpayEnabled(),
    keyId: isRazorpayEnabled() ? process.env.RAZORPAY_KEY_ID : null,
  });
});

/**
 * Create a Razorpay order. Amount is derived from DB prices + optional promo (never trust client total).
 */
router.post("/razorpay-order", async (req, res, next) => {
  try {
    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ message: "Payments are not configured on the server" });
    }
    const { items, promoCode } = req.body;
    const promoUpper = promoCode ? String(promoCode).toUpperCase().trim() || null : null;
    const normalizedItems = (items || []).map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    }));
    const { total } = await computeOrderTotalRupees(normalizedItems, promoUpper);
    const amountPaise = rupeesToPaise(total);
    if (amountPaise < 100) {
      return res.status(400).json({ message: "Order total must be at least ₹1" });
    }

    const order = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `mb_${Date.now()}`,
      notes: {
        promo: promoUpper || "",
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    next(e);
  }
});

export default router;

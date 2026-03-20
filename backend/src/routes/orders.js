import crypto from "crypto";
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { computeOrderTotalRupees, rupeesToPaise } from "../lib/orderPricing.js";
import { getRazorpay, isRazorpayEnabled } from "../lib/razorpayClient.js";

const router = express.Router();

function toOrderResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const items = (o.items || []).map((i) => ({
    product: {
      id: i.product?._id?.toString() || i.product,
      name: i.name,
      image: i.image,
      price: i.priceAtOrder ?? i.price,
    },
    quantity: i.quantity,
  }));
  return {
    id: o._id?.toString(),
    userId: o.userId,
    userName: o.userName,
    items,
    total: o.total,
    status: o.status,
    address: o.address,
    allowSocialMediaFeature: o.allowSocialMediaFeature === true,
    customerPhotos: o.customerPhotos || [],
    razorpayPaymentId: o.razorpayPaymentId,
    paymentType: o.paymentType === "prepaid" ? "prepaid" : "cod",
    createdAt: o.createdAt,
  };
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || !orderId || !paymentId) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(String(signature), "utf8"));
  } catch {
    return false;
  }
}

router.get("/", authenticate, async (req, res, next) => {
  try {
    const list = await Order.find({ userId: req.user._id.toString() })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();
    res.json(list.map((o) => toOrderResponse(o)));
  } catch (e) {
    next(e);
  }
});

router.get("/all", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const list = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 })
      .lean();
    res.json(list.map((o) => toOrderResponse(o)));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      items,
      total,
      address,
      allowSocialMediaFeature,
      customerPhotos,
      guestName,
      promoCode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    } = req.body;

    const rawMethod = String(paymentMethod || "cod").toLowerCase();
    const wantsPrepaid = rawMethod === "online" || rawMethod === "prepaid";
    if (!items?.length || !address) {
      return res.status(400).json({ message: "items and address required" });
    }

    const normalizedItems = items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
    }));
    const promoUpper = promoCode ? String(promoCode).toUpperCase().trim() || null : null;
    let serverTotal;
    try {
      ({ total: serverTotal } = await computeOrderTotalRupees(normalizedItems, promoUpper));
    } catch (e) {
      if (e.status) return res.status(e.status).json({ message: e.message });
      throw e;
    }

    const expectedPaise = rupeesToPaise(serverTotal);

    if (wantsPrepaid) {
      if (!isRazorpayEnabled()) {
        return res.status(400).json({ message: "Online payment is not available" });
      }
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Payment verification required" });
      }
      if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
      const rz = getRazorpay();
      const payment = await rz.payments.fetch(razorpayPaymentId);
      if (payment.order_id !== razorpayOrderId) {
        return res.status(400).json({ message: "Payment does not match order" });
      }
      const paidPaise = Number(payment.amount);
      if (paidPaise !== expectedPaise) {
        return res.status(400).json({ message: "Paid amount does not match order total" });
      }
      const okStatus = ["captured", "authorized"].includes(payment.status);
      if (!okStatus) {
        return res.status(400).json({ message: `Payment not complete (status: ${payment.status})` });
      }
    } else if (total != null && Math.abs(Number(total) - serverTotal) > 0.02) {
      return res.status(400).json({ message: "Order total mismatch — refresh and try again" });
    }

    const orderItems = [];
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) return res.status(400).json({ message: `Product ${it.productId} not found` });
      orderItems.push({
        product: product._id,
        quantity: it.quantity,
        priceAtOrder: product.price,
        name: product.name,
        image: product.image,
      });
    }

    // Support both logged-in and guest users
    let userId = "guest";
    let userName = guestName || address.fullName || "Guest";
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const User = (await import("../models/User.js")).default;
        const user = await User.findById(decoded.id);
        if (user) {
          userId = user._id.toString();
          userName = user.name;
        }
      } catch {
        // token invalid — proceed as guest
      }
    }

    const paymentType = wantsPrepaid ? "prepaid" : "cod";

    const order = await Order.create({
      userId,
      userName,
      items: orderItems,
      total: serverTotal,
      address,
      allowSocialMediaFeature: allowSocialMediaFeature === true,
      customerPhotos: Array.isArray(customerPhotos) ? customerPhotos.slice(0, 20) : [],
      paymentType,
      ...(wantsPrepaid && {
        razorpayOrderId,
        razorpayPaymentId,
      }),
    });
    const populated = await Order.findById(order._id).populate("items.product").lean();
    res.status(201).json(toOrderResponse(populated));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/status", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("items.product")
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(toOrderResponse(order));
  } catch (e) {
    next(e);
  }
});

export default router;

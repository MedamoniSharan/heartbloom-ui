import crypto from "crypto";
import express from "express";
import CourseSettings from "../models/CourseSettings.js";
import CoursePurchase from "../models/CoursePurchase.js";
import { authenticate, optionalAuth, requireAdmin } from "../middleware/auth.js";
import { getRazorpay, isRazorpayEnabled } from "../lib/razorpayClient.js";
import { rupeesToPaise } from "../lib/orderPricing.js";

const router = express.Router();

const DEFAULTS = {
  title: "Courses",
  description:
    "Learn to create beautiful photo magnets. Watch our intro video and book a 1:1 or group session with our team.",
  youtubeUrl: "",
  book1to1Label: "Book 1:1 Session",
  book1to1Description: "One-on-one with our expert",
  book1to1Url: "",
  book1to1Points: ["Personalized guidance", "Business setup help", "Live Q&A"],
  book1to1Price: 0,
  bookGroupLabel: "Book Group Session",
  bookGroupDescription: "Join a group workshop",
  bookGroupUrl: "",
  bookGroupPoints: ["Meet other makers", "Group discounts", "Hands-on practice"],
  bookGroupPrice: 0,
};

function toResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    title: o.title || DEFAULTS.title,
    description: o.description || "",
    youtubeUrl: o.youtubeUrl || "",
    book1to1Label: o.book1to1Label || DEFAULTS.book1to1Label,
    book1to1Description: o.book1to1Description || "",
    book1to1Url: o.book1to1Url || "",
    book1to1Points: o.book1to1Points || [],
    book1to1Price: Number(o.book1to1Price) || 0,
    bookGroupLabel: o.bookGroupLabel || DEFAULTS.bookGroupLabel,
    bookGroupDescription: o.bookGroupDescription || "",
    bookGroupUrl: o.bookGroupUrl || "",
    bookGroupPoints: o.bookGroupPoints || [],
    bookGroupPrice: Number(o.bookGroupPrice) || 0,
  };
}

export async function getCourseSettings() {
  let doc = await CourseSettings.findOne();
  if (!doc) {
    doc = await CourseSettings.create(DEFAULTS);
  }
  return doc;
}

export function resolveCourseOffer(settings, offerKey) {
  if (offerKey === "book1to1") {
    return {
      offerKey: "book1to1",
      offerName: settings.book1to1Label || "Book 1:1 Session",
      price: Number(settings.book1to1Price) || 0,
      scheduleUrl: settings.book1to1Url || "",
    };
  }
  if (offerKey === "bookGroup") {
    return {
      offerKey: "bookGroup",
      offerName: settings.bookGroupLabel || "Book Group Session",
      price: Number(settings.bookGroupPrice) || 0,
      scheduleUrl: settings.bookGroupUrl || "",
    };
  }
  return null;
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || !orderId || !paymentId) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(String(signature), "utf8")
    );
  } catch {
    return false;
  }
}

function toPurchaseResponse(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString(),
    userId: o.userId,
    userName: o.userName,
    email: o.email || "",
    phone: o.phone,
    offerKey: o.offerKey,
    offerName: o.offerName,
    price: o.price,
    status: o.status,
    paymentType: o.paymentType,
    razorpayPaymentId: o.razorpayPaymentId,
    createdAt: o.createdAt,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const doc = await getCourseSettings();
    res.json(toResponse(doc));
  } catch (e) {
    next(e);
  }
});

router.put("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body || {};
    const updates = {
      title: body.title ?? DEFAULTS.title,
      description: body.description ?? "",
      youtubeUrl: body.youtubeUrl ?? "",
      book1to1Label: body.book1to1Label ?? DEFAULTS.book1to1Label,
      book1to1Description: body.book1to1Description ?? "",
      book1to1Url: body.book1to1Url ?? "",
      book1to1Points: Array.isArray(body.book1to1Points)
        ? body.book1to1Points.filter(Boolean)
        : [],
      book1to1Price: Math.max(0, Number(body.book1to1Price) || 0),
      bookGroupLabel: body.bookGroupLabel ?? DEFAULTS.bookGroupLabel,
      bookGroupDescription: body.bookGroupDescription ?? "",
      bookGroupUrl: body.bookGroupUrl ?? "",
      bookGroupPoints: Array.isArray(body.bookGroupPoints)
        ? body.bookGroupPoints.filter(Boolean)
        : [],
      bookGroupPrice: Math.max(0, Number(body.bookGroupPrice) || 0),
    };

    let doc = await CourseSettings.findOne();
    if (!doc) {
      doc = await CourseSettings.create(updates);
    } else {
      Object.assign(doc, updates);
      await doc.save();
    }
    res.json(toResponse(doc));
  } catch (e) {
    next(e);
  }
});

router.get("/purchases", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const list = await CoursePurchase.find().sort({ createdAt: -1 }).lean();
    res.json(list.map(toPurchaseResponse));
  } catch (e) {
    next(e);
  }
});

/** Create Razorpay order for a course offer. Amount comes from DB, never the client. */
router.post("/razorpay-order", async (req, res, next) => {
  try {
    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ message: "Payments are not configured on the server" });
    }
    const offerKey = String(req.body?.offerKey || "");
    const settings = await getCourseSettings();
    const offer = resolveCourseOffer(settings, offerKey);
    if (!offer || offer.price <= 0) {
      return res.status(400).json({ message: "This course offer is not available for purchase" });
    }
    const amountPaise = rupeesToPaise(offer.price);
    if (amountPaise < 100) {
      return res.status(400).json({ message: "Course price must be at least ₹1" });
    }
    const order = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `course_${offerKey}_${Date.now()}`.slice(0, 40),
      notes: {
        offerKey: offer.offerKey,
        offerName: offer.offerName,
      },
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      offerKey: offer.offerKey,
      offerName: offer.offerName,
      price: offer.price,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/purchase", optionalAuth, async (req, res, next) => {
  try {
    const {
      offerKey,
      fullName,
      phone,
      email,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body || {};

    if (!offerKey || !fullName || !phone) {
      return res.status(400).json({ message: "offerKey, fullName and phone required" });
    }
    if (!isRazorpayEnabled()) {
      return res.status(400).json({ message: "Online payment is not available" });
    }
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Payment verification required" });
    }
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const settings = await getCourseSettings();
    const offer = resolveCourseOffer(settings, offerKey);
    if (!offer || offer.price <= 0) {
      return res.status(400).json({ message: "This course offer is not available for purchase" });
    }

    const expectedPaise = rupeesToPaise(offer.price);
    const rz = getRazorpay();
    const payment = await rz.payments.fetch(razorpayPaymentId);
    if (payment.order_id !== razorpayOrderId) {
      return res.status(400).json({ message: "Payment does not match order" });
    }
    if (Number(payment.amount) !== expectedPaise) {
      return res.status(400).json({ message: "Paid amount does not match course price" });
    }
    if (!["captured", "authorized"].includes(payment.status)) {
      return res.status(400).json({ message: `Payment not complete (status: ${payment.status})` });
    }

    let userId = "guest";
    let userName = String(fullName).trim();
    if (req.user) {
      userId = req.user._id.toString();
      userName = req.user.name || userName;
    }

    const purchase = await CoursePurchase.create({
      userId,
      userName,
      email: String(email || "").trim(),
      phone: String(phone).trim(),
      offerKey: offer.offerKey,
      offerName: offer.offerName,
      price: offer.price,
      status: "paid",
      paymentType: "prepaid",
      razorpayOrderId,
      razorpayPaymentId,
    });

    res.status(201).json({
      ...toPurchaseResponse(purchase),
      scheduleUrl: offer.scheduleUrl || null,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

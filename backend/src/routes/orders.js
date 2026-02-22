import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

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
    createdAt: o.createdAt,
  };
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

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { items, total, address } = req.body;
    if (!items?.length || total == null || !address) {
      return res.status(400).json({ message: "items, total and address required" });
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
    const order = await Order.create({
      userId: req.user._id.toString(),
      userName: req.user.name,
      items: orderItems,
      total,
      address,
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

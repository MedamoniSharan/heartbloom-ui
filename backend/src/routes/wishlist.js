import express from "express";
import Wishlist from "../models/Wishlist.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const uid = req.user._id.toString();
    let list = await Wishlist.findOne({ userId: uid });
    if (!list) list = await Wishlist.create({ userId: uid, productIds: [] });
    const productIds = (list.productIds || []).map((id) => id.toString());
    res.json({ productIds });
  } catch (e) {
    next(e);
  }
});

router.post("/toggle", authenticate, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const uid = req.user._id.toString();
    let list = await Wishlist.findOne({ userId: uid });
    if (!list) list = await Wishlist.create({ userId: uid, productIds: [] });
    const ids = list.productIds.map((id) => id.toString());
    const index = ids.indexOf(productId);
    let added;
    if (index === -1) {
      list.productIds.push(productId);
      added = true;
    } else {
      list.productIds.splice(index, 1);
      added = false;
    }
    await list.save();
    res.json({
      productIds: list.productIds.map((id) => id.toString()),
      added,
    });
  } catch (e) {
    next(e);
  }
});

export default router;

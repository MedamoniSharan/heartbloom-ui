import Product from "../models/Product.js";
import PromoCode from "../models/PromoCode.js";

/**
 * Server-side cart total from DB prices + optional validated promo.
 * @param {Array<{ productId: string, quantity: number }>} itemsInput
 * @param {string | null | undefined} promoCodeUpper - already uppercased or null
 */
export async function computeOrderTotalRupees(itemsInput, promoCodeUpper) {
  if (!itemsInput?.length) {
    const err = new Error("items required");
    err.status = 400;
    throw err;
  }
  let subtotal = 0;
  for (const it of itemsInput) {
    const product = await Product.findById(it.productId);
    if (!product) {
      const err = new Error(`Product ${it.productId} not found`);
      err.status = 400;
      throw err;
    }
    const qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      const err = new Error("Invalid quantity");
      err.status = 400;
      throw err;
    }
    subtotal += product.price * qty;
  }

  let discount = 0;
  if (promoCodeUpper) {
    const promo = await PromoCode.findOne({ code: promoCodeUpper, active: true }).lean();
    if (promo && (!promo.expiresAt || new Date(promo.expiresAt) >= new Date())) {
      discount = subtotal * (promo.discount / 100);
    }
  }

  const total = Math.round((subtotal - discount) * 100) / 100;
  return { subtotal, discount, total };
}

export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

import Razorpay from "razorpay";

export function isRazorpayEnabled() {
  return !!(
    String(process.env.RAZORPAY_KEY_ID || "").trim() &&
    String(process.env.RAZORPAY_KEY_SECRET || "").trim()
  );
}

export function getRazorpay() {
  const key_id = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const key_secret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

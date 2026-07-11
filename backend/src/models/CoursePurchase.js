import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "guest" },
    userName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, required: true },
    offerKey: { type: String, enum: ["book1to1", "bookGroup"], required: true },
    offerName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "paid",
    },
    paymentType: { type: String, enum: ["prepaid"], default: "prepaid" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

coursePurchaseSchema.index({ createdAt: -1 });

export default mongoose.model("CoursePurchase", coursePurchaseSchema);

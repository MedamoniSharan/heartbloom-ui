import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: true }
);

const rawMaterialSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    group: { type: String, default: "", trim: true },
    variants: [variantSchema],
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

rawMaterialSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.variants) {
      ret.variants = ret.variants.map((v) => ({
        id: v._id.toString(),
        label: v.label,
        quantity: v.quantity,
        price: v.price,
      }));
    }
    return ret;
  },
});

export default mongoose.model("RawMaterial", rawMaterialSchema);

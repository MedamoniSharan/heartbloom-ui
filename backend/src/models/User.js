import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    googleId: { type: String, default: null, sparse: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (!this.password && !this.googleId) {
    this.invalidate("password", "Password is required when not using Google sign-in");
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);

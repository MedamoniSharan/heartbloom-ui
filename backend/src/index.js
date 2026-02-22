import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import promoRoutes from "./routes/promos.js";
import wishlistRoutes from "./routes/wishlist.js";
import contactRoutes from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const allowOrigin = !origin || allowedOrigins.includes(origin) ? (origin || allowedOrigins[0]) : null;
  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
}
app.use(corsMiddleware);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

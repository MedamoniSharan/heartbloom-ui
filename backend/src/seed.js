import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import PromoCode from "./models/PromoCode.js";
import { connectDB } from "./config/db.js";

const MOCK_PRODUCTS = [
  {
    name: "Custom Photo Magnet Set (9)",
    description: "Turn your favourite photos into premium fridge magnets. Set of 9, high-quality print.",
    longDescription: "Upload 9 photos and we print them as durable, vibrant fridge magnets. Perfect for family memories, travel snaps, or pet photos. Strong magnetic backing, rounded corners.",
    price: 499,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
    ],
    category: "Custom Magnets",
    rating: 4.9,
    reviews: 128,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I'd like to order the Custom Photo Magnet Set (9).",
  },
  {
    name: "Heart-Shaped Photo Magnets",
    description: "Romantic heart-shaped magnets with your photo. Ideal for anniversaries and gifts.",
    longDescription: "Premium heart-shaped magnets with your chosen image. Great for couples, anniversaries, or as a thoughtful gift. Set of 4.",
    price: 349,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
    images: [],
    category: "Gifts",
    rating: 4.8,
    reviews: 86,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I'm interested in Heart-Shaped Photo Magnets.",
  },
  {
    name: "Round Classic Magnets (6)",
    description: "Classic round design. Set of 6, perfect for offices and kitchens.",
    longDescription: "Timeless round magnets with strong hold. Choose from preset designs or add your own image. Durable and scratch-resistant.",
    price: 299,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
    images: [],
    category: "Magnets",
    rating: 4.6,
    reviews: 54,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I'd like the Round Classic Magnets (6).",
  },
  {
    name: "Wedding Favours Pack",
    description: "Elegant magnet favours for your wedding. Custom design, bulk pricing.",
    longDescription: "Impress your guests with custom photo magnets as wedding favours. Add your wedding photo or monogram. Minimum order 50 pieces; contact for quote.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=600&h=600&fit=crop",
    images: [],
    category: "Events",
    rating: 5,
    reviews: 32,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I need wedding favour magnets. Can you share bulk pricing?",
  },
  {
    name: "Baby Shower Magnets",
    description: "Adorable baby-themed magnets for shower favours or nursery decor.",
    longDescription: "Custom baby photo magnets for shower favours or to decorate the nursery. Sweet and memorable keepsakes.",
    price: 399,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop",
    images: [],
    category: "Events",
    rating: 4.7,
    reviews: 41,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I want Baby Shower Magnets for my event.",
  },
  {
    name: "Travel Memory Set",
    description: "Set of 6 magnets to showcase your travel photos. Perfect for wanderlusters.",
    longDescription: "Display your best travel moments on the fridge. Set of 6 with a mix of landscape and portrait options. Durable and vibrant.",
    price: 449,
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop",
    images: [],
    category: "Custom Magnets",
    rating: 4.8,
    reviews: 67,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I'd like the Travel Memory Set.",
  },
  {
    name: "Pet Photo Magnets",
    description: "Your furry friends on premium magnets. Set of 4.",
    longDescription: "Turn your pet's cutest photos into fridge magnets. High-quality print, strong magnet. Set of 4.",
    price: 379,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
    images: [],
    category: "Custom Magnets",
    rating: 4.9,
    reviews: 93,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I want to order Pet Photo Magnets.",
  },
  {
    name: "Square Premium Magnets (4)",
    description: "Large square format for maximum impact. Set of 4.",
    longDescription: "Bigger canvas for your favourite photos. Square format, set of 4. Ideal for family portraits or art prints.",
    price: 429,
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop",
    images: [],
    category: "Magnets",
    rating: 4.5,
    reviews: 38,
    inStock: true,
    customizable: true,
    whatsappMessage: "Hi! I'm interested in Square Premium Magnets (4).",
  },
];

const MOCK_EQUIPMENT = [
  {
    name: "Mpro Magnet Press",
    description: "Professional-grade magnet press for high-quality photo magnets. USA-made, lifetime warranty.",
    longDescription: "Industry-leading magnet press for custom photo magnets. Handles up to 32 lb paper, built to last with lifetime warranty. Ideal for small businesses and serious hobbyists.",
    price: 24999,
    image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=600&h=600&fit=crop",
    images: [],
    category: "Equipment",
    slug: "eq1",
    rating: 4.9,
    reviews: 42,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I'm interested in the Mpro Magnet Press.",
  },
  {
    name: "Titan Pro Laminator",
    description: "Heavy-duty laminator for magnets and prints. Designed in USA, in stock.",
    longDescription: "Robust laminator for professional magnet and print finishing. Max paper thickness 42 lb. Lifetime warranty with service and support in the USA.",
    price: 18999,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop",
    images: [],
    category: "Equipment",
    slug: "eq2",
    rating: 4.8,
    reviews: 28,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I'd like to know more about the Titan Pro Laminator.",
  },
];

const MOCK_PROMOS = [
  { code: "WELCOME10", discount: 10, description: "10% off your first order", active: true, expiresAt: null },
  { code: "MAGNET20", discount: 20, description: "20% off on custom magnet sets", active: true, expiresAt: null },
  { code: "EVENT15", discount: 15, description: "15% off event & bulk orders", active: true, expiresAt: null },
];

const ADMIN_SEED = {
  name: "Admin",
  email: "admin@magneticbliss.in",
  password: "admin123",
  role: "admin",
};

async function seed() {
  await connectDB();

  // Admin user (skip if already exists)
  const existingAdmin = await User.findOne({ email: ADMIN_SEED.email });
  if (!existingAdmin) {
    await User.create(ADMIN_SEED);
    console.log("Created admin user:", ADMIN_SEED.email, "(password: admin123)");
  } else {
    console.log("Admin user already exists:", ADMIN_SEED.email);
  }

  // Products: insert if collection is empty
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(MOCK_PRODUCTS);
    console.log("Inserted", MOCK_PRODUCTS.length, "mock products.");
  } else {
    console.log("Products already exist (" + productCount + "). Skipping product seed.");
  }

  // Equipment (machines): insert if none exist
  const equipmentCount = await Product.countDocuments({ category: "Equipment" });
  if (equipmentCount === 0) {
    await Product.insertMany(MOCK_EQUIPMENT);
    console.log("Inserted", MOCK_EQUIPMENT.length, "equipment/machine products.");
  } else {
    console.log("Equipment already exists (" + equipmentCount + "). Skipping equipment seed.");
  }

  // Promos: insert if none exist
  const promoCount = await PromoCode.countDocuments();
  if (promoCount === 0) {
    await PromoCode.insertMany(MOCK_PROMOS);
    console.log("Inserted", MOCK_PROMOS.length, "promo codes.");
  } else {
    console.log("Promo codes already exist (" + promoCount + "). Skipping promo seed.");
  }

  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import PromoCode from "./models/PromoCode.js";
import Order from "./models/Order.js";
import JourneyVideo from "./models/JourneyVideo.js";
import Review from "./models/Review.js";
import GalleryItem from "./models/GalleryItem.js";
import EventPack from "./models/EventPack.js";
import RawMaterial from "./models/RawMaterial.js";
import { connectDB } from "./config/db.js";

// ─── Products: Order Magnet (2.5 x 2.5) ───
const PRODUCTS_2_5 = [
  {
    name: 'Heart-Shaped Photo Magnets (2.5" x 2.5")',
    description: "Romantic heart-shaped magnets with your photo. Ideal for anniversaries and gifts.",
    longDescription: "Premium heart-shaped magnets with your chosen image. Great for couples, anniversaries, or as a thoughtful gift. Set of 4.",
    price: 349,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=600&fit=crop",
    ],
    category: "2.5 x 2.5",
    rating: 4.8,
    reviews: 86,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'm interested in Heart-Shaped Photo Magnets (2.5 x 2.5).",
  },
  {
    name: 'Round Classic Magnets 2.5" x 2.5" (6)',
    description: "Classic round design. Set of 6, perfect for offices and kitchens.",
    longDescription: "Timeless round magnets with strong hold. Choose from preset designs or add your own image. Durable and scratch-resistant.",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
    images: [],
    category: "2.5 x 2.5",
    rating: 4.6,
    reviews: 54,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'd like the Round Classic Magnets (6) 2.5 x 2.5.",
  },
  {
    name: 'Pet Photo Magnets 2.5" x 2.5"',
    description: "Your furry friends on premium magnets. Set of 4.",
    longDescription: "Turn your pet's cutest photos into fridge magnets. High-quality print, strong magnet. Set of 4.",
    price: 379,
    originalPrice: 499,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop",
    ],
    category: "2.5 x 2.5",
    rating: 4.9,
    reviews: 93,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I want to order Pet Photo Magnets 2.5 x 2.5.",
  },
];

// ─── Products: Order Magnet (2 x 2) ───
const PRODUCTS_2 = [
  {
    name: 'Custom Photo Magnet Set 2" x 2" (9)',
    description: "Turn your favourite photos into premium fridge magnets. Set of 9, high-quality print.",
    longDescription: "Upload 9 photos and we print them as durable, vibrant fridge magnets. Perfect for family memories, travel snaps, or pet photos. Strong magnetic backing, rounded corners.",
    price: 499,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
    ],
    category: "2 x 2",
    rating: 4.9,
    reviews: 128,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'd like to order the Custom Photo Magnet Set (9) 2 x 2.",
  },
  {
    name: 'Square Premium Magnets 2" x 2" (4)',
    description: "Square format for maximum impact. Set of 4.",
    longDescription: "Bigger canvas for your favourite photos. Square format, set of 4. Ideal for family portraits or art prints.",
    price: 429,
    originalPrice: 549,
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop",
    images: [],
    category: "2 x 2",
    rating: 4.5,
    reviews: 38,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'm interested in Square Premium Magnets (4) 2 x 2.",
  },
  {
    name: 'Travel Memory Set 2" x 2"',
    description: "Set of 6 magnets to showcase your travel photos. Perfect for wanderlusters.",
    longDescription: "Display your best travel moments on the fridge. Set of 6 with a mix of landscape and portrait options. Durable and vibrant.",
    price: 449,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop",
    ],
    category: "2 x 2",
    rating: 4.8,
    reviews: 67,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'd like the Travel Memory Set 2 x 2.",
  },
];

// ─── Products: Upload (custom design) ───
const PRODUCTS_UPLOAD = [
  {
    name: "Wedding Favours Pack (Upload Your Design)",
    description: "Elegant magnet favours for your wedding. Upload your design, bulk pricing.",
    longDescription: "Impress your guests with custom photo magnets as wedding favours. Upload your wedding photo or monogram. Minimum order 50 pieces; contact for quote.",
    price: 2499,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=600&h=600&fit=crop",
    images: [],
    category: "Upload",
    rating: 5,
    reviews: 32,
    inStock: true,
    customizable: true,
    minQuantity: 1,
    maxQuantity: 5,
    whatsappMessage: "Hi! I need wedding favour magnets. Can you share bulk pricing?",
  },
  {
    name: "Baby Shower Magnets (Upload Your Photo)",
    description: "Adorable baby-themed magnets for shower favours or nursery decor. Upload your photo.",
    longDescription: "Custom baby photo magnets for shower favours or to decorate the nursery. Upload your design. Sweet and memorable keepsakes.",
    price: 399,
    originalPrice: 549,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop",
    images: [],
    category: "Upload",
    rating: 4.7,
    reviews: 41,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I want Baby Shower Magnets (upload my design).",
  },
  {
    name: "Custom Upload – Any Design",
    description: "Send us your graphic or photo and we print it as premium magnets. Your design, your size.",
    longDescription: "Have a logo, artwork, or photo? Upload your file and we turn it into quality photo magnets. Flexible sizes and finishes.",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
    images: [],
    category: "Upload",
    rating: 4.9,
    reviews: 56,
    inStock: true,
    customizable: true,
    minQuantity: 4,
    maxQuantity: 12,
    whatsappMessage: "Hi! I'd like to upload my design for custom magnets.",
  },
];

// ─── Products: Equipment / Machines ───
const PRODUCTS_EQUIPMENT = [
  {
    name: "Mpro Magnet Press",
    description: "Professional-grade magnet press for high-quality photo magnets. USA-made, lifetime warranty.",
    longDescription: "Industry-leading magnet press for custom photo magnets. Handles up to 32 lb paper, built to last with lifetime warranty. Ideal for small businesses and serious hobbyists.",
    price: 24999,
    originalPrice: 29999,
    image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop",
    ],
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
    originalPrice: 22999,
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

// ─── Promo Codes ───
const PROMOS = [
  { code: "WELCOME10", discount: 10, description: "10% off your first order", active: true, expiresAt: null },
  { code: "MAGNET20", discount: 20, description: "20% off on custom magnet sets", active: true, expiresAt: null },
  { code: "EVENT15", discount: 15, description: "15% off event & bulk orders", active: true, expiresAt: null },
  { code: "SUMMER25", discount: 25, description: "Summer sale — 25% off everything", active: true, expiresAt: new Date("2026-06-30") },
];

// ─── Journey Videos (Follow My Journey on Home page) ───
// Real public Instagram Reels (crafts / DIY / magnets / small business)
const JOURNEY_VIDEOS = [
  {
    url: "https://www.instagram.com/reel/DGi94BEyBfz/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "1.2M",
    likes: "85K",
    comments: "2.4K",
    order: 0,
  },
  {
    url: "https://www.instagram.com/reel/DGWRCvHSJQ0/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "890K",
    likes: "62K",
    comments: "1.8K",
    order: 1,
  },
  {
    url: "https://www.instagram.com/reel/DFz4VFOyemv/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "2.5M",
    likes: "145K",
    comments: "5.2K",
    order: 2,
  },
  {
    url: "https://www.instagram.com/reel/DFiEHoyyv2P/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "650K",
    likes: "48K",
    comments: "1.3K",
    order: 3,
  },
  {
    url: "https://www.instagram.com/reel/DExkImNSsgS/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "3.1M",
    likes: "210K",
    comments: "7.8K",
    order: 4,
  },
  {
    url: "https://www.instagram.com/reel/DEYXc5jS8Wb/",
    platform: "instagram",
    thumbnailUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=700&fit=crop",
    username: "magneticblissindia",
    views: "420K",
    likes: "31K",
    comments: "980",
    order: 5,
  },
];

// ─── Gallery Items ───
const GALLERY_ITEMS = [
  { image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop", name: "Sarah M.", location: "Hyderabad", caption: "These magnets are absolutely gorgeous! They bring so much joy every time I open the fridge.", rating: 5, likes: 234, order: 0 },
  { image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop", name: "Rahul T.", location: "Mumbai", caption: "Ordered heart-shaped magnets for our anniversary. My wife cried happy tears! Best gift ever.", rating: 5, likes: 189, order: 1 },
  { image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop", name: "Emily R.", location: "Bangalore", caption: "The quality is insane. Colors pop beautifully and the magnet is super strong. Already ordered another set!", rating: 5, likes: 312, order: 2 },
  { image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=600&h=600&fit=crop", name: "David K.", location: "Chennai", caption: "Used these as wedding favors. Guests absolutely loved them! Such a unique and personal touch.", rating: 5, likes: 445, order: 3 },
  { image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop", name: "Priya C.", location: "Delhi", caption: "Family photos on the fridge make my kitchen feel so warm and homey. The print quality is professional!", rating: 4, likes: 156, order: 4 },
  { image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop", name: "James W.", location: "Pune", caption: "My dog looks absolutely adorable as a magnet! Everyone who visits comments on them.", rating: 5, likes: 278, order: 5 },
  { image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop", name: "Ana P.", location: "Kolkata", caption: "Travel magnets from our honeymoon! So much better than the generic tourist ones. Highly recommend!", rating: 5, likes: 201, order: 6 },
  { image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop", name: "Tom H.", location: "Jaipur", caption: "The custom text magnets with our family motto are perfect. Great quality and fast delivery!", rating: 4, likes: 98, order: 7 },
  { image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop", name: "Deepa S.", location: "Ahmedabad", caption: "Baby shower favors were a HUGE hit. Everyone asked where I got them. Affordable and beautiful!", rating: 5, likes: 167, order: 8 },
];

// ─── Event Packs ───
const EVENT_PACKS = [
  {
    name: "Wedding Favor Pack",
    tagline: "Make your big day unforgettable",
    description: "Beautiful custom photo magnets for wedding guests. Each magnet features your favorite couple photo — a keepsake guests will treasure forever.",
    icon: "Heart",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    qty: 50, pricePerUnit: 149, totalPrice: 7450, savings: 5000,
    features: ["50 custom magnets", "Free design assistance", "Elegant packaging", "Bulk shipping discount"],
    color: "from-pink to-pink-dark",
    order: 0,
  },
  {
    name: "Birthday Party Pack",
    tagline: "Party favors they'll actually keep",
    description: "Fun, colorful photo magnets perfect for birthday party goody bags. Upload group photos, silly faces, or themed designs.",
    icon: "PartyPopper",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    qty: 25, pricePerUnit: 179, totalPrice: 4475, savings: 3000,
    features: ["25 custom magnets", "Fun design templates", "Individual wrapping available", "Fast turnaround"],
    color: "from-warning to-[hsl(25,90%,50%)]",
    order: 1,
  },
  {
    name: "Corporate Gift Pack",
    tagline: "Branded gifts clients remember",
    description: "Professional branded magnets for conferences, client gifts, and team events. Add your logo, team photos, or motivational messages.",
    icon: "Building2",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    qty: 100, pricePerUnit: 119, totalPrice: 11900, savings: 13000,
    features: ["100 branded magnets", "Logo placement included", "Premium matte finish", "Custom packaging"],
    color: "from-secondary to-navy-light",
    order: 2,
  },
  {
    name: "Baby Shower Pack",
    tagline: "Tiny moments, big memories",
    description: "Adorable magnets featuring ultrasound images, baby milestones, or nursery themes. Perfect shower favors for guests.",
    icon: "Gift",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop",
    qty: 30, pricePerUnit: 159, totalPrice: 4770, savings: 3500,
    features: ["30 custom magnets", "Pastel design themes", "Gift-ready packaging", "Personalized text"],
    color: "from-[hsl(200,80%,60%)] to-[hsl(260,70%,60%)]",
    order: 3,
  },
];

// ─── Reviews (will be linked to products after insert) ───
const REVIEW_TEMPLATES = [
  { userName: "Priya S.", rating: 5, comment: "The custom photo magnets turned out even better than I hoped. Quality is superb and delivery was fast. Highly recommend!" },
  { userName: "Rahul K.", rating: 5, comment: "Ordered heart-shaped magnets for our anniversary. My wife loved them. The print clarity and finish are excellent." },
  { userName: "Anitha M.", rating: 5, comment: "Used these as wedding favors. Guests kept asking where we got them. Affordable, beautiful, and the team was so helpful." },
  { userName: "Vikram R.", rating: 4, comment: "Family photos on the fridge look so good. The magnets are strong and the colors are vibrant. Will order again for gifts." },
  { userName: "Deepa L.", rating: 5, comment: "Baby shower favors were a hit. Everyone wanted to know the source. Great quality and the customization process was easy." },
  { userName: "Kiran P.", rating: 4, comment: "The custom text magnets with our family motto are perfect. Sturdy, well-packaged, and arrived on time. Very happy." },
  { userName: "Arjun N.", rating: 5, comment: "Ordered multiple sets for our café — menu boards and specials. Customers love the look. Professional finish." },
  { userName: "Meera T.", rating: 5, comment: "Gift for my parents — their wedding photo as a magnet. They were so touched. Beautiful product and thoughtful packaging." },
  { userName: "Suresh G.", rating: 4, comment: "Travel magnets from our trip look amazing. Way better than generic souvenirs. Fast turnaround and great communication." },
  { userName: "Lakshmi D.", rating: 5, comment: "Absolutely love my pet photo magnets! The colors are vibrant and the magnet holds really well on the fridge." },
  { userName: "Sanjay B.", rating: 5, comment: "Corporate event giveaways were a huge success. The quality surprised everyone. Will definitely order again for next year." },
  { userName: "Neha J.", rating: 4, comment: "Good product overall. Slight delay in shipping but the magnets themselves are fantastic. Will reorder." },
  { userName: "Ravi M.", rating: 5, comment: "These make the BEST gifts. I've ordered for birthdays, anniversaries, and festivals. Never disappointed." },
  { userName: "Divya A.", rating: 5, comment: "My friends couldn't believe these were custom made. The quality rivals big brands. Amazing value for money!" },
  { userName: "Anil S.", rating: 4, comment: "Compact, colorful and well-made. The packaging was neat. A perfect little gift for loved ones." },
];

// ─── Products: Raw Materials ───
const PRODUCTS_RAW_MATERIALS = [
  {
    name: "Magnetic Sheet 2.5\" x 2.5\" (Pack of 100)",
    description: "Pre-cut magnetic sheets, 2.5 x 2.5 inches. Strong adhesive backing, ideal for photo magnets.",
    longDescription: "Premium pre-cut magnetic sheets sized perfectly for 2.5\" x 2.5\" photo magnets. Each sheet has a strong adhesive back for easy application. Flexible and durable. Pack of 100 sheets.",
    price: 899,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.7,
    reviews: 34,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I'm interested in the Magnetic Sheet 2.5 x 2.5 (Pack of 100).",
  },
  {
    name: "Magnetic Sheet 2\" x 2\" (Pack of 100)",
    description: "Pre-cut magnetic sheets, 2 x 2 inches. Strong adhesive, perfect for small magnets.",
    longDescription: "Pre-cut 2\" x 2\" magnetic sheets with premium adhesive backing. Perfect for creating compact photo magnets. Flexible, strong hold. Pack of 100.",
    price: 749,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.6,
    reviews: 22,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I'd like the Magnetic Sheet 2 x 2 (Pack of 100).",
  },
  {
    name: "Glossy Photo Paper A4 (50 Sheets)",
    description: "Premium glossy photo paper, A4 size. 230 GSM, vibrant colors, waterproof.",
    longDescription: "High-quality 230 GSM glossy photo paper for printing photo magnets. Produces vibrant, sharp images with rich colors. Waterproof and smudge-resistant. Pack of 50 sheets.",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.8,
    reviews: 45,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I need the Glossy Photo Paper A4 (50 Sheets).",
  },
  {
    name: "Lamination Film Roll (Cold Laminate)",
    description: "Cold lamination film, matte/glossy finish. Protects magnets from scratches and moisture.",
    longDescription: "Self-adhesive cold lamination film roll for protecting printed photos before cutting. Available in matte or glossy finish. Prevents scratches, fingerprints, and moisture damage. Width: 13 inches, Length: 100 feet.",
    price: 1299,
    originalPrice: 1699,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.9,
    reviews: 28,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I want the Lamination Film Roll (Cold Laminate).",
  },
  {
    name: "Corner Rounder Cutter",
    description: "Precision corner rounder for clean rounded edges on magnets. R5 and R10 dies included.",
    longDescription: "Professional corner rounder punch with two interchangeable dies (R5 and R10). Creates clean, consistent rounded corners on photo magnets. Heavy-duty metal construction.",
    price: 1499,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.5,
    reviews: 18,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I'm interested in the Corner Rounder Cutter.",
  },
  {
    name: "Precision Paper Cutter A4",
    description: "Heavy-duty paper cutter for A4 sheets. Guillotine style, sharp blade, safety guard.",
    longDescription: "Professional A4 paper cutter for accurately cutting printed photo sheets. Guillotine-style blade with safety guard. Cuts up to 12 sheets at once. Grid markings for precise alignment.",
    price: 2499,
    originalPrice: 3299,
    image: "https://images.unsplash.com/photo-1586953208270-767889db7f14?w=600&h=600&fit=crop",
    images: [],
    category: "Raw Materials",
    rating: 4.7,
    reviews: 15,
    inStock: true,
    customizable: false,
    whatsappMessage: "Hi! I need the Precision Paper Cutter A4.",
  },
];

// ─── Raw Materials (linked to Equipment) — seeded after products ───
// These are created dynamically in the seed function using equipment product IDs.

// ─── Admin User ───
const ADMIN_USER = {
  name: "Admin",
  email: "admin@magneticbliss.in",
  password: "admin123",
  role: "admin",
};

async function seed() {
  await connectDB();

  console.log("\n🗑️  Clearing all collections...");
  await Promise.all([
    Product.deleteMany({}),
    Order.deleteMany({}),
    PromoCode.deleteMany({}),
    JourneyVideo.deleteMany({}),
    Review.deleteMany({}),
    GalleryItem.deleteMany({}),
    EventPack.deleteMany({}),
    RawMaterial.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("   All collections cleared.\n");

  // Admin user
  await User.create(ADMIN_USER);
  console.log("✅ Admin user created:", ADMIN_USER.email, "(password: admin123)");

  // Products — all categories (including raw materials)
  const allProducts = [...PRODUCTS_2_5, ...PRODUCTS_2, ...PRODUCTS_UPLOAD, ...PRODUCTS_EQUIPMENT, ...PRODUCTS_RAW_MATERIALS];
  const insertedProducts = await Product.insertMany(allProducts);
  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // Reviews — distribute across products, then recalculate ratings
  const reviewDocs = [];
  for (let i = 0; i < REVIEW_TEMPLATES.length; i++) {
    const product = insertedProducts[i % insertedProducts.length];
    reviewDocs.push({
      ...REVIEW_TEMPLATES[i],
      productId: product._id,
      helpful: Math.floor(Math.random() * 30),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    });
  }
  await Review.insertMany(reviewDocs);
  console.log(`✅ Inserted ${reviewDocs.length} reviews across products`);

  // Recalculate product ratings from reviews
  for (const p of insertedProducts) {
    const agg = await Review.aggregate([
      { $match: { productId: p._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (agg.length) {
      await Product.findByIdAndUpdate(p._id, {
        rating: Math.round(agg[0].avg * 10) / 10,
        reviews: agg[0].count,
      });
    }
  }
  console.log("✅ Product ratings recalculated from reviews");

  // Promo codes
  await PromoCode.insertMany(PROMOS);
  console.log(`✅ Inserted ${PROMOS.length} promo codes`);

  // Journey videos
  await JourneyVideo.insertMany(JOURNEY_VIDEOS);
  console.log(`✅ Inserted ${JOURNEY_VIDEOS.length} journey videos`);

  // Gallery items
  await GalleryItem.insertMany(GALLERY_ITEMS);
  console.log(`✅ Inserted ${GALLERY_ITEMS.length} gallery items`);

  // Event packs
  await EventPack.insertMany(EVENT_PACKS);
  console.log(`✅ Inserted ${EVENT_PACKS.length} event packs`);

  // Raw Materials (linked to equipment products)
  const equipmentProducts = insertedProducts.filter((p) => p.category === "Equipment");
  const rawMaterialsDocs = [];

  if (equipmentProducts.length >= 1) {
    const press = equipmentProducts[0]; // Mpro Magnet Press
    rawMaterialsDocs.push(
      {
        equipmentId: press._id,
        name: "Magnetic Sheet 2.5×2.5",
        group: "Magnetic Sheets",
        variants: [
          { label: "Pack of 100", quantity: 100, price: 899 },
          { label: "Pack of 250", quantity: 250, price: 1999 },
          { label: "Pack of 500", quantity: 500, price: 3499 },
        ],
        active: true,
        order: 0,
      },
      {
        equipmentId: press._id,
        name: "Magnetic Sheet 2×2",
        group: "Magnetic Sheets",
        variants: [
          { label: "Pack of 100", quantity: 100, price: 749 },
          { label: "Pack of 250", quantity: 250, price: 1699 },
          { label: "Pack of 500", quantity: 500, price: 2999 },
        ],
        active: true,
        order: 1,
      },
      {
        equipmentId: press._id,
        name: "Glossy Photo Paper A4",
        group: "Paper & Printing",
        variants: [
          { label: "50 Sheets", quantity: 50, price: 599 },
          { label: "100 Sheets", quantity: 100, price: 1049 },
          { label: "250 Sheets", quantity: 250, price: 2299 },
        ],
        active: true,
        order: 2,
      },
      {
        equipmentId: press._id,
        name: "Cold Lamination Film",
        group: "Lamination",
        variants: [
          { label: "Glossy – 100 ft", quantity: 1, price: 1299 },
          { label: "Matte – 100 ft", quantity: 1, price: 1399 },
        ],
        active: true,
        order: 3,
      },
      {
        equipmentId: press._id,
        name: "Corner Rounder Punch",
        group: "Cutting Tools",
        variants: [
          { label: "R5 Die", quantity: 1, price: 799 },
          { label: "R10 Die", quantity: 1, price: 799 },
          { label: "R5 + R10 Combo", quantity: 1, price: 1499 },
        ],
        active: true,
        order: 4,
      }
    );
  }

  if (equipmentProducts.length >= 2) {
    const laminator = equipmentProducts[1]; // Titan Pro Laminator
    rawMaterialsDocs.push(
      {
        equipmentId: laminator._id,
        name: "Lamination Pouch A4 (125 mic)",
        group: "Lamination Supplies",
        variants: [
          { label: "Pack of 100", quantity: 100, price: 499 },
          { label: "Pack of 250", quantity: 250, price: 1099 },
          { label: "Pack of 500", quantity: 500, price: 1899 },
        ],
        active: true,
        order: 0,
      },
      {
        equipmentId: laminator._id,
        name: "Lamination Pouch A4 (250 mic)",
        group: "Lamination Supplies",
        variants: [
          { label: "Pack of 100", quantity: 100, price: 699 },
          { label: "Pack of 250", quantity: 250, price: 1549 },
          { label: "Pack of 500", quantity: 500, price: 2799 },
        ],
        active: true,
        order: 1,
      },
      {
        equipmentId: laminator._id,
        name: "Carrier Sheet",
        group: "Accessories",
        variants: [
          { label: "A4 (Pack of 5)", quantity: 5, price: 349 },
          { label: "A3 (Pack of 5)", quantity: 5, price: 549 },
        ],
        active: true,
        order: 2,
      },
      {
        equipmentId: laminator._id,
        name: "Cleaning Sheet",
        group: "Maintenance",
        variants: [
          { label: "Pack of 10", quantity: 10, price: 299 },
          { label: "Pack of 25", quantity: 25, price: 649 },
        ],
        active: true,
        order: 3,
      }
    );
  }

  if (rawMaterialsDocs.length > 0) {
    await RawMaterial.insertMany(rawMaterialsDocs);
    console.log(`✅ Inserted ${rawMaterialsDocs.length} raw materials linked to ${equipmentProducts.length} equipment products`);
  }

  console.log("\n🎉 Seed completed! All sections have real data:");
  console.log("   Home          → Products + Journey Videos + Stats (from DB)");
  console.log("   Order Magnet  → 9 products (3 sizes)");
  console.log("   Events        → 4 event packs (from DB)");
  console.log("   Gallery       → 9 gallery items (from DB)");
  console.log("   Reviews       → 15 reviews across products (from DB)");
  console.log("   Testimonials  → Pulls from reviews (from DB)");
  console.log("   Machines      → 2 equipment products");
  console.log("   Raw Materials → 6 raw material products + 9 equipment-linked materials");
  console.log("   Contact       → Contact form (no seed data needed)\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

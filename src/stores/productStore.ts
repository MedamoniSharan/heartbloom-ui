import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  customizable?: boolean; // true = user can upload/edit photos for this product
  whatsappMessage?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: { product: Product; quantity: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  address: Address;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Photo Magnets (9-Pack)", description: "Turn your favorite memories into beautiful fridge magnets. Premium quality, vibrant colors.", longDescription: "Upload 9 of your favorite photos and we'll print them as premium fridge magnets. Each magnet features vivid colors on a durable magnetic backing.", price: 24.99, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.8, reviews: 234, inStock: true, customizable: true },
  { id: "p2", name: "Heart-Shaped Magnets (6-Pack)", description: "Express your love with heart-shaped photo magnets. Perfect for gifts and special occasions.", price: 19.99, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.9, reviews: 189, inStock: true, customizable: true },
  { id: "p3", name: "Mini Polaroid Magnets (12-Pack)", description: "Retro-style polaroid magnets with your photos. Nostalgic and charming.", price: 29.99, image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.7, reviews: 156, inStock: true, customizable: true },
  { id: "p4", name: "Custom Text Magnets (4-Pack)", description: "Add custom text and quotes to your photo magnets. Great for motivational fridge décor.", price: 14.99, image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=400&fit=crop", category: "Custom", rating: 4.6, reviews: 98, inStock: true },
  { id: "p5", name: "Premium Canvas Magnets (6-Pack)", description: "Thick premium canvas-style photo magnets with a textured finish.", price: 34.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop", category: "Premium", rating: 4.9, reviews: 312, inStock: true },
  { id: "p6", name: "Family Portrait Magnets (3-Pack)", description: "Large format magnets perfect for family portraits and group photos.", price: 22.99, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.5, reviews: 67, inStock: false, customizable: true },
  { id: "p7", name: "Pet Photo Magnets (9-Pack)", description: "Showcase your furry friends with adorable pet photo magnets.", price: 24.99, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.8, reviews: 445, inStock: true, customizable: true },
  { id: "p8", name: "Travel Memory Magnets (6-Pack)", description: "Capture your travel adventures as stunning fridge magnets.", price: 27.99, image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop", category: "Custom", rating: 4.7, reviews: 201, inStock: true },
  { id: "eq1", name: "MPRO Square Kit 2 x 2\"", description: "Professional magnet-making machine. Made in USA with lifetime warranty.", longDescription: "The MPRO Square Kit is a professional-grade magnet maker for 2x2\" square magnets. Built in the USA, it handles up to 32 lb paper thickness and comes with full service & support. Perfect for starting your own magnet business.", price: 2225, image: "/equipment-mpro.png", category: "Equipment", rating: 4.9, reviews: 48, inStock: true },
  { id: "eq2", name: "Titan Press Square Kit 2 x 2\"", description: "High-quality magnet press designed in USA. Lifetime warranty, handles up to 42 lb paper.", longDescription: "The Titan Press Square Kit is designed in the USA and handles up to 42 lb paper thickness for 2x2\" square magnets. Comes with lifetime warranty and full US-based service & support. An excellent value for aspiring magnet entrepreneurs.", price: 1650, image: "/equipment-titan.jpg", category: "Equipment", rating: 4.8, reviews: 35, inStock: true },
];

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", userId: "user-1", userName: "Jane Doe", items: [{ product: MOCK_PRODUCTS[0], quantity: 2 }, { product: MOCK_PRODUCTS[4], quantity: 1 }], total: 84.97, status: "delivered", address: { fullName: "Jane Doe", phone: "+1234567890", street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "US" }, createdAt: "2026-02-20T10:30:00Z" },
  { id: "ORD-002", userId: "user-1", userName: "Jane Doe", items: [{ product: MOCK_PRODUCTS[2], quantity: 1 }], total: 29.99, status: "shipped", address: { fullName: "Jane Doe", phone: "+1234567890", street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "US" }, createdAt: "2026-02-21T14:15:00Z" },
  { id: "ORD-003", userId: "user-2", userName: "John Smith", items: [{ product: MOCK_PRODUCTS[6], quantity: 3 }], total: 74.97, status: "processing", address: { fullName: "John Smith", phone: "+1987654321", street: "456 Oak Ave", city: "Los Angeles", state: "CA", zipCode: "90001", country: "US" }, createdAt: "2026-02-22T09:00:00Z" },
];

export interface PromoCode {
  id: string;
  code: string;
  discount: number; // percentage
  description: string;
  active: boolean;
  expiresAt?: string;
}

const MOCK_PROMOS: PromoCode[] = [
  { id: "promo-1", code: "WELCOME20", discount: 20, description: "20% off your first order!", active: true, expiresAt: "2026-03-31" },
  { id: "promo-2", code: "SPRING15", discount: 15, description: "Spring sale — 15% off everything", active: true, expiresAt: "2026-04-15" },
];

interface ProductState {
  products: Product[];
  orders: Order[];
  promoCodes: PromoCode[];
  addProduct: (product: Omit<Product, "id">) => void;
  removeProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  addPromoCode: (promo: Omit<PromoCode, "id">) => void;
  removePromoCode: (id: string) => void;
  togglePromoCode: (id: string) => void;
  validatePromo: (code: string) => PromoCode | null;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  promoCodes: MOCK_PROMOS,
  addProduct: (product) => set((s) => ({ products: [...s.products, { ...product, id: `p${Date.now()}` }] })),
  removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  addOrder: (order) => set((s) => ({ orders: [...s.orders, { ...order, id: `ORD-${String(s.orders.length + 1).padStart(3, "0")}`, createdAt: new Date().toISOString() }] })),
  updateOrderStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status } : o) })),
  addPromoCode: (promo) => set((s) => ({ promoCodes: [...s.promoCodes, { ...promo, id: `promo-${Date.now()}` }] })),
  removePromoCode: (id) => set((s) => ({ promoCodes: s.promoCodes.filter((p) => p.id !== id) })),
  togglePromoCode: (id) => set((s) => ({ promoCodes: s.promoCodes.map((p) => p.id === id ? { ...p, active: !p.active } : p) })),
  validatePromo: (code) => {
    const promo = get().promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase() && p.active);
    if (!promo) return null;
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return null;
    return promo;
  },
}));

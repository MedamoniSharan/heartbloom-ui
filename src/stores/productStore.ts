import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
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
  { id: "p1", name: "Classic Photo Magnets (9-Pack)", description: "Turn your favorite memories into beautiful fridge magnets. Premium quality, vibrant colors.", price: 24.99, image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.8, reviews: 234, inStock: true },
  { id: "p2", name: "Heart-Shaped Magnets (6-Pack)", description: "Express your love with heart-shaped photo magnets. Perfect for gifts and special occasions.", price: 19.99, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.9, reviews: 189, inStock: true },
  { id: "p3", name: "Mini Polaroid Magnets (12-Pack)", description: "Retro-style polaroid magnets with your photos. Nostalgic and charming.", price: 29.99, image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.7, reviews: 156, inStock: true },
  { id: "p4", name: "Custom Text Magnets (4-Pack)", description: "Add custom text and quotes to your photo magnets. Great for motivational fridge décor.", price: 14.99, image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=400&fit=crop", category: "Custom", rating: 4.6, reviews: 98, inStock: true },
  { id: "p5", name: "Premium Canvas Magnets (6-Pack)", description: "Thick premium canvas-style photo magnets with a textured finish.", price: 34.99, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop", category: "Premium", rating: 4.9, reviews: 312, inStock: true },
  { id: "p6", name: "Family Portrait Magnets (3-Pack)", description: "Large format magnets perfect for family portraits and group photos.", price: 22.99, image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.5, reviews: 67, inStock: false },
  { id: "p7", name: "Pet Photo Magnets (9-Pack)", description: "Showcase your furry friends with adorable pet photo magnets.", price: 24.99, image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop", category: "Photo Magnets", rating: 4.8, reviews: 445, inStock: true },
  { id: "p8", name: "Travel Memory Magnets (6-Pack)", description: "Capture your travel adventures as stunning fridge magnets.", price: 27.99, image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop", category: "Custom", rating: 4.7, reviews: 201, inStock: true },
];

const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", userId: "user-1", userName: "Jane Doe", items: [{ product: MOCK_PRODUCTS[0], quantity: 2 }, { product: MOCK_PRODUCTS[4], quantity: 1 }], total: 84.97, status: "delivered", address: { fullName: "Jane Doe", phone: "+1234567890", street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "US" }, createdAt: "2026-02-20T10:30:00Z" },
  { id: "ORD-002", userId: "user-1", userName: "Jane Doe", items: [{ product: MOCK_PRODUCTS[2], quantity: 1 }], total: 29.99, status: "shipped", address: { fullName: "Jane Doe", phone: "+1234567890", street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "US" }, createdAt: "2026-02-21T14:15:00Z" },
  { id: "ORD-003", userId: "user-2", userName: "John Smith", items: [{ product: MOCK_PRODUCTS[6], quantity: 3 }], total: 74.97, status: "processing", address: { fullName: "John Smith", phone: "+1987654321", street: "456 Oak Ave", city: "Los Angeles", state: "CA", zipCode: "90001", country: "US" }, createdAt: "2026-02-22T09:00:00Z" },
];

interface ProductState {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, "id">) => void;
  removeProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  addProduct: (product) => set((s) => ({ products: [...s.products, { ...product, id: `p${Date.now()}` }] })),
  removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  addOrder: (order) => set((s) => ({ orders: [...s.orders, { ...order, id: `ORD-${String(s.orders.length + 1).padStart(3, "0")}`, createdAt: new Date().toISOString() }] })),
  updateOrderStatus: (id, status) => set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status } : o) })),
}));

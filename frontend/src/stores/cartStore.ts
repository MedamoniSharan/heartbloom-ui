import { create } from "zustand";
import { Product } from "./productStore";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  appliedPromo: { code: string; discount: number } | null;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedPromo: null,
  addToCart: (product, qty = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return { items: state.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) };
      }
      return { items: [...state.items, { product, quantity: qty }] };
    });
  },
  removeFromCart: (productId) => set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
  updateQuantity: (productId, qty) => {
    if (qty <= 0) { get().removeFromCart(productId); return; }
    set((state) => ({ items: state.items.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i) }));
  },
  clearCart: () => set({ items: [], appliedPromo: null }),
  applyPromo: (code, discount) => set({ appliedPromo: { code, discount } }),
  removePromo: () => set({ appliedPromo: null }),
  subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  discountAmount: () => {
    const promo = get().appliedPromo;
    if (!promo) return 0;
    return get().subtotal() * (promo.discount / 100);
  },
  total: () => get().subtotal() - get().discountAmount(),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

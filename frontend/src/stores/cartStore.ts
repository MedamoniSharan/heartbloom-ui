import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "./productStore";
import type { PhotoItem } from "./photoStore";

export interface CartItem {
  product: Product;
  quantity: number;
  /** Photos for customizable products; stored per item so each product has its own grid in cart */
  photos?: PhotoItem[];
}

const CART_STORAGE_KEY = "magnetic-bliss-cart";

/** Copy cart from sessionStorage (old behavior) if localStorage has none yet */
function migrateSessionCartToLocal() {
  if (typeof window === "undefined") return;
  try {
    const fromSession = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!fromSession || localStorage.getItem(CART_STORAGE_KEY)) return;
    localStorage.setItem(CART_STORAGE_KEY, fromSession);
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}
migrateSessionCartToLocal();

interface CartState {
  items: CartItem[];
  appliedPromo: { code: string; discount: number } | null;
  /** Customer consent to feature this order on social media; sent with order for admin. */
  socialMediaConsent: boolean;
  addToCart: (product: Product, qty?: number, photos?: PhotoItem[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removePhotoFromItem: (productId: string, photoId: string) => void;
  clearCart: () => void;
  setSocialMediaConsent: (value: boolean) => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  appliedPromo: null,
  socialMediaConsent: false,
  addToCart: (product, qty = 1, photos) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: qty, ...(photos !== undefined ? { photos } : {}) }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: qty, ...(photos?.length ? { photos } : {}) }] };
    });
  },
  removeFromCart: (productId) =>
    set((state) => {
      const item = state.items.find((i) => i.product.id === productId);
      if (item?.photos) item.photos.forEach((p) => URL.revokeObjectURL(p.preview));
      return { items: state.items.filter((i) => i.product.id !== productId) };
    }),
  updateQuantity: (productId, qty) => {
    if (qty <= 0) { get().removeFromCart(productId); return; }
    set((state) => ({ items: state.items.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)) }));
  },
  removePhotoFromItem: (productId, photoId) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (i.product.id !== productId || !i.photos) return i;
        const photo = i.photos.find((p) => p.id === photoId);
        if (photo) URL.revokeObjectURL(photo.preview);
        return { ...i, photos: i.photos.filter((p) => p.id !== photoId) };
      }),
    })),
  clearCart: () =>
    set((state) => {
      state.items.forEach((i) => i.photos?.forEach((p) => URL.revokeObjectURL(p.preview)));
      return { items: [], appliedPromo: null, socialMediaConsent: false };
    }),
  setSocialMediaConsent: (value) => set({ socialMediaConsent: value }),
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
}), {
  name: CART_STORAGE_KEY,
  // localStorage survives new tabs and return visits; sessionStorage cleared when the session ends
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    items: state.items.map((i) => ({ product: i.product, quantity: i.quantity })),
    appliedPromo: state.appliedPromo,
  }),
}));

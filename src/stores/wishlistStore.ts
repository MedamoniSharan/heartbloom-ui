import { create } from "zustand";

interface WishlistState {
  items: string[]; // product IDs
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
}

const saved = JSON.parse(localStorage.getItem("heartprinted-wishlist") || "[]");

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: saved,
  toggle: (id) => {
    set((s) => {
      const next = s.items.includes(id)
        ? s.items.filter((i) => i !== id)
        : [...s.items, id];
      localStorage.setItem("heartprinted-wishlist", JSON.stringify(next));
      return { items: next };
    });
  },
  isWishlisted: (id) => get().items.includes(id),
  clear: () => {
    localStorage.removeItem("heartprinted-wishlist");
    set({ items: [] });
  },
}));

import { create } from "zustand";
import { getToken } from "@/lib/api";
import { wishlistApi } from "@/lib/api";

const LOCAL_KEY = "heartprinted-wishlist";

function getLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

interface WishlistState {
  items: string[];
  toggle: (id: string) => void | Promise<void>;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
  setItems: (ids: string[]) => void;
  syncFromApi: () => Promise<void>;
}

const saved = getLocal();

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: saved,

  setItems: (ids) => set({ items: ids }),

  syncFromApi: async () => {
    if (!getToken()) return;
    try {
      const { productIds } = await wishlistApi.get();
      set({ items: productIds });
    } catch {
      // keep current state
    }
  },

  toggle: async (id) => {
    if (getToken()) {
      try {
        const { productIds } = await wishlistApi.toggle(id);
        set({ items: productIds });
      } catch {
        // keep current state on error
      }
      return;
    }
    set((s) => {
      const next = s.items.includes(id)
        ? s.items.filter((i) => i !== id)
        : [...s.items, id];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return { items: next };
    });
  },

  isWishlisted: (id) => get().items.includes(id),

  clear: () => {
    localStorage.removeItem(LOCAL_KEY);
    set({ items: [] });
  },
}));

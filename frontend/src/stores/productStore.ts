import { create } from "zustand";
import { productsApi, ordersApi, promosApi, type ApiProduct, type ApiOrder, type ApiPromo } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  slug?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  customizable?: boolean;
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

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  description: string;
  active: boolean;
  expiresAt?: string;
}

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  longDescription: p.longDescription,
  price: p.price,
  image: p.image,
  images: p.images,
  category: p.category,
  slug: p.slug,
  rating: p.rating,
  reviews: p.reviews,
  inStock: p.inStock,
  customizable: p.customizable,
  whatsappMessage: p.whatsappMessage,
});

const mapOrder = (o: ApiOrder): Order => ({
  id: o.id,
  userId: o.userId,
  userName: o.userName,
  items: o.items.map((i) => ({
    product: {
      id: i.product.id,
      name: i.product.name,
      description: "",
      price: i.product.price,
      image: i.product.image,
      category: "",
      rating: 0,
      reviews: 0,
      inStock: true,
    },
    quantity: i.quantity,
  })),
  total: o.total,
  status: o.status,
  address: o.address,
  createdAt: o.createdAt,
});

const mapPromo = (p: ApiPromo): PromoCode => ({
  id: p.id,
  code: p.code,
  discount: p.discount,
  description: p.description,
  active: p.active,
  expiresAt: p.expiresAt,
});

interface ProductState {
  products: Product[];
  orders: Order[];
  promoCodes: PromoCode[];
  productsLoading: boolean;
  ordersLoading: boolean;
  promosLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchOrders: (isAdmin?: boolean) => Promise<void>;
  fetchPromos: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<boolean>;
  removeProduct: (id: string) => Promise<boolean>;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<boolean>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<boolean>;
  addPromoCode: (promo: Omit<PromoCode, "id">) => Promise<boolean>;
  updatePromoCode: (id: string, promo: Omit<PromoCode, "id">) => Promise<boolean>;
  removePromoCode: (id: string) => Promise<boolean>;
  togglePromoCode: (id: string) => Promise<boolean>;
  validatePromo: (code: string) => Promise<PromoCode | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  orders: [],
  promoCodes: [],
  productsLoading: false,
  ordersLoading: false,
  promosLoading: false,

  fetchProducts: async () => {
    set({ productsLoading: true });
    try {
      const list = await productsApi.getAll();
      set({ products: list.map(mapProduct), productsLoading: false });
    } catch {
      set({ productsLoading: false });
    }
  },

  fetchOrders: async (isAdmin = false) => {
    set({ ordersLoading: true });
    try {
      const list = isAdmin ? await ordersApi.getAll() : await ordersApi.getMine();
      set({ orders: list.map(mapOrder), ordersLoading: false });
    } catch {
      set({ orders: [], ordersLoading: false });
    }
  },

  fetchPromos: async () => {
    set({ promosLoading: true });
    try {
      const list = await promosApi.getAll();
      set({ promoCodes: list.map(mapPromo), promosLoading: false });
    } catch {
      set({ promosLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const created = await productsApi.create({
        name: product.name,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        image: product.image,
        category: product.category,
        rating: product.rating ?? 4.5,
        reviews: product.reviews ?? 0,
        inStock: product.inStock !== false,
        customizable: product.customizable,
      });
      set((s) => ({ products: [mapProduct(created), ...s.products] }));
      return true;
    } catch {
      return false;
    }
  },

  removeProduct: async (id) => {
    try {
      await productsApi.delete(id);
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  addOrder: async (order) => {
    try {
      const created = await ordersApi.create({
        items: order.items,
        total: order.total,
        address: order.address,
      });
      set((s) => ({ orders: [mapOrder(created), ...s.orders] }));
      return true;
    } catch {
      return false;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status);
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
      return true;
    } catch {
      return false;
    }
  },

  addPromoCode: async (promo) => {
    try {
      const created = await promosApi.create({
        code: promo.code,
        discount: promo.discount,
        description: promo.description,
        expiresAt: promo.expiresAt,
      });
      set((s) => ({ promoCodes: [mapPromo(created), ...s.promoCodes] }));
      return true;
    } catch {
      return false;
    }
  },

  removePromoCode: async (id) => {
    try {
      await promosApi.delete(id);
      set((s) => ({ promoCodes: s.promoCodes.filter((p) => p.id !== id) }));
      return true;
    } catch {
      return false;
    }
  },

  updatePromoCode: async (id, data) => {
    try {
      const p = await promosApi.update(id, data);
      set((s) => ({
        promoCodes: s.promoCodes.map((x) => (x.id === id ? mapPromo(p) : x)),
      }));
      return true;
    } catch {
      return false;
    }
  },

  togglePromoCode: async (id) => {
    const promo = get().promoCodes.find((p) => p.id === id);
    if (!promo) return false;
    try {
      await promosApi.toggle(id, !promo.active);
      set((s) => ({
        promoCodes: s.promoCodes.map((p) =>
          p.id === id ? { ...p, active: !p.active } : p
        ),
      }));
      return true;
    } catch {
      return false;
    }
  },

  validatePromo: async (code) => {
    try {
      const promo = await promosApi.validate(code);
      return mapPromo(promo);
    } catch {
      return null;
    }
  },
}));

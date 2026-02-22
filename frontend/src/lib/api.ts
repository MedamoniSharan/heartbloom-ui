const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("magnetic_bliss_token") : null;

export const setToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("magnetic_bliss_token", token);
  else localStorage.removeItem("magnetic_bliss_token");
};

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || "Request failed");
  return data as T;
}

// Auth
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: ApiUser; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string) =>
    request<{ user: ApiUser; token: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<{ user: ApiUser }>("/api/auth/me"),
  logout: () => request<{ message: string }>("/api/auth/logout", { method: "POST" }),
};

// Products
export interface ApiProduct {
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

export const productsApi = {
  getAll: () => request<ApiProduct[]>("/api/products"),
  getById: (id: string) => request<ApiProduct>(`/api/products/${id}`),
  create: (body: Partial<ApiProduct> & { name: string; description: string; price: number }) =>
    request<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify(body) }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/products/${id}`, { method: "DELETE" }),
};

// Orders
export interface ApiAddress {
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

export interface ApiOrderItem {
  product: { id: string; name: string; image: string; price: number };
  quantity: number;
}

export interface ApiOrder {
  id: string;
  userId: string;
  userName: string;
  items: ApiOrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  address: ApiAddress;
  createdAt: string;
}

export const ordersApi = {
  getMine: () => request<ApiOrder[]>("/api/orders"),
  create: (body: { items: { product: ApiProduct; quantity: number }[]; total: number; address: ApiAddress }) =>
    request<ApiOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: body.items.map((i) => ({
          productId: i.product.id,
          product: i.product,
          quantity: i.quantity,
        })),
        total: body.total,
        address: body.address,
      }),
    }),
  updateStatus: (orderId: string, status: ApiOrder["status"]) =>
    request<ApiOrder>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Promos
export interface ApiPromo {
  id: string;
  code: string;
  discount: number;
  description: string;
  active: boolean;
  expiresAt?: string;
}

export const promosApi = {
  validate: (code: string) =>
    request<ApiPromo>(`/api/promos/validate/${encodeURIComponent(code)}`),
  getAll: () => request<ApiPromo[]>("/api/promos"),
  create: (body: { code: string; discount: number; description: string; expiresAt?: string }) =>
    request<ApiPromo>("/api/promos", { method: "POST", body: JSON.stringify(body) }),
  toggle: (id: string, active: boolean) =>
    request<ApiPromo>(`/api/promos/${id}`, { method: "PATCH", body: JSON.stringify({ active }) }),
  delete: (id: string) =>
    request<{ message: string }>(`/api/promos/${id}`, { method: "DELETE" }),
};

// Wishlist
export const wishlistApi = {
  get: () => request<{ productIds: string[] }>("/api/wishlist"),
  toggle: (productId: string) =>
    request<{ productIds: string[]; added: boolean }>("/api/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
};

// Contact
export const contactApi = {
  send: (body: { name: string; email: string; subject: string; message: string }) =>
    request<{ message: string }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

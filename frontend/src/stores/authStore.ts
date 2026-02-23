import { create } from "zustand";
import { authApi, setToken, type ApiUser } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const mapUser = (u: ApiUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.login(email, password);
      setToken(token);
      set({ user: mapUser(user), isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.signup(name, email, password);
      setToken(token);
      set({ user: mapUser(user), isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    set({ isLoading: true });
    if (!import.meta.env.VITE_API_URL && !localStorage.getItem("magnetic_bliss_token")) {
      set({ hydrated: true, isLoading: false });
      return;
    }
    const token = localStorage.getItem("magnetic_bliss_token");
    if (!token) {
      set({ hydrated: true, isLoading: false });
      return;
    }
    try {
      const { user } = await authApi.me();
      set({ user: mapUser(user), isAuthenticated: true, hydrated: true, isLoading: false });
    } catch {
      setToken(null);
      set({ user: null, isAuthenticated: false, hydrated: true, isLoading: false });
    }
  },
}));

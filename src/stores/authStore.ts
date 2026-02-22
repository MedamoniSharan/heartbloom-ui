import { create } from "zustand";

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
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: (User & { password: string })[] = [
  { id: "admin-1", name: "Admin User", email: "admin@heartprinted.com", password: "admin123", role: "admin" },
  { id: "user-1", name: "Jane Doe", email: "jane@example.com", password: "password", role: "customer" },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...user } = found;
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  signup: (name, email, password) => {
    const exists = MOCK_USERS.find((u) => u.email === email);
    if (exists) return false;
    const newUser: User = { id: `user-${Date.now()}`, name, email, role: "customer" };
    MOCK_USERS.push({ ...newUser, password });
    set({ user: newUser, isAuthenticated: true });
    return true;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));

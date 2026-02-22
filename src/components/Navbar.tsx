import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, ShoppingCart, User, LogOut, Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{
        backgroundColor: `hsl(var(--background) / ${bgOpacity})`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-border"
        style={{ opacity: borderOpacity }}
      />
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl font-bold text-foreground">HeartPrinted</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          {isAuthenticated && <Link to="/orders" className="hover:text-foreground transition-colors">Orders</Link>}
          {user?.role === "admin" && <Link to="/admin" className="hover:text-foreground transition-colors flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Admin</Link>}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Cart icon */}
          <Link to="/cart" className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-xs text-muted-foreground">{user?.name}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                className="px-5 py-2.5 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium glow-pink-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

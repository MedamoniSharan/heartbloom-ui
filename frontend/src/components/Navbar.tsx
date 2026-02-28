import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, LogOut, Shield, ShoppingCart, RefreshCw } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Link, useNavigate } from "react-router-dom";
import { siteConfig } from "@/lib/siteConfig";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItemsCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const wishlistItemsCount = useWishlistStore((s) => s.items.length);
  const navigate = useNavigate();
  const hasPromos = useProductStore((s) => s.promoCodes.some((p) => p.active));

  return (
    <motion.header
      className={`fixed left-0 right-0 z-50 px-6 py-4 ${hasPromos ? "top-8" : "top-0"}`}
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
          {siteConfig.logoUrl ? (
            <img src={siteConfig.logoUrl} alt="Magnetic Bliss India" className="h-8 w-auto object-contain group-hover:scale-110 transition-transform" />
          ) : (
            <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          )}
          <span className="font-display text-xl font-bold text-foreground">Magnetic Bliss India</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <Link to="/events" className="hover:text-foreground transition-colors">Events</Link>
          <Link to="/gallery" className="hover:text-foreground transition-colors">Gallery</Link>
          <Link to="/equipment" className="hover:text-foreground transition-colors">Machines</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          {isAuthenticated && <Link to="/orders" className="hover:text-foreground transition-colors">Orders</Link>}
          {user?.role === "admin" && <Link to="/admin" className="hover:text-foreground transition-colors flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Admin</Link>}
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => window.location.reload()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label="Refresh Page"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Refresh</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/wishlist" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all relative">
                  <Heart className="w-5 h-5" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full">
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Wishlist</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/cart" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p className="text-xs">Cart</p></TooltipContent>
            </Tooltip>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center pl-3 pr-1 py-1 rounded-xl border border-border bg-card shadow-sm gap-2 ml-1">
                <span className="hidden md:block text-xs font-semibold text-foreground">{user?.name}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => { logout(); navigate("/"); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom"><p className="text-xs">Log out</p></TooltipContent>
                </Tooltip>
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
        </TooltipProvider>
      </nav>
    </motion.header>
  );
};

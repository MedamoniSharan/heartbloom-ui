import { motion } from "framer-motion";
import { Home, ShoppingBag, User, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShoppingBag, label: "My Orders", href: "/orders" },
];

interface MobileBottomNavProps {
  onUploadClick?: () => void;
}

export const MobileBottomNav = ({ onUploadClick }: MobileBottomNavProps) => {
  const isMobile = useIsMobile();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOrdersClick = (e: React.MouseEvent) => {
    if (isAuthenticated) return;
    e.preventDefault();
    const authMessage = "SignUp 0r SignIn to view the orders";
    toast({ title: authMessage });
    navigate("/login", {
      state: {
        from: { pathname: "/orders" },
        authMessage,
      },
    });
  };

  if (!isMobile) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {/* Left items */}
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            onClick={item.href === "/orders" ? handleOrdersClick : undefined}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-target"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Center FAB — Upload */}
        <div className="relative -mt-6">
          <motion.button
            onClick={onUploadClick}
            className="w-14 h-14 rounded-full bg-gradient-pink text-primary-foreground shadow-elevated flex items-center justify-center glow-pink-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Upload photos"
          >
            <Upload className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Right items */}
        <Link
          to={isAuthenticated ? "/orders" : "/login"}
          className="flex flex-col items-center gap-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-target"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
};

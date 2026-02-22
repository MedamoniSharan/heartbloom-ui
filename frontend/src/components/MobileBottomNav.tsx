import { motion } from "framer-motion";
import { Home, ShoppingBag, User, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: ShoppingBag, label: "Order", href: "#pricing" },
];

const navItemsRight = [
  { icon: User, label: "Account", href: "#" },
];

interface MobileBottomNavProps {
  onUploadClick?: () => void;
}

export const MobileBottomNav = ({ onUploadClick }: MobileBottomNavProps) => {
  const isMobile = useIsMobile();
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
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-target"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
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
        {navItemsRight.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-target"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

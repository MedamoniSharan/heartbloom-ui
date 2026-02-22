import { motion, useScroll, useTransform } from "framer-motion";
import { Heart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

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
        <a href="/" className="flex items-center gap-2 group">
          <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl font-bold text-foreground">HeartPrinted</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#gallery" className="hover:text-foreground transition-colors">Gallery</a>
          <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            className="px-5 py-2.5 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium glow-pink-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
};

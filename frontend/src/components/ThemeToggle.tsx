import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-muted border border-border p-0.5 flex items-center cursor-pointer"
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sliding thumb */}
      <motion.div
        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm"
        animate={{ x: isDark ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-primary-foreground" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-primary-foreground" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

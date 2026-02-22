import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoot } from "react-dom/client";
import { LottieFromPath } from "@/components/LottieFromPath";
import App from "./App.tsx";
import "./index.css";

const LOTTIE_LOADER_PATH = "/tri-cube-loader-2.json";

const MagnetLoader = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--background))]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="w-48 h-48 mb-4 flex items-center justify-center relative">
            {/* Fallback spinner when Lottie is still loading */}
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </span>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <LottieFromPath path={LOTTIE_LOADER_PATH} className="w-full h-full" />
            </div>
          </div>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
              Magnetic Bliss India
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Turning memories into magnets ✨
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Root = () => (
  <>
    <MagnetLoader />
    <App />
  </>
);

createRoot(document.getElementById("root")!).render(<Root />);

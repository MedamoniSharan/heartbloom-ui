import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoot } from "react-dom/client";
import Lottie from "lottie-react";
import App from "./App.tsx";
import "./index.css";

const LOTTIE_LOADER_PATH = "/lottie/loader.json";

const MagnetLoader = () => {
  const [visible, setVisible] = useState(true);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch(LOTTIE_LOADER_PATH)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--background))]"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="w-40 h-40 mb-4 flex items-center justify-center">
            {animationData ? (
              <Lottie animationData={animationData} loop className="w-full h-full" />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            )}
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

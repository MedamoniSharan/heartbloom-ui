import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Magnet icon animation */}
          <div className="relative w-28 h-28 mb-6">
            {/* Outer ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[hsl(var(--primary))]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[hsl(var(--primary))]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Center magnet shape */}
            <motion.div
              className="absolute inset-2 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 shadow-lg shadow-[hsl(var(--primary))]/30 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Photo squares floating in */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-5 h-5 rounded-sm bg-white/90"
                  initial={{ scale: 0, x: (i % 2 === 0 ? -40 : 40), y: (i < 2 ? -40 : 40) }}
                  animate={{
                    scale: [0, 1, 1, 0],
                    x: [i % 2 === 0 ? -40 : 40, (i % 2 === 0 ? -6 : 6)],
                    y: [i < 2 ? -40 : 40, (i < 2 ? -6 : 6)],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Magnet U shape */}
              <svg viewBox="0 0 40 40" className="w-10 h-10 relative z-10" fill="none">
                <motion.path
                  d="M10 8 L10 24 Q10 32 20 32 Q30 32 30 24 L30 8"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                <motion.rect x="6" y="6" width="8" height="4" rx="1" fill="hsl(0, 70%, 55%)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                />
                <motion.rect x="26" y="6" width="8" height="4" rx="1" fill="hsl(220, 70%, 55%)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Brand name */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="font-display text-2xl font-bold text-[hsl(var(--foreground))]">
              Magnetic Bliss India
            </h1>
            <motion.p
              className="text-sm text-[hsl(var(--muted-foreground))] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Turning memories into magnets ✨
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
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

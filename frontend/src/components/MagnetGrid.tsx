import { motion } from "framer-motion";
import { Plus, ImageIcon } from "lucide-react";
import { Reveal } from "./Reveal";

// Placeholder magnet grid simulating uploaded photos
const magnetSlots = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  filled: i < 5,
}));

const colors = [
  "from-pink-light/30 to-primary/20",
  "from-primary/20 to-pink-dark/30",
  "from-pink-light/20 to-primary/10",
  "from-primary/30 to-pink-light/20",
  "from-pink-dark/20 to-primary/20",
];

export const MagnetGrid = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-h1 text-center text-foreground mb-4">
            Your Magnet Collection
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-center text-muted-foreground max-w-lg mx-auto mb-16">
            Upload 9 photos and we'll print them as premium fridge magnets. Drag to rearrange.
          </p>
        </Reveal>

        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {magnetSlots.map((slot, i) => (
              <Reveal key={slot.id} delay={200 + i * 60}>
                <motion.div
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {slot.filled ? (
                    <>
                      <div className={`w-full h-full bg-gradient-to-br ${colors[i % colors.length]}`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary/40" />
                        </div>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-xs font-medium text-primary-foreground">Edit</span>
                      </div>
                      {/* Bleed indicator */}
                      <div className="absolute inset-1 border border-dashed border-primary/30 rounded-lg pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Counter badge */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              5 of 9 photos added
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Settings, ImageIcon, ChevronRight,
  Shield, Truck, Heart, Lock, Check,
} from "lucide-react";
import { usePhotoStore, MAX_PHOTOS, buildFilterString } from "@/stores/photoStore";
import { ImageEditor } from "./ImageEditor";
import { UploadModal } from "./UploadModal";
import { Reveal } from "./Reveal";

const trustBadges = [
  { icon: Heart, text: "Loved by Thousands" },
  { icon: Truck, text: "Fast Shipping" },
  { icon: Shield, text: "Handcrafted Quality" },
  { icon: Lock, text: "Secure Checkout" },
];

export const ProductPreview = () => {
  const { photos, removePhoto, updatePhoto } = usePhotoStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"crop" | "filters">("crop");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);

  const editingPhoto = photos.find((p) => p.id === editingId);
  const filled = photos.length;
  const progress = (filled / MAX_PHOTOS) * 100;
  const remaining = MAX_PHOTOS - filled;

  const price = isSubscription ? 21.99 : 24.99;

  // Generate 9 slots — filled from photos, rest empty
  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] || null);

  return (
    <section className="py-24 px-6 bg-background" id="preview">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-h1 text-center text-foreground mb-4">Your Magnet Collection</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-center text-muted-foreground max-w-lg mx-auto mb-12">
            Upload {MAX_PHOTOS} photos and we'll print them as premium fridge magnets.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          {/* Left — Magnet grid */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              {slots.map((photo, i) => (
                <motion.div
                  key={photo?.id || `empty-${i}`}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 25 }}
                >
                  {photo ? (
                    <>
                      {/* Photo */}
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                        style={{
                          filter: buildFilterString(photo.adjustments, photo.filter),
                          transform: `rotate(${photo.rotation}deg) ${photo.flipH ? "scaleX(-1)" : ""} ${photo.flipV ? "scaleY(-1)" : ""}`,
                        }}
                      />

                      {/* Bleed indicator — dashed border */}
                      <div className="absolute inset-2 border border-dashed border-primary/30 rounded-lg pointer-events-none" />

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1.5">
                          <motion.button
                            onClick={() => removePhoto(photo.id)}
                            className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            whileTap={{ scale: 0.9 }}
                            aria-label="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            onClick={() => { setEditingId(photo.id); setEditorTab("filters"); }}
                            className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            whileTap={{ scale: 0.9 }}
                            aria-label="Edit filters"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            onClick={() => { setEditingId(photo.id); setEditorTab("crop"); }}
                            className="w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                            whileTap={{ scale: 0.9 }}
                            aria-label="Crop & settings"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Empty slot */
                    <motion.button
                      onClick={() => setUploadOpen(true)}
                      className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </motion.div>
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bleed note */}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              <span className="inline-block w-3 h-3 border border-dashed border-primary/40 rounded mr-1 align-middle" />
              Area beyond the dotted line wraps around the magnet edges
            </p>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-6">
            {/* Counter */}
            <div className="p-5 rounded-2xl bg-card shadow-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Selected</span>
                <span className="text-sm font-bold text-primary">{filled}/{MAX_PHOTOS}</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-pink rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>

              {remaining > 0 ? (
                <motion.button
                  onClick={() => setUploadOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  Add {remaining} More Photo{remaining !== 1 ? "s" : ""}
                </motion.button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Check className="w-4 h-4" />
                  All {MAX_PHOTOS} slots filled!
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="p-5 rounded-2xl bg-card shadow-card border border-border space-y-4">
              {/* Subscription toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isSubscription ? "Monthly Subscription" : "One-time Purchase"}
                  </p>
                  {isSubscription && (
                    <p className="text-xs text-primary">Save $3.00/month</p>
                  )}
                </div>
                <button
                  onClick={() => setIsSubscription(!isSubscription)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isSubscription ? "bg-primary" : "bg-border"
                  }`}
                  role="switch"
                  aria-checked={isSubscription}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-primary-foreground shadow-sm"
                    animate={{ x: isSubscription ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground font-display">
                  ${price.toFixed(2)}
                </span>
                {isSubscription && (
                  <span className="text-xs text-muted-foreground">/month</span>
                )}
              </div>

              {/* Checkout button */}
              <motion.button
                className="w-full py-3.5 rounded-2xl bg-gradient-pink-animated text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.97 }}
                disabled={filled === 0}
              >
                {filled > 0 ? (
                  <>
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Add photos to continue"
                )}
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="space-y-3">
              {trustBadges.map((badge, i) => (
                <Reveal key={badge.text} delay={i * 100}>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card/50 border border-border/50">
                    <badge.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{badge.text}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor modal */}
      <AnimatePresence>
        {editingPhoto && (
          <ImageEditor
            photo={editingPhoto}
            onSave={(updates) => updatePhoto(editingPhoto.id, updates)}
            onClose={() => setEditingId(null)}
          />
        )}
      </AnimatePresence>

      {/* Upload modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </section>
  );
};

import { motion } from "framer-motion";
import { Plus, Camera, ArrowRight } from "lucide-react";
import { usePhotoStore } from "@/stores/photoStore";
import { Reveal } from "./Reveal";

interface UploadGridPreviewProps {
  onUploadClick: () => void;
}

const SLOTS = 4;

export const UploadGridPreview = ({ onUploadClick }: UploadGridPreviewProps) => {
  const { photos } = usePhotoStore();

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Camera className="w-3.5 h-3.5" />
              Upload Your Photos
            </span>
            <h2 className="text-h2 text-foreground mb-2">
              Start with <span className="text-gradient-pink">4 photos</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pick your favorite memories and we'll turn them into beautiful fridge magnets
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: SLOTS }).map((_, idx) => {
              const photo = photos[idx];
              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={onUploadClick}
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                    photo
                      ? "ring-2 ring-primary/30 shadow-md"
                      : "border-2 border-dashed border-border hover:border-primary/40 bg-muted/10 hover:bg-muted/20"
                  }`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.preview}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 left-2.5 min-w-[24px] h-[24px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md px-1">
                        {idx + 1}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-border/30 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground/60">
                        Photo {idx + 1}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="text-center">
            <motion.button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-base glow-pink"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {photos.length > 0 ? "Continue Uploading" : "Upload Your Photos"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            {photos.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                {photos.length}/{SLOTS} photos added
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

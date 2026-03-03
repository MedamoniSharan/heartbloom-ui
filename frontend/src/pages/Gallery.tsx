import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, X, Camera, Quote } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/siteConfig";
import { galleryApi, type ApiGalleryItem } from "@/lib/api";
import { useSiteContentStore } from "@/stores/siteContentStore";

const Gallery = () => {
  const [items, setItems] = useState<ApiGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApiGalleryItem | null>(null);
  const { heroStats } = useSiteContentStore();

  useEffect(() => {
    galleryApi
      .getAll()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (item: ApiGalleryItem) => {
    try {
      const updated = await galleryApi.like(item.id);
      setItems((prev) => prev.map((g) => (g.id === item.id ? updated : g)));
      if (selected?.id === item.id) setSelected(updated);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-14">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Camera className="w-3.5 h-3.5" /> Customer Gallery
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-hero text-foreground mb-3">Wall of <span className="text-gradient-pink">Love</span></h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Real customers, real magnets, real smiles. See how Magnetic Bliss India brings joy to fridges everywhere.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">{heroStats.happyCustomers.toLocaleString()}+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">{heroStats.avgRating}★</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">{heroStats.magnetsPrinted.toLocaleString()}+</p>
                <p className="text-xs text-muted-foreground">Magnets Created</p>
              </div>
            </div>
          </Reveal>
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="break-inside-avoid bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No gallery items yet. Check back soon!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <motion.div
                  className="break-inside-avoid bg-card border border-border rounded-2xl overflow-hidden shadow-card group cursor-pointer hover:shadow-elevated transition-shadow duration-300"
                  whileHover={{ y: -3 }}
                  onClick={() => setSelected(item)}
                >
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={`Photo by ${item.name}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">{item.caption}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(item); }}
                        className="flex items-center gap-1 hover:scale-110 transition-transform"
                      >
                        <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-xs text-muted-foreground">{item.likes}</span>
                      </button>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} className={`w-3.5 h-3.5 ${si < item.rating ? "fill-warning text-warning" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal delay={200}>
          <div className="text-center mt-16 bg-card border border-border rounded-2xl p-10 shadow-card">
            <h2 className="text-h2 text-foreground mb-3">Share Your Magnets!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Got your Magnetic Bliss India magnets? Share a photo and join our Wall of Love. Tag us on social media!
            </p>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium glow-pink-sm"
            >
              Share on Instagram
            </a>
          </div>
        </Reveal>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              className="relative bg-card rounded-2xl overflow-hidden max-w-lg w-full shadow-elevated z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-foreground/50 text-background flex items-center justify-center hover:bg-foreground/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <img src={selected.image} alt="" className="w-full aspect-square object-cover" />
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-2">
                  <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground leading-relaxed">{selected.caption}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{selected.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(selected)}
                      className="flex items-center gap-1 hover:scale-110 transition-transform"
                    >
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">{selected.likes}</span>
                    </button>
                    <div className="flex">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} className={`w-4 h-4 ${si < selected.rating ? "fill-warning text-warning" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;

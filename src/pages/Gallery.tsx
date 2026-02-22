import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, X, Camera, Quote } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

interface GalleryItem {
  id: string;
  image: string;
  name: string;
  location: string;
  caption: string;
  rating: number;
  likes: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g1", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=600&fit=crop", name: "Sarah M.", location: "New York, NY", caption: "These magnets are absolutely gorgeous! They bring so much joy every time I open the fridge. 💕", rating: 5, likes: 234 },
  { id: "g2", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop", name: "Mike T.", location: "Austin, TX", caption: "Ordered heart-shaped magnets for our anniversary. My wife cried happy tears! Best gift ever.", rating: 5, likes: 189 },
  { id: "g3", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop", name: "Emily R.", location: "Seattle, WA", caption: "The quality is insane. Colors pop beautifully and the magnet is super strong. Already ordered another set!", rating: 5, likes: 312 },
  { id: "g4", image: "https://images.unsplash.com/photo-1531265726475-52ad60219627?w=600&h=600&fit=crop", name: "David K.", location: "Chicago, IL", caption: "Used these as wedding favors. Guests absolutely loved them! Such a unique and personal touch.", rating: 5, likes: 445 },
  { id: "g5", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=600&fit=crop", name: "Lisa Chen", location: "San Francisco, CA", caption: "Family photos on the fridge make my kitchen feel so warm and homey. The print quality is professional!", rating: 4, likes: 156 },
  { id: "g6", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop", name: "James W.", location: "Denver, CO", caption: "My dog looks absolutely adorable as a magnet! Everyone who visits comments on them. 🐶", rating: 5, likes: 278 },
  { id: "g7", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=600&fit=crop", name: "Ana P.", location: "Miami, FL", caption: "Travel magnets from our honeymoon! So much better than the generic tourist ones. Highly recommend!", rating: 5, likes: 201 },
  { id: "g8", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop", name: "Tom H.", location: "Portland, OR", caption: "The custom text magnets with our family motto are perfect. Great quality and fast delivery!", rating: 4, likes: 98 },
  { id: "g9", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop", name: "Rachel S.", location: "Boston, MA", caption: "Baby shower favors were a HUGE hit. Everyone asked where I got them. Affordable and beautiful!", rating: 5, likes: 167 },
];

const Gallery = () => {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

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

          {/* Stats */}
          <Reveal delay={200}>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">10K+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">4.9★</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground font-display">50K+</p>
                <p className="text-xs text-muted-foreground">Magnets Created</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Masonry-ish Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {GALLERY_ITEMS.map((item, i) => (
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
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground">{item.likes}</span>
                    </div>
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

        {/* CTA */}
        <Reveal delay={200}>
          <div className="text-center mt-16 bg-card border border-border rounded-2xl p-10 shadow-card">
            <h2 className="text-h2 text-foreground mb-3">Share Your Magnets!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Got your Magnetic Bliss India magnets? Share a photo and join our Wall of Love. Tag us on social media!
            </p>
            <a
              href="https://instagram.com"
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
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">{selected.likes}</span>
                    </div>
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

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, MessageCircle, Search, Tag, X } from "lucide-react";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";

const WHATSAPP_NUMBER = "1234567890";

const getWhatsAppLink = (product: Product) => {
  const message = encodeURIComponent(`Hi! I'm interested in "${product.name}" ($${product.price}). Can you tell me more?`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

const Products = () => {
  const { products, promoCodes } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dismissedPromos, setDismissedPromos] = useState<string[]>([]);

  const activePromos = promoCodes.filter((p) => p.active && !dismissedPromos.includes(p.id));

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = (product: Product) => {
    addToCart(product);
    toast({ title: "Added to cart!", description: `${product.name} added.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-6 pb-16 max-w-6xl mx-auto">
        <Reveal><h1 className="text-h1 text-foreground mb-2">Our Products</h1></Reveal>
        <Reveal delay={100}><p className="text-muted-foreground mb-6">Premium photo magnets for every occasion</p></Reveal>

        {/* Promo Announcements */}
        {activePromos.length > 0 && (
          <div className="space-y-2 mb-6">
            {activePromos.map((promo) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{promo.description}</span>
                    <span className="ml-2 text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-md">{promo.code}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({promo.discount}% off)</span>
                  </div>
                </div>
                <button onClick={() => setDismissedPromos((d) => [...d, promo.id])} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                    <span className="bg-card text-foreground px-3 py-1 rounded-lg text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                  <span className="text-xs font-medium text-foreground">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-foreground font-display">${product.price}</span>
                  <div className="flex gap-1.5">
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-[hsl(142,70%,45%)] text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <motion.button
                      onClick={() => handleAdd(product)}
                      disabled={!product.inStock}
                      className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                      whileTap={{ scale: 0.9 }}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;

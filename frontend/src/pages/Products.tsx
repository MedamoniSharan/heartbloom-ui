import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, MessageCircle, Search, Heart } from "lucide-react";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";

const getWhatsAppLink = (product: Product) => {
  const message = encodeURIComponent(`Hi! I'm interested in "${product.name}" (₹${product.price}). Can you tell me more?`);
  return `https://wa.me/${siteConfig.whatsappDigits}?text=${message}`;
};

const Products = () => {
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        <Reveal><h1 className="text-h1 text-foreground mb-2">Our Products</h1></Reveal>
        <Reveal delay={100}><p className="text-muted-foreground mb-6">Premium photo magnets for every occasion</p></Reveal>




        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-8 shadow-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
              <span className="text-xs text-muted-foreground font-medium px-1 hidden sm:block whitespace-nowrap">Filter:</span>
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    category === cat
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {category === cat && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {search && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for "<span className="text-primary">{search}</span>"
              </p>
              <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Clear</button>
            </div>
          )}
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
              <Link to={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(product.id);
                      toast({ title: isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist!" });
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    whileTap={{ scale: 0.85 }}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </motion.button>
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
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4 flex gap-1.5 justify-end -mt-2">
                <a
                  href={getWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[hsl(142,70%,45%)] text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Chat on WhatsApp"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <motion.button
                  onClick={(e) => { e.preventDefault(); handleAdd(product); }}
                  disabled={!product.inStock}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>
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

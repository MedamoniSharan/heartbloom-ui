import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Search, Heart, Layers } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { LottieFromPath } from "@/components/LottieFromPath";
import { siteConfig } from "@/lib/siteConfig";

const RAW_MATERIALS_CATEGORY = "Raw Materials";
const HIDDEN_SHOP_CATEGORIES = new Set(["Equipment"]);

const getWhatsAppLink = (product: Product) => {
  const message = encodeURIComponent(`Hi! I'm interested in "${product.name}" (Rs${product.price}). Can you tell me more?`);
  return `https://wa.me/${siteConfig.whatsappDigits}?text=${message}`;
};

const Products = () => {
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("All");

  const shopProducts = useMemo(
    () => products.filter((p) => p.category && !HIDDEN_SHOP_CATEGORIES.has(p.category)),
    [products]
  );

  const sizeOptions = useMemo(
    () => ["All", ...new Set(shopProducts.map((p) => p.category))],
    [shopProducts]
  );

  const activeFilter = sizeFilter === "Upload" ? "All" : sizeFilter;

  const filtered = useMemo(() => {
    return shopProducts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchSize = activeFilter === "All" || p.category === activeFilter;
      return matchSearch && matchSize;
    });
  }, [shopProducts, search, activeFilter]);

  const categoryGroups = useMemo(() => {
    const order = sizeOptions.filter((c) => c !== "All");
    const map = new Map<string, Product[]>();
    for (const product of filtered) {
      const key = product.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(product);
    }
    const groups: { category: string; products: Product[] }[] = [];
    for (const category of order) {
      const list = map.get(category);
      if (list?.length) groups.push({ category, products: list });
    }
    for (const [category, list] of map) {
      if (!order.includes(category) && list.length) {
        groups.push({ category, products: list });
      }
    }
    return groups;
  }, [filtered, sizeOptions]);

  const handleAdd = (product: Product) => {
    addToCart(product);
    toast({ title: "Added to cart!", description: `${product.name} added.` });
  };

  const renderProductCard = (product: Product, i: number) => {
    const isRaw = product.category === RAW_MATERIALS_CATEGORY;
    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i * 0.04, 0.4) }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group hover:shadow-elevated transition-shadow duration-300"
      >
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isRaw && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-semibold">
                Raw Material
              </span>
            )}
            {!isRaw && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(product.id);
                      toast({
                        title: isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist!",
                      });
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    whileTap={{ scale: 0.85 }}
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted(product.id) ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Wishlist</p>
                </TooltipContent>
              </Tooltip>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                <span className="bg-card text-foreground px-3 py-1 rounded-lg text-sm font-medium">Out of Stock</span>
              </div>
            )}
          </div>
          <div className={`${isRaw ? "p-3 space-y-1.5" : "p-4 space-y-3"}`}>
            <h3 className={`font-display font-semibold text-foreground text-sm ${isRaw ? "line-clamp-1" : "line-clamp-2"}`}>
              {product.name}
            </h3>
            {!isRaw && (
              <div className="flex items-center gap-1">
                {product.reviews > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">No reviews yet</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {!isRaw && product.originalPrice != null && product.originalPrice > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">Rs{product.originalPrice}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
              <span className={`${isRaw ? "text-base" : "text-lg"} font-bold text-foreground font-display`}>
                Rs{product.price}
              </span>
            </div>
          </div>
        </Link>
        <div className={`${isRaw ? "px-3 pb-3" : "px-4 pb-4"} flex gap-1.5 justify-end -mt-2`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getWhatsAppLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isRaw ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl"} bg-[hsl(142,70%,45%)] text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity`}
                aria-label="Chat on WhatsApp"
                onClick={(e) => e.stopPropagation()}
              >
                <WhatsAppIcon className={isRaw ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Chat on WhatsApp</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  handleAdd(product);
                }}
                disabled={!product.inStock}
                className={`${isRaw ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl"} bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50`}
                whileTap={{ scale: 0.9 }}
                aria-label="Add to cart"
              >
                <ShoppingCart className={isRaw ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Add to Cart</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-6xl mx-auto">
          <Reveal>
            <h1 className="text-h1 text-foreground mb-2">Shop Now</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground mb-6">Browse magnets by category</p>
          </Reveal>

          {/* Filters & Search */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-8 shadow-card">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <span className="text-xs text-muted-foreground font-medium px-1 whitespace-nowrap">Filter:</span>
                {sizeOptions.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setSizeFilter(size)}
                    className={`relative px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      activeFilter === size
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {activeFilter === size && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-primary rounded-lg"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{size}</span>
                  </motion.button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search magnets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>
            {search && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span> result
                  {filtered.length !== 1 ? "s" : ""} for "<span className="text-primary">{search}</span>"
                </p>
                <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">
                  Clear
                </button>
              </div>
            )}
          </div>

          {categoryGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
              <div className="w-64 h-64 mb-4 flex items-center justify-center">
                <LottieFromPath path="/Online%20Shopping.json" className="w-full h-full" />
              </div>
              <h2 className="text-h3 text-foreground mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">Try a different search or category</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSizeFilter("All");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {categoryGroups.map((group, groupIndex) => (
                <Reveal key={group.category} delay={groupIndex * 40}>
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      {group.category === RAW_MATERIALS_CATEGORY && (
                        <Layers className="w-5 h-5 text-primary" />
                      )}
                      <h2 className="font-display font-bold text-foreground text-lg">{group.category}</h2>
                      <span className="text-xs text-muted-foreground">({group.products.length})</span>
                    </div>
                    <div
                      className={
                        group.category === RAW_MATERIALS_CATEGORY
                          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                      }
                    >
                      {group.products.map((product, i) => renderProductCard(product, i))}
                    </div>
                  </section>
                </Reveal>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Products;

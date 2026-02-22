import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { items, toggle } = useWishlistStore();
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const wishlisted = products.filter((p) => items.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-6 pb-16 max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <h1 className="text-h1 text-foreground">My Wishlist</h1>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-muted-foreground mb-8">
            {wishlisted.length} saved item{wishlisted.length !== 1 ? "s" : ""}
          </p>
        </Reveal>

        {wishlisted.length === 0 ? (
          <Reveal delay={120}>
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-h3 text-foreground mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save products you love and come back to them later</p>
              <Link
                to="/products"
                className="inline-flex px-6 py-3 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm"
              >
                Browse Products
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlisted.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group hover:shadow-elevated transition-shadow duration-300"
              >
                <Link to={`/products/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-foreground font-display">${product.price}</p>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex gap-1.5 justify-end -mt-1">
                  <motion.button
                    onClick={() => { toggle(product.id); toast({ title: "Removed from wishlist" }); }}
                    className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => { addToCart(product); toast({ title: "Added to cart!", description: product.name }); }}
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;

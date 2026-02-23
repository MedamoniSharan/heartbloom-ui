import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import logoMpro from "@/assets/logo-mpro.png";
import logoTitan from "@/assets/logo-titan.png";

const logos: Record<string, string> = {
  eq1: logoMpro,
  eq2: logoTitan,
};

const specData: Record<string, { label: string; value: string }[]> = {
  eq1: [
    { label: "Origin", value: "USA" },
    { label: "Lead Time", value: "In Stock" },
    { label: "Warranty", value: "Lifetime" },
    { label: "Max Paper Thickness", value: "32 lb" },
    { label: "Service", value: "Service & Support in the USA" },
  ],
  eq2: [
    { label: "Origin", value: "China, Designed in USA" },
    { label: "Lead Time", value: "In Stock" },
    { label: "Warranty", value: "Lifetime" },
    { label: "Max Paper Thickness", value: "42 lb" },
    { label: "Service", value: "Service & Support in the USA" },
  ],
};

const Equipment = () => {
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const equipmentProducts = products.filter((p) => p.category === "Equipment");

  const handleAdd = (product: typeof equipmentProducts[0]) => {
    addToCart(product);
    toast({ title: "Added to cart!", description: `${product.name} added.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Reveal><h1 className="text-h1 text-foreground mb-3">Want to do the same?</h1></Reveal>
          <Reveal delay={100}><p className="text-muted-foreground max-w-md mx-auto">Here are some equipment options for you.</p></Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {equipmentProducts.map((item, i) => {
            const eqKey = item.slug || item.id;
            return (
              <Reveal key={item.id} delay={i * 120}>
                <motion.div
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Brand Logo */}
                  {logos[eqKey] && (
                    <div className="flex items-center justify-center py-5 border-b border-border bg-muted/30">
                      <img src={logos[eqKey]} alt={item.name + " logo"} className="h-8 object-contain" />
                    </div>
                  )}

                  {/* Product Image — links to detail */}
                  <Link to={`/products/${item.id}`} className="block">
                    <div className="aspect-[5/4] overflow-hidden bg-muted relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-6">
                    <Link to={`/products/${item.id}`}>
                      <h3 className="font-display font-bold text-foreground text-lg mb-1 text-center hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-2xl font-bold text-primary text-center mb-4 font-display">₹{item.price.toLocaleString()}</p>

                    {/* Specs Table */}
                    {specData[eqKey] && (
                      <div className="space-y-0 mb-6">
                        {specData[eqKey].map((spec) => (
                          <div key={spec.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
                            <span className="text-sm font-semibold text-foreground">{spec.label}</span>
                            <span className="text-sm text-muted-foreground text-right">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="flex gap-3">
                      <Link to={`/products/${item.id}`} className="flex-1">
                        <motion.button
                          className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                          whileTap={{ scale: 0.97 }}
                        >
                          <Eye className="w-4 h-4" /> Preview
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => handleAdd(item)}
                        className="flex-1 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-semibold text-sm glow-pink-sm flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;

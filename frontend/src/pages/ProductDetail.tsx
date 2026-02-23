import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, ChevronLeft, Check, Minus, Plus, Box } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { MagnetMockup3D } from "@/components/MagnetMockup3D";
import { siteConfig } from "@/lib/siteConfig";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProductStore();
  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [show3D, setShow3D] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 px-6 text-center">
          <h1 className="text-h2 text-foreground mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary hover:underline">← Back to Products</Link>
        </main>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const productUrl = typeof window !== "undefined" ? window.location.href : `https://magnetic-bliss-india.vercel.app/products/${product.id}`;
  const whatsappLink = `https://wa.me/${siteConfig.whatsappDigits}?text=${encodeURIComponent(
    `Hi! I'm interested in "${product.name}" (₹${product.price}).\n\nCheck it out here: ${productUrl}\n\nCan you tell me more?`
  )}`;

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, qty);
    toast({ title: "Added to cart!", description: `${qty}× ${product.name}` });
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Reveal>
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Products
          </Link>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left — Images */}
          <Reveal>
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border mb-3 relative">
                {show3D ? (
                  <MagnetMockup3D imageUrl={images[selectedImage]} />
                ) : (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <motion.button
                  onClick={() => setShow3D(!show3D)}
                  className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-card transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <Box className="w-3.5 h-3.5" />
                  {show3D ? "2D View" : "3D Preview"}
                </motion.button>
                <motion.button
                  onClick={() => { toggle(product.id); toast({ title: isWishlisted(product.id) ? "Removed from wishlist" : "Saved to wishlist!" }); }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                  whileTap={{ scale: 0.85 }}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </motion.button>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedImage(i); setShow3D(false); }}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === i ? "border-primary" : "border-border"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Right — Details */}
          <div className="space-y-5">
            <Reveal>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">{product.category}</span>
              <h1 className="text-h1 text-foreground mt-1">{product.name}</h1>
            </Reveal>

            <Reveal delay={80}>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <p className="text-3xl font-bold text-foreground font-display">₹{product.price}</p>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              {product.longDescription && (
                <p className="text-muted-foreground leading-relaxed mt-3">{product.longDescription}</p>
              )}
            </Reveal>

            {product.customizable && (
              <Reveal delay={180}>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Upload & edit your photos after adding to cart</span>
                </div>
              </Reveal>
            )}

            {/* Quantity */}
            <Reveal delay={200}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center gap-1 bg-muted rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-foreground">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Actions */}
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </motion.button>
                <motion.button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 py-3.5 rounded-2xl border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.97 }}
                >
                  Buy Now
                </motion.button>
              </div>
            </Reveal>

            {/* WhatsApp */}
            <Reveal delay={280}>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(142,70%,45%)] text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </Reveal>

            {!product.inStock && (
              <p className="text-destructive text-sm font-medium">Currently out of stock</p>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <Reveal><h2 className="text-h2 text-foreground mb-6">Related Products</h2></Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <Link to={`/products/${p.id}`} className="block bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-elevated transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-display font-semibold text-foreground truncate">{p.name}</h3>
                      <p className="text-primary font-bold font-display mt-1">₹{p.price}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

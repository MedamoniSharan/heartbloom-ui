import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, Tag, Check, X, Image, Upload } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { buildFilterString } from "@/stores/photoStore";
import { Navbar } from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Footer } from "@/components/Footer";
import { LottieFromPath } from "@/components/LottieFromPath";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, removePhotoFromItem, subtotal, discountAmount, total, clearCart, appliedPromo, applyPromo, removePromo } = useCartStore();
  const { validatePromo } = useProductStore();
  const { orderQuantity } = useSiteContentStore();
  const globalMin = orderQuantity.min ?? 4;
  const globalMax = orderQuantity.max ?? 12;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [activePromos, setActivePromos] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api").then(({ promosApi }) => {
      promosApi.getActive().then((promos) => {
        setActivePromos(promos);
      }).catch(console.error);
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 sm:pt-32 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-64 h-64 mb-4 flex items-center justify-center">
            <LottieFromPath path="/Shopping%20Cart%20Loader.json" className="w-full h-full" />
          </div>
          <h1 className="text-h2 text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Link to="/products" className="px-6 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm">
            Browse Products
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-h1 text-foreground">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear All</button>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <div className="space-y-3">
            {items.map((item) => (
              <Fragment key={item.product.id}>
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 bg-card border border-border rounded-2xl p-4"
              >
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm truncate">{item.product.name}</h3>
                  <p className="text-muted-foreground text-xs mt-1">Rs{item.product.price} each</p>

                  <div className="flex items-center gap-3 mt-3">
                    {(() => {
                      const minQty = item.product.minQuantity ?? globalMin;
                      const maxQty = item.product.maxQuantity ?? globalMax;
                      const itemPhotos = item.photos ?? [];
                      const handleIncrease = () => {
                        const newQty = Math.min(maxQty, item.quantity + 1);
                        if (item.product.customizable && newQty > itemPhotos.length) {
                          updateQuantity(item.product.id, newQty);
                          toast({
                            title: "Upload more photos",
                            description: `You need ${newQty - itemPhotos.length} more photo${newQty - itemPhotos.length !== 1 ? "s" : ""}. Redirecting...`,
                          });
                          navigate(`/products/${item.product.id}`);
                          return;
                        }
                        updateQuantity(item.product.id, newQty);
                      };
                      return (
                        <div className="flex items-center gap-1 bg-muted rounded-lg">
                          <button onClick={() => updateQuantity(item.product.id, Math.max(minQty, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled={item.quantity <= minQty}>
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                          <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" disabled={item.quantity >= maxQty}>
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}
                    <button onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-foreground">Rs{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </motion.div>

              {/* Photo grid for this product only (customizable items) */}
              {item.product.customizable && (
                <div className="bg-card border border-border rounded-2xl p-4 -mt-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-medium text-foreground">
                        Your Photos ({(item.photos ?? []).length}/{item.quantity})
                      </h3>
                    </div>
                    {(item.photos ?? []).length < item.quantity && (
                      <button
                        onClick={() => navigate(`/products/${item.product.id}`)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload {item.quantity - (item.photos ?? []).length} more
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(item.photos ?? []).map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        className="aspect-square rounded-lg overflow-hidden border border-border relative group"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <img
                          src={photo.preview}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                          style={{ filter: buildFilterString(photo.adjustments, photo.filter) }}
                        />
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhotoFromItem(item.product.id, photo.id)}
                          className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    {Array.from({ length: Math.max(0, item.quantity - (item.photos ?? []).length) }).map((_, i) => (
                      <motion.div
                        key={`empty-${item.product.id}-${i}`}
                        className="aspect-square rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 cursor-pointer hover:border-primary/60 transition-colors"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: ((item.photos ?? []).length + i) * 0.03 }}
                        onClick={() => navigate(`/products/${item.product.id}`)}
                      >
                        <div className="text-center">
                          <Upload className="w-4 h-4 text-primary/40 mx-auto" />
                          <span className="text-[8px] text-primary/40 font-medium">{(item.photos ?? []).length + i + 1}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              </Fragment>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-5 h-fit space-y-4 shadow-card">
            <h3 className="font-display font-semibold text-foreground">Order Summary</h3>

            {/* Promo Code Input */}
            {!appliedPromo ? (
              <div className="space-y-3">
                {activePromos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Available Offers</p>
                    <div className="flex flex-wrap gap-2">
                      {activePromos.map(promo => (
                        <button
                          key={promo.id}
                          onClick={() => setPromoInput(promo.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          <Tag className="w-3 h-3 text-primary" />
                          <div>
                            <span className="text-xs font-bold text-primary block">{promo.code}</span>
                            <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">{promo.discount}% off</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={async () => {
                      if (!promoInput.trim()) return;
                      setPromoLoading(true);
                      setPromoError("");
                      try {
                        const promo = await validatePromo(promoInput.trim());
                        if (promo) {
                          applyPromo(promo.code, promo.discount);
                          setPromoInput("");
                          confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#e41887', '#12b981', '#f59e0b', '#3b82f6']
                          });
                        } else {
                          setPromoError("Invalid or expired code");
                        }
                      } catch {
                        setPromoError("Invalid or expired code");
                      } finally {
                        setPromoLoading(false);
                      }
                    }}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 whitespace-nowrap"
                    whileTap={{ scale: 0.95 }}
                  >
                    {promoLoading ? "..." : "Apply"}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {promoError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-destructive"
                    >
                      {promoError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-primary">{appliedPromo.code}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">−{appliedPromo.discount}% off</span>
                  </div>
                </div>
                <button onClick={removePromo} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>Rs{subtotal().toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between text-primary text-sm"
                >
                  <span>Discount ({appliedPromo.discount}%)</span>
                  <span>−Rs{discountAmount().toFixed(2)}</span>
                </motion.div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span className="text-primary">Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span><span className="font-display">Rs{total().toFixed(2)}</span>
              </div>
            </div>
            {(() => {
              const customItemNeedingPhotos = items.find((i) => i.product.customizable && ((i.photos?.length ?? 0) < i.quantity));
              const missingCount = customItemNeedingPhotos ? customItemNeedingPhotos.quantity - (customItemNeedingPhotos.photos?.length ?? 0) : 0;
              return customItemNeedingPhotos && missingCount > 0 ? (
                <motion.button
                  onClick={() => navigate(`/products/${customItemNeedingPhotos.product.id}`)}
                  className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 mt-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Upload className="w-4 h-4" /> Upload {missingCount} Missing Photo{missingCount !== 1 ? "s" : ""}
                </motion.button>
              ) : (
                <Link to="/address">
                  <motion.button
                    className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 mt-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              );
            })()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

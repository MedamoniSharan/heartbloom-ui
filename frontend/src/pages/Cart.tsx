import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Upload, X, Tag, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { usePhotoStore, MAX_PHOTOS, buildFilterString } from "@/stores/photoStore";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { UploadModal } from "@/components/UploadModal";
import { ImageEditor } from "@/components/ImageEditor";
import { LottieFromPath } from "@/components/LottieFromPath";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, subtotal, discountAmount, total, clearCart, appliedPromo, applyPromo, removePromo } = useCartStore();
  const { validatePromo } = useProductStore();
  const { photos, removePhoto, updatePhoto } = usePhotoStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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

  const editingPhoto = photos.find((p) => p.id === editingPhotoId);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 px-6 flex flex-col items-center justify-center min-h-[60vh]">
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
      <main className="pt-32 px-6 pb-16 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-h1 text-foreground">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-destructive hover:underline">Clear All</button>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8">
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 bg-card border border-border rounded-2xl p-4"
              >
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm truncate">{item.product.name}</h3>
                  <p className="text-muted-foreground text-xs mt-1">${item.product.price} each</p>

                  {/* Edit pictures button for customizable products */}
                  {item.product.customizable && (
                    <motion.button
                      onClick={() => setUploadOpen(true)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload className="w-3.5 h-3.5" /> Edit pictures
                    </motion.button>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-muted rounded-lg">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </motion.div>
            ))}

            {/* Photo preview strip if photos uploaded */}
            {photos.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Your Photos ({photos.length}/{MAX_PHOTOS})</h3>
                  <button onClick={() => setPreviewOpen(true)} className="text-xs text-primary hover:underline">
                    Preview Grid
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden group">
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-cover cursor-pointer"
                        style={{ filter: buildFilterString(photo.adjustments, photo.filter) }}
                        onClick={() => setEditingPhotoId(photo.id)}
                      />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => setUploadOpen(true)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}
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
                          onClick={() => {
                            setPromoInput(promo.code);
                            // We don't automatically submit so they can see it filled, or we could submit. Let's just fill it.
                          }}
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
                {activePromos.length === 0 && <p className="text-[10px] text-muted-foreground">Try: WELCOME20, SPRING15</p>}
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
                <span>Subtotal</span><span>${subtotal().toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex justify-between text-primary text-sm"
                >
                  <span>Discount ({appliedPromo.discount}%)</span>
                  <span>−${discountAmount().toFixed(2)}</span>
                </motion.div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span className="text-primary">Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span><span className="font-display">${total().toFixed(2)}</span>
              </div>
            </div>
            <Link to="/address">
              <motion.button
                className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 mt-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div >
      </main >
      <Footer />

      {/* Upload modal */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Image editor */}
      <AnimatePresence>
        {editingPhoto && (
          <ImageEditor
            photo={editingPhoto}
            onSave={(updates) => updatePhoto(editingPhoto.id, updates)}
            onClose={() => setEditingPhotoId(null)}
          />
        )}
      </AnimatePresence>

      {/* Full preview modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-foreground">Product Preview</h2>
                <button onClick={() => setPreviewOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] || null).map((photo, i) => (
                  <div key={photo?.id || `empty-${i}`} className="aspect-square rounded-lg overflow-hidden border border-dashed border-primary/30">
                    {photo ? (
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-cover cursor-pointer"
                        style={{ filter: buildFilterString(photo.adjustments, photo.filter) }}
                        onClick={() => { setPreviewOpen(false); setEditingPhotoId(photo.id); }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span className="inline-block w-3 h-3 border border-dashed border-primary/40 rounded" />
                Area beyond the dotted lines will wrap around the edges of your magnets
              </div>

              <p className="text-sm text-foreground font-medium mt-3">Selected {photos.length}/{MAX_PHOTOS}</p>

              <motion.button
                onClick={() => setPreviewOpen(false)}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm"
                whileTap={{ scale: 0.97 }}
              >
                SAVE
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default Cart;

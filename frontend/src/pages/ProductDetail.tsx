import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, ChevronLeft, Check, Minus, Plus, Box, Upload, ThumbsUp, Send, MessageSquare } from "lucide-react";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { usePhotoStore } from "@/stores/photoStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadModal } from "@/components/UploadModal";
import { Reveal } from "@/components/Reveal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MagnetMockup3D } from "@/components/MagnetMockup3D";
import { Switch } from "@/components/ui/switch";
import { reviewsApi, type ApiReview } from "@/lib/api";

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hover || value) ? "fill-warning text-warning" : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, fetchProducts } = useProductStore();
  const { addToCart, setSocialMediaConsent, socialMediaConsent } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { clearPhotos } = usePhotoStore();
  const { orderQuantity } = useSiteContentStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const product = products.find((p) => p.id === id);
  const minQty = product?.minQuantity ?? orderQuantity.min ?? 4;
  const maxQty = product?.maxQuantity ?? orderQuantity.max ?? 12;
  const [qty, setQty] = useState(minQty);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    reviewsApi
      .getByProduct(id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to write a review.", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: "Write something", description: "Please add a comment for your review.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const review = await reviewsApi.create({ productId: id!, rating: newRating, comment: newComment.trim() });
      setReviews((prev) => [review, ...prev]);
      setNewComment("");
      setNewRating(5);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not submit review.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const updated = await reviewsApi.markHelpful(reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    } catch {
      // ignore
    }
  };

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

  const referenceImages = [product.image, ...(product.images || [])].slice(0, 4);
  const images = referenceImages.length ? referenceImages : [product.image];

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, qty);
    toast({ title: "Added to cart!", description: `${qty}× ${product.name}` });
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  const openUploadFlow = () => {
    clearPhotos();
    setShowUploadModal(true);
  };

  const handleAddToCartFromUpload = (socialMediaConsent: boolean) => {
    setSocialMediaConsent(socialMediaConsent);
    addToCart(product, qty);
    setShowUploadModal(false);
    toast({ title: "Added to cart!", description: `${qty}× ${product.name} with your photos` });
  };

  return (
    <TooltipProvider delayDuration={150}>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setShow3D(!show3D)}
                        className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-xs font-medium text-foreground flex items-center gap-1.5 hover:bg-card transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Box className="w-3.5 h-3.5" />
                        {show3D ? "2D View" : "3D Preview"}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Toggle View</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => { toggle(product.id); toast({ title: isWishlisted(product.id) ? "Removed from wishlist" : "Saved to wishlist!" }); }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                        whileTap={{ scale: 0.85 }}
                        aria-label="Toggle wishlist"
                      >
                        <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Wishlist</p></TooltipContent>
                  </Tooltip>
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
                  {product.reviews > 0 ? (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No reviews yet — be the first!</span>
                  )}
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="flex flex-wrap items-center gap-3">
                  {product.originalPrice != null && product.originalPrice > product.price ? (
                    <>
                      <span className="text-lg text-muted-foreground line-through font-display">Rs{product.originalPrice}</span>
                      <p className="text-3xl font-bold text-foreground font-display">Rs{product.price}</p>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-foreground font-display">Rs{product.price}</p>
                  )}
                </div>
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
                    <span className="text-sm text-foreground">Upload {qty} photo{qty !== 1 ? "s" : ""} for your magnets, then add to cart</span>
                  </div>
                </Reveal>
              )}

              {/* Quantity */}
              <Reveal delay={200}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg">
                    <button onClick={() => setQty(Math.max(minQty, qty - 1))} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={qty <= minQty}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-foreground">{qty}</span>
                    <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50" disabled={qty >= maxQty}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">(min {minQty}, max {maxQty})</span>
                </div>
              </Reveal>

              {/* Social media consent — on every product */}
              <Reveal delay={220}>
                <label className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border cursor-pointer">
                  <Switch
                    checked={socialMediaConsent}
                    onCheckedChange={setSocialMediaConsent}
                  />
                  <span className="text-sm text-foreground">
                    I agree to have my order featured in your social media content.
                  </span>
                </label>
              </Reveal>

              {/* Actions */}
              <Reveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.customizable ? (
                    <>
                      <motion.button
                        onClick={openUploadFlow}
                        disabled={!product.inStock}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Upload className="w-4 h-4" /> Upload pictures
                      </motion.button>
                      <motion.button
                        onClick={handleBuyNow}
                        disabled={!product.inStock}
                        className="flex-1 py-3.5 rounded-2xl border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
                        whileTap={{ scale: 0.97 }}
                      >
                        Buy Now
                      </motion.button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </Reveal>

              {product.customizable && (
                <UploadModal
                  open={showUploadModal}
                  onClose={() => setShowUploadModal(false)}
                  requiredCount={qty}
                  onAddToCart={handleAddToCartFromUpload}
                />
              )}

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
                        <div className="flex items-center gap-1.5 flex-wrap">
                        {p.originalPrice != null && p.originalPrice > p.price && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">Rs{p.originalPrice}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]">
                              {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                        <p className="text-primary font-bold font-display mt-1">Rs{p.price}</p>
                      </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
          {/* ─── Reviews Section ─── */}
          <div className="mt-16">
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-h2 text-foreground">Customer Reviews</h2>
                <span className="text-sm text-muted-foreground">({reviews.length})</span>
              </div>
            </Reveal>

            {/* Write a Review */}
            <Reveal delay={60}>
              <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-card">
                <h3 className="text-base font-semibold text-foreground mb-4">Write a Review</h3>
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Your Rating:</span>
                      <StarPicker value={newRating} onChange={setNewRating} />
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{newComment.length}/1000</span>
                      <motion.button
                        onClick={handleSubmitReview}
                        disabled={submitting || !newComment.trim()}
                        className="px-6 py-2.5 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium glow-pink-sm flex items-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? "Submitting..." : "Submit Review"}
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm mb-3">Log in to share your review</p>
                    <Link to="/login" className="text-primary text-sm font-medium hover:underline">Sign in</Link>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-full mt-3" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <Reveal>
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              </Reveal>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-2xl p-5 shadow-card"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex">
                                  {[...Array(5)].map((_, si) => (
                                    <Star
                                      key={si}
                                      className={`w-3 h-3 ${si < review.rating ? "fill-warning text-warning" : "text-border"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{review.comment}</p>
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful {review.helpful > 0 && `(${review.helpful})`}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default ProductDetail;

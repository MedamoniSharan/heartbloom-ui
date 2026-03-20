import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, ChevronLeft, Check, Minus, Plus, Box, Upload, ThumbsUp, Send, MessageSquare, ShieldCheck, Truck, X, Copy, ZoomIn, ArrowLeft, Pencil } from "lucide-react";
import { useProductStore, Product } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { usePhotoStore, buildFilterString } from "@/stores/photoStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useDropzone } from "react-dropzone";
import { MAX_FILE_SIZE, type PhotoItem } from "@/stores/photoStore";
import { ImageEditor } from "@/components/ImageEditor";
import { Reveal } from "@/components/Reveal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MagnetMockup3D } from "@/components/MagnetMockup3D";
import { Switch } from "@/components/ui/switch";
import { reviewsApi, type ApiReview, rawMaterialsApi, type ApiRawMaterial } from "@/lib/api";

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
  const { photos, addPhotos, clearPhotos } = usePhotoStore();
  const { orderQuantity } = useSiteContentStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [previewZoom, setPreviewZoom] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [rawMaterials, setRawMaterials] = useState<ApiRawMaterial[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());

  const product = products.find((p) => p.id === id);
  const isEquipment = product?.category === "Equipment";
  const minQty = isEquipment ? 1 : (product?.minQuantity ?? orderQuantity.min ?? 4);
  const maxQty = isEquipment ? 999 : (product?.maxQuantity ?? orderQuantity.max ?? 12);
  const [qty, setQty] = useState(minQty);

  // Auto-open upload if user comes back from cart with photos that need more
  const cartItem = useCartStore.getState().items.find((i) => i.product.id === id);
  useEffect(() => {
    if (cartItem && product?.customizable && photos.length > 0 && photos.length < cartItem.quantity) {
      setQty(cartItem.quantity);
      setShowUploadSection(true);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    reviewsApi
      .getByProduct(id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !isEquipment) return;
    rawMaterialsApi
      .getByEquipment(id)
      .then(setRawMaterials)
      .catch(() => setRawMaterials([]));
  }, [id, isEquipment]);

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

  const uploadProcessFiles = async (accepted: File[]) => {
    const rem = (product ? qty : 0) - photos.length;
    if (rem <= 0) return;
    const toProcess = accepted.slice(0, rem);
    const validFiles: File[] = [];
    for (const file of toProcess) {
      if (file.size > MAX_FILE_SIZE) continue;
      const ext = file.name.toLowerCase().split(".").pop();
      if (!["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext || "")) continue;
      let pf = file;
      if (ext === "heic" || ext === "heif") {
        try {
          const heic2any = (await import("heic2any")).default;
          const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
          pf = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
        } catch { continue; }
      }
      validFiles.push(pf);
    }
    if (validFiles.length > 0) addPhotos(validFiles);
  };

  const uploadDropzone = useDropzone({
    onDrop: uploadProcessFiles,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"] },
    maxSize: MAX_FILE_SIZE,
    maxFiles: Math.max(0, qty - photos.length),
    disabled: photos.length >= qty,
    noClick: false,
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 sm:pt-32 sm:px-6 text-center">
          <h1 className="text-h2 text-foreground mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary hover:underline">← Back to Products</Link>
        </main>
      </div>
    );
  }

  const referenceImages = [product.image, ...(product.images || [])].slice(0, 4);
  const images = referenceImages.length ? referenceImages : [product.image];

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const toggleVariant = (variantKey: string) => {
    setSelectedVariants((prev) => {
      const next = new Set(prev);
      if (next.has(variantKey)) next.delete(variantKey);
      else next.add(variantKey);
      return next;
    });
  };

  const rawMaterialsTotal = rawMaterials.reduce((sum, rm) => {
    return sum + rm.variants.reduce((vs, v) => {
      return vs + (selectedVariants.has(`${rm.id}-${v.id}`) ? v.price : 0);
    }, 0);
  }, 0);

  const rawMaterialGroups = rawMaterials.reduce<Record<string, ApiRawMaterial[]>>((acc, rm) => {
    const g = rm.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(rm);
    return acc;
  }, {});

  const handleAdd = () => {
    addToCart(product, qty);
    if (isEquipment && selectedVariants.size > 0) {
      rawMaterials.forEach((rm) => {
        rm.variants.forEach((v) => {
          if (selectedVariants.has(`${rm.id}-${v.id}`)) {
            const rmProduct: Product = {
              id: `rm-${rm.id}-${v.id}`,
              name: `${rm.name} – ${v.label}`,
              description: `Raw material for ${product.name}`,
              price: v.price,
              image: product.image,
              category: "Raw Materials",
              rating: 0,
              reviews: 0,
              inStock: true,
            };
            addToCart(rmProduct, 1);
          }
        });
      });
    }
    const extras = selectedVariants.size > 0 ? ` + ${selectedVariants.size} raw material(s)` : "";
    toast({ title: "Added to cart!", description: `${qty}× ${product.name}${extras}` });
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    if (isEquipment && selectedVariants.size > 0) {
      rawMaterials.forEach((rm) => {
        rm.variants.forEach((v) => {
          if (selectedVariants.has(`${rm.id}-${v.id}`)) {
            const rmProduct: Product = {
              id: `rm-${rm.id}-${v.id}`,
              name: `${rm.name} – ${v.label}`,
              description: `Raw material for ${product.name}`,
              price: v.price,
              image: product.image,
              category: "Raw Materials",
              rating: 0,
              reviews: 0,
              inStock: true,
            };
            addToCart(rmProduct, 1);
          }
        });
      });
    }
    navigate("/cart");
  };

  const openUploadFlow = () => {
    clearPhotos();
    setShowUploadSection(true);
  };

  const handleAddToCartWithPhotos = () => {
    if (photos.length < qty) {
      toast({ title: "Upload all images", description: `Please upload ${qty} image${qty !== 1 ? "s" : ""} before adding to cart.`, variant: "destructive" });
      return;
    }
    const photosToStore = [...photos];
    const existingCartItem = useCartStore.getState().items.find((i) => i.product.id === product.id);
    if (existingCartItem) {
      addToCart(product, qty, photosToStore);
    } else {
      addToCart(product, qty, photosToStore);
    }
    clearPhotos();
    setShowUploadSection(false);
    toast({ title: existingCartItem ? "Cart updated!" : "Added to cart!", description: `${qty}× ${product.name} with your photos` });
    navigate("/cart");
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-6xl mx-auto">
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

              {/* Quantity — hidden for equipment */}
              {!isEquipment && (
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
              )}

              {/* Raw material checkboxes for equipment */}
              {isEquipment && rawMaterials.length > 0 && (
                <Reveal delay={200}>
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Add Raw Materials</p>
                    {Object.entries(rawMaterialGroups).map(([group, items]) => (
                      <div key={group} className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group}</p>
                        {items.map((rm) => (
                          <div key={rm.id} className="bg-muted/30 rounded-xl p-3 space-y-2">
                            <p className="text-sm font-medium text-foreground">{rm.name}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {rm.variants.map((v) => {
                                const key = `${rm.id}-${v.id}`;
                                const checked = selectedVariants.has(key);
                                return (
                                  <label
                                    key={v.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                                      checked
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                        : "border-border bg-card hover:border-primary/30"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleVariant(key)}
                                      className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                      checked ? "bg-primary border-primary" : "border-muted-foreground/30"
                                    }`}>
                                      {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm text-foreground">{v.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">Rs{v.price}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {selectedVariants.size > 0 && (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                        <span className="text-sm text-foreground">{selectedVariants.size} item{selectedVariants.size !== 1 ? "s" : ""} selected</span>
                        <span className="text-sm font-bold text-foreground">+ Rs{rawMaterialsTotal}</span>
                      </div>
                    )}
                  </div>
                </Reveal>
              )}

              {/* Social media consent — not shown for Equipment / machine products */}
              {product.category !== "Equipment" && (
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
              )}

              {/* Actions */}
              <Reveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.customizable ? (
                    <>
                      {!showUploadSection ? (
                        <motion.button
                          onClick={openUploadFlow}
                          disabled={!product.inStock}
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Upload className="w-4 h-4" /> Upload pictures
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={handleAddToCartWithPhotos}
                          disabled={!product.inStock || photos.length < qty}
                          className="flex-1 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart ({photos.length}/{qty})
                        </motion.button>
                      )}
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

              {/* Trust Badges */}
              <Reveal delay={260}>
                <div className="flex items-center justify-between pt-5 mt-2 border-t border-border">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <svg className="w-6 h-[18px]" viewBox="0 0 900 600" aria-label="Indian Flag">
                      <rect width="900" height="200" fill="#FF9933" />
                      <rect y="200" width="900" height="200" fill="#FFFFFF" />
                      <rect y="400" width="900" height="200" fill="#138808" />
                      <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" />
                      <circle cx="450" cy="300" r="8" fill="#000080" />
                      {Array.from({ length: 24 }).map((_, i) => (
                        <line key={i} x1="450" y1="300" x2={450 + 55 * Math.cos((i * 15 * Math.PI) / 180)} y2={300 + 55 * Math.sin((i * 15 * Math.PI) / 180)} stroke="#000080" strokeWidth="2" />
                      ))}
                    </svg>
                    <p className="text-xs font-semibold text-foreground">Made in India</p>
                    <p className="text-[10px] text-muted-foreground">Hyderabad</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <p className="text-xs font-semibold text-foreground">Satisfaction</p>
                    <p className="text-[10px] text-muted-foreground">100% Guaranteed</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Truck className="w-5 h-5 text-primary" />
                    <p className="text-xs font-semibold text-foreground">Fast Production</p>
                    <p className="text-[10px] text-muted-foreground">Ships in 24–48 hours</p>
                  </div>
                </div>
              </Reveal>

              {/* Full-screen Upload Step */}
              <AnimatePresence>
                {product.customizable && showUploadSection && (
                  <motion.div
                    className="fixed inset-0 z-[200] bg-background flex flex-col"
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" && !editingPhotoId) {
                        clearPhotos();
                        setShowUploadSection(false);
                      }
                    }}
                    tabIndex={0}
                    ref={(el) => el?.focus()}
                  >
                    {/* Top bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card shrink-0">
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={() => { clearPhotos(); setShowUploadSection(false); }}
                          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          whileTap={{ scale: 0.9 }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </motion.button>
                        <div>
                          <h2 className="font-display text-lg font-semibold text-foreground">Upload Your Photos</h2>
                          <p className="text-xs text-muted-foreground">
                            {photos.length}/{qty} uploaded
                            {photos.length > 0 && photos.length < qty && <span className="text-primary font-medium ml-1">• {qty - photos.length} more needed</span>}
                            {photos.length >= qty && <span className="text-green-600 font-medium ml-1">• All done!</span>}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={handleAddToCartWithPhotos}
                        disabled={photos.length < qty}
                        className="px-6 py-2.5 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        whileHover={photos.length >= qty ? { scale: 1.02 } : {}}
                        whileTap={photos.length >= qty ? { scale: 0.98 } : {}}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.button>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Drop zone */}
                      {photos.length < qty && (
                        <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
                          <div
                            {...uploadDropzone.getRootProps()}
                            className={`rounded-none border-2 border-dashed px-6 py-6 text-center cursor-pointer transition-all ${
                              uploadDropzone.isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"
                            }`}
                          >
                            <input {...uploadDropzone.getInputProps()} />
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">Drop photos here or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, HEIC • Max 20MB • {qty - photos.length} slot{qty - photos.length !== 1 ? "s" : ""} remaining</p>
                          </div>
                        </div>
                      )}

                      {/* Preview grid */}
                      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto">
                        <div className={`grid gap-4 ${qty <= 2 ? "grid-cols-2" : qty <= 4 ? "grid-cols-2 sm:grid-cols-4" : qty <= 6 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                          {Array.from({ length: qty }).map((_, idx) => {
                            const photo = photos[idx];
                            return (
                              <motion.div
                                key={idx}
                                className={`relative aspect-square rounded-none overflow-hidden transition-all ${
                                  photo ? "ring-2 ring-primary/30 shadow-lg" : "border-2 border-dashed border-border hover:border-primary/30 bg-muted/5"
                                }`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.04 }}
                              >
                                {photo ? (
                                  <>
                                    <img
                                      src={photo.preview}
                                      alt={`Image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      style={{
                                        filter: buildFilterString(photo.adjustments, photo.filter),
                                        transform: [
                                          photo.rotation ? `rotate(${photo.rotation}deg)` : "",
                                          photo.flipH ? "scaleX(-1)" : "",
                                          photo.flipV ? "scaleY(-1)" : "",
                                        ].filter(Boolean).join(" ") || undefined,
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                                    <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                                      {idx + 1}
                                    </span>

                                    <div className="absolute top-3 right-3 flex gap-2">
                                      <button
                                        onClick={() => setEditingPhotoId(photo.id)}
                                        className="w-8 h-8 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                                        title="Edit image"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => usePhotoStore.getState().removePhoto(photo.id)}
                                        className="w-8 h-8 rounded-full bg-black/50 hover:bg-destructive text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                                        title="Remove"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {photos.length < qty && (
                                      <button
                                        onClick={() => usePhotoStore.getState().addPhotos([photo.file])}
                                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-primary text-white text-xs font-medium backdrop-blur-sm transition-colors"
                                      >
                                        <Copy className="w-3 h-3" /> Fill next
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <div
                                    {...uploadDropzone.getRootProps()}
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2 hover:bg-muted/20 transition-colors"
                                  >
                                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                                      <Plus className="w-6 h-6 text-muted-foreground/40" />
                                    </div>
                                    <span className="text-sm text-muted-foreground/50 font-medium">Slot {idx + 1}</span>
                                    <span className="text-[10px] text-muted-foreground/30">Click or drop</span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Image Editor */}
                    {editingPhotoId && photos.find((p) => p.id === editingPhotoId) && (
                      <ImageEditor
                        key={editingPhotoId}
                        photo={photos.find((p) => p.id === editingPhotoId)!}
                        onSave={(updates) => {
                          usePhotoStore.getState().updatePhoto(editingPhotoId!, updates);
                          setEditingPhotoId(null);
                        }}
                        onClose={() => setEditingPhotoId(null)}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

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

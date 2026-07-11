import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore, Address as AddressType } from "@/stores/productStore";
import { usePhotoStore, buildFilterString } from "@/stores/photoStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { paymentsApi } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

function photoToDataUrl(photo: {
  file: File;
  adjustments: any;
  filter: string;
}): Promise<string> {
  const filterStr = buildFilterString(photo.adjustments, photo.filter);
  const needsCanvas = filterStr !== "none";

  // Preserve original bytes when no edits need re-encoding
  if (!needsCanvas) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(photo.file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Full resolution, maximum JPEG quality (no downscale)
      resolve(canvas.toDataURL("image/jpeg", 1));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(photo.file);
  });
}

const Address = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, socialMediaConsent, setSocialMediaConsent, appliedPromo } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useProductStore();
  const { clearPhotos } = usePhotoStore();
  const { toast } = useToast();
  const [placing, setPlacing] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    paymentsApi
      .getConfig()
      .then((c) => setPaymentsEnabled(!!c.enabled))
      .catch(() => setPaymentsEnabled(false));
  }, []);

  const [form, setForm] = useState<AddressType>({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const update = (key: keyof AddressType, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const finishAfterPrepaid = () => {
    clearCart();
    clearPhotos();
    toast({
      title: "Payment successful",
      description: "Your order is confirmed. You can track it under My Orders.",
    });
    navigate(user ? "/orders" : "/");
  };

  const placeOrderAfterPayment = async (
    customerPhotos: string[],
    razorpay: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  ) => {
    const ok = await addOrder({
      userId: user?.id || "guest",
      userName: user?.name || form.fullName || "Guest",
      items,
      total: total(),
      status: "pending",
      address: form,
      allowSocialMediaFeature: socialMediaConsent,
      customerPhotos,
      promoCode: appliedPromo?.code,
      paymentMethod: "online",
      razorpayOrderId: razorpay.razorpay_order_id,
      razorpayPaymentId: razorpay.razorpay_payment_id,
      razorpaySignature: razorpay.razorpay_signature,
    });
    if (!ok) {
      toast({
        title: "Order failed",
        description: "Payment succeeded but we could not save your order. Contact us with your payment ID from Razorpay.",
        variant: "destructive",
      });
      return false;
    }
    finishAfterPrepaid();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }
    if (!paymentsEnabled) {
      toast({
        title: "Payment unavailable",
        description: "Online payment is not configured. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    setPlacing(true);

    let customerPhotos: string[] = [];
    try {
      for (const item of items) {
        if (item.photos?.length) {
          const urls = await Promise.all(item.photos.map((p) => photoToDataUrl(p)));
          customerPhotos.push(...urls);
        }
      }
    } catch {
      // continue without photos if conversion fails
    }

    const lineItems = items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));

    try {
      const rzOrder = await paymentsApi.createRazorpayOrder({
        items: lineItems,
        promoCode: appliedPromo?.code,
      });
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        toast({ title: "Payment unavailable", description: "Could not load Razorpay. Check your connection.", variant: "destructive" });
        setPlacing(false);
        return;
      }
      const rzp = new window.Razorpay({
        key: rzOrder.keyId,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        order_id: rzOrder.orderId,
        name: "Magnetic Bliss in",
        description: "Custom photo magnets",
        prefill: {
          name: form.fullName,
          email: user?.email || "",
          contact: form.phone.replace(/\D/g, "").slice(-10) || form.phone,
        },
        theme: { color: "#db2777" },
        handler: (response) => {
          void (async () => {
            await placeOrderAfterPayment(customerPhotos, response);
            setPlacing(false);
          })();
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });
      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start payment";
      toast({ title: "Payment error", description: msg, variant: "destructive" });
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-5xl mx-auto">
        <h1 className="text-h1 text-foreground mb-2">Shipping Address</h1>
        <p className="text-muted-foreground mb-8 text-sm">Where should we deliver your magnets?</p>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="floating-label-group">
              <input type="text" placeholder=" " value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
              <label>Full Name</label>
            </div>
            <div className="floating-label-group">
              <input type="tel" placeholder=" " value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
              <label>Phone Number</label>
            </div>
            <div className="floating-label-group">
              <input type="text" placeholder=" " value={form.street} onChange={(e) => update("street", e.target.value)} required />
              <label>Street Address</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={form.city} onChange={(e) => update("city", e.target.value)} required />
                <label>City</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={form.state} onChange={(e) => update("state", e.target.value)} required />
                <label>State</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} required />
                <label>ZIP Code</label>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={form.country} onChange={(e) => update("country", e.target.value)} required />
                <label>Country</label>
              </div>
            </div>

            <p className="text-xs text-muted-foreground px-1">
              Payment is online only via Razorpay after you submit.
            </p>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border cursor-pointer">
              <Switch checked={socialMediaConsent} onCheckedChange={setSocialMediaConsent} />
              <span className="text-sm text-foreground">I agree to have my order featured in your social media content.</span>
            </label>

            <motion.button
              type="submit"
              disabled={placing || !paymentsEnabled}
              className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {placing
                ? "Opening payment..."
                : !paymentsEnabled
                  ? "Online payment unavailable"
                  : <>
                      Pay now — Rs{total().toFixed(2)}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>}
            </motion.button>
          </form>

          {/* Google Maps placeholder */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
              <div className="aspect-[4/5] bg-muted flex items-center justify-center relative">
                <iframe
                  title="Google Maps"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    [form.street, form.city, form.state, form.country].filter(Boolean).join(", ") || "Hyderabad, India"
                  )}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">{form.street || "Enter address to see on map"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Address;

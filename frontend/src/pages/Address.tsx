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
import { siteConfig } from "@/lib/siteConfig";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { paymentsApi } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

function photoToDataUrl(photo: { file: File; adjustments: any; filter: string }): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = buildFilterString(photo.adjustments, photo.filter);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
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
  /** When Razorpay is configured: COD (WhatsApp) vs pay online first. */
  const [paymentChoice, setPaymentChoice] = useState<"cod" | "online">("cod");

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

  const openWhatsAppCodAndClear = () => {
    const itemsList = items.map((item) => `${item.quantity}x ${item.product.name}`).join("\n");
    const addressStr = `${form.fullName}\n${form.street}, ${form.city}, ${form.state} ${form.zipCode}\n${form.country}\nPhone: ${form.phone}`;
    const message = `*New Order Placed!*\n\n*Payment:* Cash on Delivery (COD)\n\n*Items:*\n${itemsList}\n\n*Total:* Rs${total().toFixed(2)}\n\n*Shipping Address:*\n${addressStr}`;
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappDigits}?text=${encodeURIComponent(message)}`;
    clearCart();
    clearPhotos();
    toast({ title: "Order placed!", description: "Opening WhatsApp to confirm with us..." });
    window.open(whatsappUrl, "_blank");
    navigate(user ? "/orders" : "/");
  };

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
    opts: {
      paymentMethod: "cod" | "online";
      razorpay?: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
    }
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
      paymentMethod: opts.paymentMethod,
      razorpayOrderId: opts.razorpay?.razorpay_order_id,
      razorpayPaymentId: opts.razorpay?.razorpay_payment_id,
      razorpaySignature: opts.razorpay?.razorpay_signature,
    });
    if (!ok) {
      toast({
        title: "Order failed",
        description: opts.razorpay
          ? "Payment succeeded but we could not save your order. Contact us with your payment ID from Razorpay."
          : "Could not place order. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    if (opts.paymentMethod === "online") finishAfterPrepaid();
    else openWhatsAppCodAndClear();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
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

    if (paymentsEnabled && paymentChoice === "online") {
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
              await placeOrderAfterPayment(customerPhotos, { paymentMethod: "online", razorpay: response });
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
      return;
    }

    const ok = await placeOrderAfterPayment(customerPhotos, { paymentMethod: "cod" });
    setPlacing(false);
    if (!ok) return;
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

            {paymentsEnabled && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-sm font-medium text-foreground">How would you like to pay?</p>
                <RadioGroup
                  value={paymentChoice}
                  onValueChange={(v) => setPaymentChoice(v as "cod" | "online")}
                  className="grid gap-3"
                >
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-background/80 p-3 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                    <RadioGroupItem value="cod" id="pay-cod" className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="pay-cod" className="text-sm font-semibold text-foreground cursor-pointer">
                        Cash on Delivery (COD)
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Place the order now and pay when your package arrives. We&apos;ll open WhatsApp so you can confirm with us.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-background/80 p-3 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                    <RadioGroupItem value="online" id="pay-online" className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="pay-online" className="text-sm font-semibold text-foreground cursor-pointer">
                        Pay online now
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Secure payment with Razorpay. After success, you&apos;ll go to your orders — no WhatsApp step.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            <label className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border cursor-pointer">
              <Switch checked={socialMediaConsent} onCheckedChange={setSocialMediaConsent} />
              <span className="text-sm text-foreground">I agree to have my order featured in your social media content.</span>
            </label>

            <motion.button
              type="submit"
              disabled={placing}
              className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {placing
                ? paymentsEnabled && paymentChoice === "online"
                  ? "Opening payment..."
                  : "Placing order..."
                : <>
                    {paymentsEnabled && paymentChoice === "online"
                      ? "Pay now"
                      : paymentsEnabled
                        ? "Place order (COD)"
                        : "Place Order"}{" "}
                    — Rs{total().toFixed(2)}{" "}
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

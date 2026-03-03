import { useState } from "react";
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
  const { items, total, clearCart, socialMediaConsent, setSocialMediaConsent } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useProductStore();
  const { photos, clearPhotos } = usePhotoStore();
  const { toast } = useToast();
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState<AddressType>({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const update = (key: keyof AddressType, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast({ title: "Cart is empty", variant: "destructive" }); return; }
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to place an order.", variant: "destructive" });
      navigate("/login");
      return;
    }
    setPlacing(true);

    let customerPhotos: string[] = [];
    if (photos.length > 0) {
      try {
        customerPhotos = await Promise.all(photos.map((p) => photoToDataUrl(p)));
      } catch {
        // continue without photos if conversion fails
      }
    }

    const ok = await addOrder({
      userId: user.id,
      userName: user.name,
      items,
      total: total(),
      status: "pending",
      address: form,
      allowSocialMediaFeature: socialMediaConsent,
      customerPhotos,
    });
    setPlacing(false);
    if (!ok) {
      toast({ title: "Order failed", description: "Could not place order. Please try again.", variant: "destructive" });
      return;
    }

    const itemsList = items.map(item => `${item.quantity}x ${item.product.name}`).join("\n");
    const addressStr = `${form.fullName}\n${form.street}, ${form.city}, ${form.state} ${form.zipCode}\n${form.country}\nPhone: ${form.phone}`;
    const message = `*New Order Placed!*\n\n*Items:*\n${itemsList}\n\n*Total:* Rs${total().toFixed(2)}\n\n*Shipping Address:*\n${addressStr}`;
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappDigits}?text=${encodeURIComponent(message)}`;

    clearCart();
    clearPhotos();
    toast({ title: "Order placed!", description: "Taking you to WhatsApp to confirm..." });
    window.open(whatsappUrl, "_blank");
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-3xl mx-auto">
        <h1 className="text-h1 text-foreground mb-2">Shipping Address</h1>
        <p className="text-muted-foreground mb-8 text-sm">Where should we deliver your magnets?</p>

        <div className="grid lg:grid-cols-[1fr,300px] gap-8">
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
              {placing ? "Placing order..." : <>Place Order — Rs{total().toFixed(2)} <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          {/* Google Maps placeholder */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                <iframe
                  title="Google Maps"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                    [form.street, form.city, form.state, form.country].filter(Boolean).join(", ") || "New York"
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

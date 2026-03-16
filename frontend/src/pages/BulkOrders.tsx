import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Upload as UploadIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useToast } from "@/hooks/use-toast";
import { contactApi } from "@/lib/api";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { siteConfig } from "@/lib/siteConfig";

const BulkOrders = () => {
  const { bulkOrder } = useSiteContentStore();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    quantity: "50",
    file: null as File | null,
  });
  const [sending, setSending] = useState(false);

  const update = (key: string, val: string | File | null) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const message = [
        `Bulk Order Inquiry`,
        `Name: ${form.firstName} ${form.lastName}`,
        `Email: ${form.email}`,
        `Quantity: ${form.quantity} items`,
        form.file ? `Uploaded file: ${form.file.name}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      await contactApi.send({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        subject: "Bulk Order Inquiry",
        message,
      });
      toast({
        title: "Request sent!",
        description: "We'll be in touch with you shortly.",
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        quantity: "50",
        file: null,
      });
    } catch {
      toast({
        title: "Failed to send",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const price50 = bulkOrder.price50 ?? 0;
  const price100 = bulkOrder.price100 ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-2">{bulkOrder.title || "Wholesale Orders"}</h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-muted-foreground mb-2">{bulkOrder.subtitle || "Interested in bulk orders?"}</p>
          <p className="text-muted-foreground mb-8">{bulkOrder.formIntro || "Please fill out the form below and we will be in touch with you!"}</p>
        </Reveal>

        {/* Subcategories: 50 & 100 items with price — clickable to select */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Reveal delay={120}>
            <motion.button
              type="button"
              onClick={() => update("quantity", "50")}
              className={`w-full bg-card rounded-2xl p-5 shadow-card text-center transition-all duration-200 ${
                form.quantity === "50"
                  ? "border-2 border-primary ring-2 ring-primary/20"
                  : "border border-border hover:border-primary/40"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className={`w-8 h-8 mx-auto mb-2 ${form.quantity === "50" ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-display font-semibold text-foreground">50 items</h3>
              <p className={`text-2xl font-bold font-display mt-1 ${form.quantity === "50" ? "text-primary" : "text-muted-foreground"}`}>Rs {price50.toLocaleString()}</p>
            </motion.button>
          </Reveal>
          <Reveal delay={160}>
            <motion.button
              type="button"
              onClick={() => update("quantity", "100")}
              className={`w-full bg-card rounded-2xl p-5 shadow-card text-center transition-all duration-200 ${
                form.quantity === "100"
                  ? "border-2 border-primary ring-2 ring-primary/20"
                  : "border border-border hover:border-primary/40"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package className={`w-8 h-8 mx-auto mb-2 ${form.quantity === "100" ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-display font-semibold text-foreground">100 items</h3>
              <p className={`text-2xl font-bold font-display mt-1 ${form.quantity === "100" ? "text-primary" : "text-muted-foreground"}`}>Rs {price100.toLocaleString()}</p>
            </motion.button>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="floating-label-group">
                <input
                  type="text"
                  placeholder=" "
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
                <label>First name *</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="text"
                  placeholder=" "
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
                <label>Last name *</label>
              </div>
            </div>
            <div className="floating-label-group">
              <input
                type="email"
                placeholder=" "
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
              <label>Email *</label>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">How many magnets do you need? *</label>
              <select
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="50">50 items — Rs {price50.toLocaleString()}</option>
                <option value="100">100 items — Rs {price100.toLocaleString()}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Upload graphic you are looking to print</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => document.getElementById("bulk-file")?.click()}
              >
                <input
                  id="bulk-file"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => update("file", e.target.files?.[0] ?? null)}
                />
                <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Browse Files</p>
                {form.file && (
                  <p className="text-xs text-primary mt-1">{form.file.name}</p>
                )}
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-70"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {sending ? "Sending..." : "Submit"}
            </motion.button>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <motion.a
              href={`https://wa.me/${siteConfig.whatsappDigits}?text=${encodeURIComponent(`Hi! I'm interested in a bulk order of ${form.quantity} magnets. Can you share more details?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[hsl(142,70%,45%)] text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </motion.a>
          </form>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
};

export default BulkOrders;

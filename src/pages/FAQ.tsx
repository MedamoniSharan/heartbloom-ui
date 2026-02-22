import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does shipping take?", a: "Standard shipping takes 5–7 business days within the US. Express shipping (2–3 days) is available at checkout. International orders typically take 10–14 business days." },
      { q: "Can I track my order?", a: "Yes! Once your order ships, you'll receive an email with a tracking number. You can also check your order status in the Orders section of your account." },
      { q: "Do you ship internationally?", a: "We currently ship to the US, Canada, UK, and most EU countries. We're expanding to more regions soon!" },
      { q: "What is your return policy?", a: "Since all magnets are custom-made, we can't accept returns. However, if your order arrives damaged or there's a printing error, we'll replace it for free within 30 days." },
    ],
  },
  {
    category: "Products & Quality",
    items: [
      { q: "What size are the magnets?", a: "Our standard magnets are 3\" × 3\" (7.6cm × 7.6cm). We also offer 2\" × 2\" mini magnets and 4\" × 4\" large magnets depending on the product." },
      { q: "Are the magnets waterproof?", a: "Our magnets have a laminated finish that's water-resistant, making them perfect for fridges. However, they're not designed for prolonged water exposure." },
      { q: "What photo formats do you accept?", a: "We accept JPEG, PNG, WebP, and HEIC formats. For best results, use high-resolution images (at least 1000 × 1000 pixels)." },
      { q: "How strong are the magnets?", a: "Our magnets use premium neodymium backing that holds firmly to any magnetic surface. They're strong enough to hold a few sheets of paper." },
    ],
  },
  {
    category: "Pricing & Payments",
    items: [
      { q: "Do you offer bulk discounts?", a: "Yes! Check out our Events page for wedding, birthday, and corporate packs with volume discounts up to 35% off." },
      { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and PayPal." },
      { q: "Do you offer subscriptions?", a: "Yes! Our subscription plans offer monthly magnet deliveries at a discounted rate. You can customize your plan and cancel anytime." },
    ],
  },
  {
    category: "Account & Support",
    items: [
      { q: "How do I create an account?", a: "Click 'Sign In' in the top right corner and select 'Create Account'. You can sign up with your email address." },
      { q: "How do I contact support?", a: "You can reach us through our Contact page, email us at hello@heartprinted.com, or chat with us on WhatsApp during business hours." },
      { q: "Can I edit my photos after uploading?", a: "Yes! Our built-in image editor lets you crop, rotate, adjust brightness/contrast, and apply filters before ordering." },
    ],
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 px-6 pb-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-3">Frequently Asked Questions</h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know about HeartPrinted. Can't find what you're looking for? Contact us!
          </p>
        </Reveal>
      </div>

      <div className="space-y-10">
        {FAQS.map((section, si) => (
          <Reveal key={section.category} delay={si * 80}>
            <div>
              <h2 className="font-display font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FAQItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default FAQ;

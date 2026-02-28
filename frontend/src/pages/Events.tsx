import { motion } from "framer-motion";
import { Heart, Gift, Building2, PartyPopper, ShoppingCart, Star, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";
import type { Product } from "@/stores/productStore";

interface EventPack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Heart;
  image: string;
  qty: number;
  pricePerUnit: number;
  totalPrice: number;
  savings: number;
  features: string[];
  color: string;
}

const EVENT_PACKS: EventPack[] = [
  {
    id: "evt-wedding",
    name: "Wedding Favor Pack",
    tagline: "Make your big day unforgettable",
    description: "Beautiful custom photo magnets for wedding guests. Each magnet features your favorite couple photo — a keepsake guests will treasure forever.",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    qty: 50,
    pricePerUnit: 1.49,
    totalPrice: 74.50,
    savings: 50,
    features: ["50 custom magnets", "Free design assistance", "Elegant packaging", "Bulk shipping discount"],
    color: "from-pink to-pink-dark",
  },
  {
    id: "evt-birthday",
    name: "Birthday Party Pack",
    tagline: "Party favors they'll actually keep",
    description: "Fun, colorful photo magnets perfect for birthday party goody bags. Upload group photos, silly faces, or themed designs.",
    icon: PartyPopper,
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
    qty: 25,
    pricePerUnit: 1.79,
    totalPrice: 44.75,
    savings: 30,
    features: ["25 custom magnets", "Fun design templates", "Individual wrapping available", "Fast turnaround"],
    color: "from-warning to-[hsl(25,90%,50%)]",
  },
  {
    id: "evt-corporate",
    name: "Corporate Gift Pack",
    tagline: "Branded gifts clients remember",
    description: "Professional branded magnets for conferences, client gifts, and team events. Add your logo, team photos, or motivational messages.",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    qty: 100,
    pricePerUnit: 1.19,
    totalPrice: 119.00,
    savings: 130,
    features: ["100 branded magnets", "Logo placement included", "Premium matte finish", "Custom packaging"],
    color: "from-secondary to-navy-light",
  },
  {
    id: "evt-baby",
    name: "Baby Shower Pack",
    tagline: "Tiny moments, big memories",
    description: "Adorable magnets featuring ultrasound images, baby milestones, or nursery themes. Perfect shower favors for guests.",
    icon: Gift,
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop",
    qty: 30,
    pricePerUnit: 1.59,
    totalPrice: 47.70,
    savings: 35,
    features: ["30 custom magnets", "Pastel design themes", "Gift-ready packaging", "Personalized text"],
    color: "from-[hsl(200,80%,60%)] to-[hsl(260,70%,60%)]",
  },
];

const Events = () => {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddPack = (pack: EventPack) => {
    const product: Product = {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      price: pack.totalPrice,
      image: pack.image,
      category: "Event Packs",
      rating: 4.9,
      reviews: 0,
      inStock: true,
    };
    addToCart(product);
    toast({ title: "Pack added to cart!", description: `${pack.name} — ${pack.qty} magnets` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-14">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <PartyPopper className="w-3.5 h-3.5" /> Bulk Orders & Events
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-hero text-foreground mb-3">Magnets for Every<br /><span className="text-gradient-pink">Special Occasion</span></h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Wedding favors, birthday party packs, corporate gifts — volume discounts that make celebrations magnetic.
            </p>
          </Reveal>
        </div>

        {/* Packs Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {EVENT_PACKS.map((pack, i) => {
            const Icon = pack.icon;
            return (
              <Reveal key={pack.id} delay={i * 80}>
                <motion.div
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group hover:shadow-elevated transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={pack.image} alt={pack.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pack.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-primary-foreground font-display font-bold text-lg">{pack.name}</h3>
                        <p className="text-primary-foreground/80 text-xs">{pack.tagline}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-bold">
                      Save Rs{pack.savings}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">{pack.description}</p>

                    <ul className="space-y-2">
                      {pack.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-end justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-2xl font-bold text-foreground font-display">Rs{pack.totalPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Rs{pack.pricePerUnit}/magnet · {pack.qty} magnets</p>
                      </div>
                      <motion.button
                        onClick={() => handleAddPack(pack)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium glow-pink-sm flex items-center gap-2"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Custom inquiry */}
        <Reveal>
          <div className="text-center bg-card border border-border rounded-2xl p-10 shadow-card">
            <h2 className="text-h2 text-foreground mb-3">Need a Custom Pack?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Planning something unique? We create custom event packs for any size or occasion. Get in touch for a personalized quote.
            </p>
            <Link
              to="/contact"
              className="inline-flex px-8 py-3.5 rounded-2xl bg-gradient-pink text-primary-foreground font-medium glow-pink-sm"
            >
              Contact Us for Custom Orders
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
};

export default Events;

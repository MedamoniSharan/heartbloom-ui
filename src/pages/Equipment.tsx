import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import equipmentMpro from "@/assets/equipment-mpro.png";
import equipmentTitan from "@/assets/equipment-titan.jpg";
import logoMpro from "@/assets/logo-mpro.png";
import logoTitan from "@/assets/logo-titan.png";

const equipment = [
  {
    name: "MPRO Square Kit 2 x 2\"",
    logo: logoMpro,
    image: equipmentMpro,
    buyLink: "https://mprousa.com/products/starter-kit-magnet-maker-square-2x2?utm_source=heartprinted&utm_medium=referral&utm_campaign=hp-crossshop",
    specs: [
      { label: "Price", value: "From $2,225" },
      { label: "Origin", value: "USA" },
      { label: "Lead Time", value: "In Stock" },
      { label: "Warranty", value: "Lifetime" },
      { label: "Max Paper Thickness", value: "32 lb" },
      { label: "Service", value: "Service & Support in the USA" },
    ],
  },
  {
    name: "Titan Press Square Kit 2 x 2\"",
    logo: logoTitan,
    image: equipmentTitan,
    buyLink: "https://titanpress.co/products/2-x-2-square-button-making-bundle?utm_source=heartprinted&utm_medium=referral&utm_campaign=hp-crossshop",
    specs: [
      { label: "Price", value: "From $1,650" },
      { label: "Origin", value: "China, Designed in USA" },
      { label: "Lead Time", value: "In Stock" },
      { label: "Warranty", value: "Lifetime" },
      { label: "Max Paper Thickness", value: "42 lb" },
      { label: "Service", value: "Service & Support in the USA" },
    ],
  },
];

const Equipment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-6 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <h1 className="text-h1 text-foreground mb-3">Want to do the same?</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground max-w-md mx-auto">
              Here are some equipment options for you.
            </p>
          </Reveal>
        </div>

        {/* Equipment Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {equipment.map((item, i) => (
            <Reveal key={item.name} delay={i * 120}>
              <motion.div
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card group"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Brand Logo */}
                <div className="flex items-center justify-center py-5 border-b border-border bg-muted/30">
                  <img src={item.logo} alt={item.name + " logo"} className="h-8 object-contain" />
                </div>

                {/* Product Image */}
                <div className="aspect-[5/4] overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-display font-bold text-foreground text-lg mb-4 text-center">{item.name}</h3>

                  {/* Specs Table */}
                  <div className="space-y-0 mb-6">
                    {item.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0"
                      >
                        <span className="text-sm font-semibold text-foreground">{spec.label}</span>
                        <span className="text-sm text-muted-foreground text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.a
                    href={item.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-semibold text-sm glow-pink-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    BUY EQUIPMENT <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;

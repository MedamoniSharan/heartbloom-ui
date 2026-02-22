import { motion } from "framer-motion";
import { Heart, ShieldCheck, Truck, Star } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Upload Your Photos",
    description: "Choose up to 9 of your favorite memories from any device.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Customize & Edit",
    description: "Crop, filter, and arrange your photos on premium magnets.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Premium Quality Print",
    description: "We print your photos on thick, vivid, water-resistant magnets.",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Delivered to Your Door",
    description: "Fast shipping in eco-friendly packaging. Gift-ready.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="text-h1 text-center text-foreground mb-4">
            How It Works
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
            From your phone to your fridge in four simple steps.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <Reveal key={i} delay={150 + i * 100}>
              <motion.div
                className="relative p-6 rounded-2xl bg-background shadow-card group"
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="text-xs font-body font-medium text-muted-foreground mb-2">
                  Step {i + 1}
                </div>
                <h3 className="font-display text-h3 text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

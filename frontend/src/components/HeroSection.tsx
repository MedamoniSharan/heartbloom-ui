import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { StatCounter } from "./StatCounter";
import { Reveal } from "./Reveal";
import { useSiteContentStore } from "@/stores/siteContentStore";
import defaultHeroImage from "@/assets/hero-magnets.jpg";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

interface HeroSectionProps {
  onUploadClick?: () => void;
}

export const HeroSection = ({ onUploadClick }: HeroSectionProps) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -60]);
  const imageY = useTransform(scrollY, [0, 600], [0, -36]);
  const { heroStats } = useSiteContentStore();
  const customHeroSrc = (heroStats.heroImageUrl ?? "").trim();
  const heroSrc = customHeroSrc || defaultHeroImage;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        style={{ y: useTransform(scrollY, [0, 600], [0, -80]) }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-pink-light/5 blur-3xl"
        style={{ y: useTransform(scrollY, [0, 600], [0, 40]) }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            style={{ y: heroY }}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="w-3.5 h-3.5 fill-primary" />
                Turn Memories Into Magnets
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-hero text-foreground mb-2">
              Your Photos,
            </motion.h1>
            <motion.h1 variants={fadeUp} className="text-hero text-gradient-pink mb-2">
              Printed on
            </motion.h1>
            <motion.h1 variants={fadeUp} className="text-hero text-foreground mb-6">
              Premium Magnets
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed"
            >
              Upload your favorite photos and get them printed as beautiful, 
              high-quality fridge magnets. The perfect gift for anyone.
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 sm:gap-8 mb-8 sm:mb-10">
              <StatCounter target={heroStats.happyCustomers} suffix="+" label="Happy Customers" />
              <StatCounter target={heroStats.magnetsPrinted} suffix="+" label="Magnets Printed" />
              <StatCounter target={heroStats.avgRating} suffix="" label="Average Rating" />
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-3 sm:gap-4"
            >
              <motion.button
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm sm:text-base glow-pink"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={onUploadClick}
                data-magnetic
              >
                Create Your Magnets
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="inline-flex items-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl border border-border text-foreground font-medium text-sm sm:text-base hover:bg-muted transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                See Examples
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            style={{ y: imageY }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src={heroSrc}
                  alt="Custom photo magnets — hero showcase"
                  className="w-full h-auto object-cover min-h-[200px] bg-muted"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl bg-card shadow-card border border-border"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Premium Quality</p>
                    <p className="text-[10px] text-muted-foreground">Thick & Waterproof</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

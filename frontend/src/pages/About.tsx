import { motion } from "framer-motion";
import { Heart, Users, Award, Globe, Sparkles, Package } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const VALUES = [
  { icon: Heart, title: "Made with Love", desc: "Every magnet is crafted with care, turning your favorite memories into keepsakes you'll treasure forever." },
  { icon: Award, title: "Premium Quality", desc: "We use only the finest materials — vibrant inks, durable magnets, and a finish that lasts for years." },
  { icon: Globe, title: "Eco-Friendly", desc: "Our packaging is 100% recyclable and our inks are water-based, because the planet matters." },
  { icon: Users, title: "Community First", desc: "Over 70,000 happy customers and counting. We're building a community of memory-makers." },
];

const TIMELINE = [
  { year: "2021", title: "The Spark", desc: "Magnetic Bliss India started in a small studio with a single magnet printer and a big dream." },
  { year: "2022", title: "Growing Fast", desc: "10,000 orders shipped. We moved to a proper studio and expanded our product line." },
  { year: "2023", title: "Going Viral", desc: "Featured on social media, our customer gallery exploded. 50K+ magnets delivered worldwide." },
  { year: "2024", title: "Premium Launch", desc: "Introduced pro-grade equipment, event packs, and subscription plans." },
  { year: "2025", title: "Community", desc: "Launched the Wall of Love gallery and hit 70K+ happy customers." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 px-6 pb-16 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-4">About Magnetic Bliss India</h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-muted-foreground max-w-lg mx-auto text-body">
            We believe every photo tells a story — and the best stories deserve to live beyond your phone screen. Magnetic Bliss India turns your favorite moments into beautiful, tangible magnets.
          </p>
        </Reveal>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 gap-5 mb-20">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delay={i * 80}>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1.5">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Timeline */}
      <Reveal>
        <h2 className="text-h2 text-foreground text-center mb-10">Our Journey</h2>
      </Reveal>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {TIMELINE.map((t, i) => (
          <Reveal key={t.year} delay={i * 100}>
            <div className="relative pl-12 pb-10 last:pb-0">
              <div className="absolute left-0 w-9 h-9 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary">{t.year}</span>
              <h3 className="font-display font-semibold text-foreground mt-0.5">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <Reveal delay={200}>
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-medium text-sm">
            <Package className="w-4 h-4" />
            Ready to print your memories? Start your first order today!
          </div>
        </div>
      </Reveal>
    </main>
    <Footer />
  </div>
);

export default About;

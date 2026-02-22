import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/siteConfig";

export const Footer = () => (
  <footer className="py-12 px-6 bg-card border-t border-border">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        {siteConfig.logoUrl ? (
          <img src={siteConfig.logoUrl} alt="Magnetic Bliss India" className="h-8 w-auto object-contain" />
        ) : (
          <Heart className="w-5 h-5 text-primary fill-primary" />
        )}
        <span className="font-display text-lg font-bold text-foreground">Magnetic Bliss India</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <a href={siteConfig.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Website</a>
        <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
        <a href={`https://wa.me/${siteConfig.whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{siteConfig.phone}</a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 Magnetic Bliss India. All rights reserved.</p>
    </div>
  </footer>
);

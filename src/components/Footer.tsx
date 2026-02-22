import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="py-12 px-6 bg-card border-t border-border">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary fill-primary" />
        <span className="font-display text-lg font-bold text-foreground">HeartPrinted</span>
      </div>
      <div className="flex gap-8 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 HeartPrinted. All rights reserved.</p>
    </div>
  </footer>
);

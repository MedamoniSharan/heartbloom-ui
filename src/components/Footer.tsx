import { Heart } from "lucide-react";

export const Footer = () => (
  <footer className="py-12 px-6 bg-card border-t border-border">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary fill-primary" />
        <span className="font-display text-lg font-bold text-foreground">HeartPrinted</span>
      </div>
      <div className="flex gap-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">About</a>
        <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 HeartPrinted. All rights reserved.</p>
    </div>
  </footer>
);

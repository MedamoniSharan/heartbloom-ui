import { Heart, MapPin, Phone, Mail, Instagram, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { siteConfig } from "@/lib/siteConfig";

const quickLinks = [
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/products", label: "Products" },
  { to: "/privacy", label: "Privacy" },
] as const;

export const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="max-w-6xl mx-auto px-6 py-14">
      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            {siteConfig.logoUrl ? (
              <img src={siteConfig.logoUrl} alt="Magnetic Bliss India" className="h-9 w-auto object-contain" />
            ) : (
              <Heart className="w-7 h-7 text-primary fill-primary" />
            )}
            <span className="font-display text-xl font-bold text-foreground">Magnetic Bliss India</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Custom photo magnets & gifts. Bringing your moments to life, one magnet at a time.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
            Quick links
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={siteConfig.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
            Contact
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{siteConfig.location}</span>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.whatsappDigits}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{siteConfig.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{siteConfig.email}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* CTA + Social */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-4">
            Get in touch
          </h3>
          <a
            href={`https://wa.me/${siteConfig.whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity mb-4"
          >
            <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" /> Follow on Instagram
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground order-2 sm:order-1">
          © {new Date().getFullYear()} Magnetic Bliss India. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground order-1 sm:order-2">
          Developed by <span className="font-medium text-foreground">Optiwebrix Team</span>
        </p>
        <p className="text-xs text-muted-foreground order-3">
          Beeramguda, Hyderabad
        </p>
      </div>
    </div>
  </footer>
);

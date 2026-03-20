/**
 * Magnetic Bliss in – business info (single source of truth).
 * Update logoUrl when the logo asset is available.
 */
export const siteConfig = {
  /** Location / area (no full street address – residential). */
  location: "Beeramguda, Hyderabad, Telangana - 502032",
  /** Query for Google Maps embed. */
  mapQuery: "Beeramguda, Hyderabad Telangana",
  /** Contact phone (display format). */
  phone: "+91-9493498910",
  /** WhatsApp: same as contact. Use digits only for wa.me links (no + or -). */
  whatsappDigits: "919493498910",
  /** Instagram profile URL. */
  instagram: "https://www.instagram.com/magnetic_bliss.in?igsh=bmVpZmFheTI3NHVy",
  /** Main website. */
  website: "https://www.magneticbliss.in",
  /** Contact email (optional). */
  email: "magneticblissin@gmail.com",
  /** Logo image URL – file in public/ is served at root. */
  logoUrl: "/Logo Image.png",
} as const;

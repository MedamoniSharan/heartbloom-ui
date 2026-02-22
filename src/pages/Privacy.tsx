import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `When you use HeartPrinted, we collect information you provide directly, including your name, email address, shipping address, and payment information. We also collect photos you upload for printing. We use cookies and similar technologies to improve your experience and analyze site traffic.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your personal information to process and fulfill your orders, communicate about your orders, send promotional communications (with your consent), improve our products and services, and comply with legal obligations. Your uploaded photos are used solely for creating your custom magnets and are not shared with third parties.`,
  },
  {
    title: "Photo Data & Storage",
    content: `Photos you upload are stored securely on our servers for order processing. After your order is fulfilled, photos are retained for 90 days to handle any quality issues or reprints, then permanently deleted. We never use your photos for marketing or share them without your explicit consent.`,
  },
  {
    title: "Sharing Your Information",
    content: `We share your information only with trusted service providers who assist in operating our business: payment processors (Stripe), shipping carriers, and cloud hosting providers. We never sell your personal information to third parties.`,
  },
  {
    title: "Cookies & Tracking",
    content: `We use essential cookies for site functionality and optional analytics cookies to understand how visitors use our site. You can control cookie preferences through your browser settings. We use privacy-friendly analytics that don't track you across websites.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to access, correct, or delete your personal information at any time. You can also opt out of promotional emails, request a copy of your data, or ask us to stop processing your information. Contact us at privacy@heartprinted.com to exercise these rights.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits. Your payment information is never stored on our servers — it's handled directly by our PCI-compliant payment processor.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this privacy policy from time to time. We'll notify you of significant changes via email or a notice on our website. Your continued use of HeartPrinted after changes constitutes acceptance of the updated policy.`,
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 px-6 pb-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-3">Privacy Policy</h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-muted-foreground text-sm">Last updated: February 2026</p>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          At HeartPrinted, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our website and services.
        </p>
      </Reveal>

      <div className="space-y-8">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={i * 60}>
            <section>
              <h2 className="font-display font-semibold text-foreground text-lg mb-2">{i + 1}. {s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal delay={400}>
        <div className="mt-12 p-5 bg-card border border-border rounded-2xl">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Questions?</strong> Contact our privacy team at{" "}
            <a href="mailto:privacy@heartprinted.com" className="text-primary hover:underline">
              privacy@heartprinted.com
            </a>
          </p>
        </div>
      </Reveal>
    </main>
    <Footer />
  </div>
);

export default Privacy;

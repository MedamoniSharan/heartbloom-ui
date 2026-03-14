import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/siteConfig";

const SECTIONS = [
  {
    title: "Overview",
    content: `At Magnetic Bliss India, we want you to be completely satisfied with your custom photo magnets and gifts. This Refund & Cancellation Policy explains how we handle refunds, replacements, and cancellations. All payments are processed securely through Razorpay.`,
  },
  {
    title: "Custom Products – No Returns",
    content: `Because our magnets are made to order with your personal photos and customisations, we generally do not accept returns. Each product is unique to you. Please review your design and order details carefully before confirming payment.`,
  },
  {
    title: "Refunds We Do Offer",
    content: `We will issue a full refund or replacement in these cases: (1) Your order arrived damaged or defective — please contact us within 7 days with photos. (2) We sent the wrong product or a printing/quality error on our side. (3) Your order was cancelled by us (e.g. unable to fulfil). Refunds will be processed to the same payment method used at purchase, within 7–10 business days after we approve the refund.`,
  },
  {
    title: "Cancellations",
    content: `You may cancel your order only if it has not yet been sent to production. Once production has started, we cannot cancel. To request a cancellation, contact us at ${siteConfig.email} or via WhatsApp as soon as possible with your order number. If we can cancel in time, a full refund will be processed via Razorpay.`,
  },
  {
    title: "Refund Processing",
    content: `Refunds are processed through Razorpay. The amount will be credited to the same card, UPI, net banking, or wallet you used. Depending on your bank or payment method, it may take 5–10 business days for the credit to appear. We do not control this timeline.`,
  },
  {
    title: "Contact for Refunds & Issues",
    content: `For any refund, replacement, or order issue, contact us at ${siteConfig.email} or WhatsApp ${siteConfig.phone} with your order number and details. We will respond within 24–48 hours and work with you to resolve the matter.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Refund & Cancellation Policy from time to time. The "Last updated" date at the top of this page will reflect the latest version. Your use of our site and services after changes constitutes acceptance of the updated policy.`,
  },
];

const Refunds = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-3">Refund & Cancellation Policy</h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-muted-foreground text-sm">Last updated: March 2026</p>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          We are committed to fair and transparent refund and cancellation practices. Please read this policy before placing an order.
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
            <strong className="text-foreground">Questions?</strong> Contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">
              {siteConfig.email}
            </a>
            {" "}or WhatsApp{" "}
            <a href={`https://wa.me/${siteConfig.whatsappDigits}`} className="text-primary hover:underline">
              {siteConfig.phone}
            </a>
            .
          </p>
        </div>
      </Reveal>
    </main>
    <Footer />
  </div>
);

export default Refunds;

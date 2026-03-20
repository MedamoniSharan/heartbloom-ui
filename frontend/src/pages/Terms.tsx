import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/siteConfig";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using the Magnetic Bliss in website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our site or place orders. We reserve the right to update these terms; the "Last updated" date below indicates the latest version.`,
  },
  {
    title: "Use of Our Services",
    content: `You may use our website to browse products, place orders for custom photo magnets and gifts, create an account, and contact us. You must provide accurate information and be at least 18 years of age (or have parental consent) to place orders. You may not use our site for any illegal purpose, to upload content you do not have rights to, or to harm our systems or other users.`,
  },
  {
    title: "Orders & Payment",
    content: `All orders are subject to availability and acceptance. We use Razorpay for secure payment processing. By placing an order, you agree to pay the stated price including applicable taxes and shipping. Prices are in Indian Rupees (INR). We reserve the right to refuse or cancel orders in case of errors, fraud, or inability to fulfil.`,
  },
  {
    title: "Intellectual Property & Your Content",
    content: `You retain ownership of the photos and content you upload. By uploading, you grant us a licence to use that content only to create and fulfil your order and to provide our services. Our brand name, logo, website design, and other materials are owned by Magnetic Bliss in and may not be copied or used without permission.`,
  },
  {
    title: "Shipping & Delivery",
    content: `We ship across India. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery to the carrier. You are responsible for providing a correct shipping address. We are not liable for delays or failures due to courier or force majeure (e.g. natural disasters, strikes).`,
  },
  {
    title: "Refunds & Cancellations",
    content: `Our Refund & Cancellation Policy applies to all orders. Please read it at the dedicated Refund Policy page. Custom products are generally non-returnable; refunds or replacements are offered in the circumstances described in that policy.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, Magnetic Bliss in and its team shall not be liable for any indirect, incidental, or consequential damages arising from your use of our site or products. Our total liability for any claim related to an order shall not exceed the amount you paid for that order.`,
  },
  {
    title: "Governing Law & Disputes",
    content: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana. For any concerns, we encourage you to contact us first at ${siteConfig.email}.`,
  },
  {
    title: "Contact",
    content: `For questions about these Terms of Service, contact us at ${siteConfig.email}, WhatsApp ${siteConfig.phone}, or visit our Contact page.`,
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-3">Terms of Service</h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-muted-foreground text-sm">Last updated: March 2026</p>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Please read these Terms of Service carefully before using Magnetic Bliss in. By using our website and services, you agree to these terms.
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
            {" "}or{" "}
            <a href={`https://wa.me/${siteConfig.whatsappDigits}`} className="text-primary hover:underline">
              WhatsApp
            </a>
            .
          </p>
        </div>
      </Reveal>
    </main>
    <Footer />
  </div>
);

export default Terms;

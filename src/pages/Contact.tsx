import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Heart, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useToast } from "@/hooks/use-toast";

const BUSINESS_INFO = {
  address: "123 Creative Way, Brooklyn, NY 11201",
  phone: "+1 (555) 123-4567",
  email: "hello@magneticbliss.in",
  hours: "Mon – Fri: 9AM – 6PM EST",
  whatsapp: "1234567890",
};

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent! ✉️", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <h1 className="text-h1 text-foreground mb-3">Contact Us</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-muted-foreground max-w-md mx-auto">
              Have a question about your order or need help with a custom design? We'd love to hear from you.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form — spans 3 cols */}
          <div className="lg:col-span-3">
            <Reveal>
              <form
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="floating-label-group">
                    <input type="text" placeholder=" " value={form.name} onChange={(e) => update("name", e.target.value)} required />
                    <label>Your Name</label>
                  </div>
                  <div className="floating-label-group">
                    <input type="email" placeholder=" " value={form.email} onChange={(e) => update("email", e.target.value)} required />
                    <label>Email Address</label>
                  </div>
                </div>
                <div className="floating-label-group">
                  <input type="text" placeholder=" " value={form.subject} onChange={(e) => update("subject", e.target.value)} required />
                  <label>Subject</label>
                </div>
                <div className="floating-label-group">
                  <textarea placeholder=" " rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} required />
                  <label>Message</label>
                </div>

                <motion.button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                      Sending...
                    </span>
                  ) : (
                    <>Send Message <Send className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
            </Reveal>
          </div>

          {/* Sidebar — spans 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Info Cards */}
            <Reveal delay={100}>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
                <h3 className="font-display font-semibold text-foreground text-sm">Business Info</h3>
                {[
                  { icon: MapPin, label: "Address", value: BUSINESS_INFO.address },
                  { icon: Phone, label: "Phone", value: BUSINESS_INFO.phone },
                  { icon: Mail, label: "Email", value: BUSINESS_INFO.email },
                  { icon: Clock, label: "Hours", value: BUSINESS_INFO.hours },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm text-foreground font-medium">{value}</p>
                    </div>
                  </div>
                ))}

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent("Hi! I have a question about Magnetic Bliss India products.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[hsl(142,70%,45%)] text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity mt-2"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </Reveal>

            {/* Google Map */}
            <Reveal delay={200}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="aspect-video relative">
                  <iframe
                    title="Magnetic Bliss India Location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="p-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{BUSINESS_INFO.address}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

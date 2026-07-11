import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Calendar, Users, Play, GraduationCap, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { coursesApi, paymentsApi, type CourseOfferKey } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

const Courses = () => {
  const { courses, setCourses } = useSiteContentStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [paying, setPaying] = useState<CourseOfferKey | null>(null);
  const [buyer, setBuyer] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
  });

  useEffect(() => {
    coursesApi
      .get()
      .then(setCourses)
      .catch(() => {});
    paymentsApi
      .getConfig()
      .then((c) => setPaymentsEnabled(!!c.enabled))
      .catch(() => setPaymentsEnabled(false));
  }, [setCourses]);

  useEffect(() => {
    if (user) {
      setBuyer((b) => ({
        ...b,
        fullName: b.fullName || user.name || "",
        email: b.email || user.email || "",
      }));
    }
  }, [user]);

  const embedUrl = getYoutubeEmbedUrl(courses.youtubeUrl);
  const offers: {
    key: CourseOfferKey;
    label: string;
    description: string;
    points: string[];
    price: number;
    scheduleUrl: string;
    icon: typeof Calendar;
  }[] = [
    {
      key: "book1to1",
      label: courses.book1to1Label || "Book 1:1 Session",
      description: courses.book1to1Description || "One-on-one with our expert",
      points: courses.book1to1Points ?? [],
      price: courses.book1to1Price ?? 0,
      scheduleUrl: courses.book1to1Url || "",
      icon: Calendar,
    },
    {
      key: "bookGroup",
      label: courses.bookGroupLabel || "Book Group Session",
      description: courses.bookGroupDescription || "Join a group workshop",
      points: courses.bookGroupPoints ?? [],
      price: courses.bookGroupPrice ?? 0,
      scheduleUrl: courses.bookGroupUrl || "",
      icon: Users,
    },
  ];

  const visibleOffers = offers;

  const handlePay = async (offerKey: CourseOfferKey) => {
    const offer = offers.find((o) => o.key === offerKey);
    if (!offer || offer.price <= 0) return;

    if (!buyer.fullName.trim() || !buyer.phone.trim()) {
      toast({
        title: "Details needed",
        description: "Please enter your name and phone before paying.",
        variant: "destructive",
      });
      return;
    }
    if (!paymentsEnabled) {
      toast({
        title: "Payment unavailable",
        description: "Online payment is not configured yet.",
        variant: "destructive",
      });
      return;
    }

    setPaying(offerKey);
    try {
      const rzOrder = await coursesApi.createRazorpayOrder(offerKey);
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        toast({
          title: "Payment unavailable",
          description: "Could not load Razorpay. Check your connection.",
          variant: "destructive",
        });
        setPaying(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: rzOrder.keyId,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        order_id: rzOrder.orderId,
        name: "Magnetic Bliss in",
        description: rzOrder.offerName,
        prefill: {
          name: buyer.fullName.trim(),
          email: buyer.email.trim(),
          contact: buyer.phone.replace(/\D/g, "").slice(-10) || buyer.phone,
        },
        theme: { color: "#db2777" },
        handler: (response) => {
          void (async () => {
            try {
              const purchase = await coursesApi.purchase({
                offerKey,
                fullName: buyer.fullName.trim(),
                phone: buyer.phone.trim(),
                email: buyer.email.trim(),
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast({
                title: "Payment successful",
                description: purchase.scheduleUrl
                  ? "Opening your scheduling link..."
                  : "Your course purchase is confirmed.",
              });
              if (purchase.scheduleUrl) {
                window.open(purchase.scheduleUrl, "_blank");
              }
            } catch (err) {
              toast({
                title: "Purchase failed",
                description:
                  err instanceof Error
                    ? err.message
                    : "Payment succeeded but we could not save your purchase. Contact us with your payment ID.",
                variant: "destructive",
              });
            } finally {
              setPaying(null);
            }
          })();
        },
        modal: {
          ondismiss: () => setPaying(null),
        },
      });
      rzp.open();
    } catch (err) {
      toast({
        title: "Payment error",
        description: err instanceof Error ? err.message : "Could not start payment",
        variant: "destructive",
      });
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
              <GraduationCap className="w-3.5 h-3.5" />
              {courses.title || "Online Course + Community"}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-hero text-foreground mb-4 leading-tight">
              Launch Your Own
              <br />
              <span className="text-gradient-pink">Magnet Making Business</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {courses.description ||
                "Create a Successful Magnet Business from Home, So You Can Spend More Time with Your Family."}
            </p>
          </Reveal>
        </div>

        {embedUrl && (
          <div className="max-w-3xl mx-auto mb-14">
            <Reveal delay={180}>
              <div className="relative">
                <div className="absolute -left-4 top-1/4 -translate-x-full hidden lg:block">
                  <div className="text-right">
                    <p className="text-sm italic text-muted-foreground leading-snug">
                      First, watch this
                      <br />
                      short video.
                      <br />
                      <span className="font-semibold text-foreground">
                        It changes{" "}
                        <span className="underline decoration-primary decoration-2 underline-offset-2">
                          everything
                        </span>
                      </span>{" "}
                      👇
                    </p>
                    <svg
                      className="w-10 h-10 text-primary ml-auto mt-1 rotate-[30deg]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 7l10 10" />
                      <path d="M17 7v10H7" />
                    </svg>
                  </div>
                </div>

                <motion.div
                  className="rounded-2xl overflow-hidden border border-border shadow-elevated bg-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="aspect-video relative bg-black">
                    <iframe
                      title="Course video"
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {visibleOffers.some((o) => o.price > 0) && (
            <Reveal delay={200}>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-card mb-6 grid sm:grid-cols-3 gap-3">
                <div className="floating-label-group">
                  <input
                    type="text"
                    placeholder=" "
                    value={buyer.fullName}
                    onChange={(e) => setBuyer((b) => ({ ...b, fullName: e.target.value }))}
                    required
                  />
                  <label>Full Name</label>
                </div>
                <div className="floating-label-group">
                  <input
                    type="tel"
                    placeholder=" "
                    value={buyer.phone}
                    onChange={(e) => setBuyer((b) => ({ ...b, phone: e.target.value }))}
                    required
                  />
                  <label>Phone</label>
                </div>
                <div className="floating-label-group">
                  <input
                    type="email"
                    placeholder=" "
                    value={buyer.email}
                    onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
                  />
                  <label>Email (optional)</label>
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {visibleOffers.map((offer, index) => {
              const Icon = offer.icon;
              return (
                <Reveal key={offer.key} delay={240 + index * 40}>
                  <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card shadow-card h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-pink flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-foreground">{offer.label}</h3>
                        <p className="text-xs text-muted-foreground">{offer.description}</p>
                      </div>
                    </div>

                    {offer.price > 0 && (
                      <p className="text-2xl font-display font-bold text-foreground">
                        Rs{offer.price.toLocaleString("en-IN")}
                      </p>
                    )}

                    {offer.points.length > 0 && (
                      <ul className="space-y-1.5 pt-1 border-t border-border">
                        {offer.points.map((point) => (
                          <li key={point} className="flex items-center gap-2 text-sm text-foreground/80">
                            <Check className="w-3.5 h-3.5 text-[hsl(var(--success))] flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto pt-2">
                      {offer.price > 0 ? (
                        <motion.button
                          type="button"
                          disabled={paying !== null || !paymentsEnabled}
                          onClick={() => handlePay(offer.key)}
                          className="w-full py-2.5 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium glow-pink-sm disabled:opacity-60"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {paying === offer.key
                            ? "Opening payment..."
                            : !paymentsEnabled
                              ? "Payment unavailable"
                              : `Pay Rs${offer.price.toLocaleString("en-IN")}`}
                        </motion.button>
                      ) : offer.scheduleUrl ? (
                        <a
                          href={offer.scheduleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2.5 rounded-xl border border-border text-center text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Book now
                        </a>
                      ) : (
                        <p className="text-xs text-center text-muted-foreground py-2">
                          Price not set yet — ask admin to set a course price.
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={320}>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card text-center">
              <h2 className="text-h2 text-foreground mb-3">What You'll Learn</h2>
              <div className="grid sm:grid-cols-3 gap-6 mt-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Step-by-Step Process</p>
                  <p className="text-xs text-muted-foreground">From setup to first sale</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Video Tutorials</p>
                  <p className="text-xs text-muted-foreground">Hands-on demonstrations</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Community Access</p>
                  <p className="text-xs text-muted-foreground">Connect with other makers</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {!embedUrl && visibleOffers.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <Reveal delay={120}>
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Course content will appear here once the admin adds a video and pricing.
                </p>
              </div>
            </Reveal>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Courses;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import type { TestimonialItem } from "@/components/ui/testimonials-columns-1";
import { reviewsApi, type ApiReview } from "@/lib/api";

function reviewToTestimonial(r: ApiReview): TestimonialItem {
  const avatarUrl = r.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=random&size=80`;
  return {
    text: r.comment,
    image: avatarUrl,
    name: r.userName,
    role: `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}`,
  };
}

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi
      .getAll()
      .then((reviews) => {
        const sorted = [...reviews].sort((a, b) => b.rating - a.rating || b.helpful - a.helpful);
        setTestimonials(sorted.slice(0, 9).map(reviewToTestimonial));
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || testimonials.length === 0) return null;

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-border py-1 px-4 rounded-lg text-muted-foreground text-sm flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              Testimonials
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground font-display">
            What our customers say
          </h2>
          <p className="text-center mt-5 opacity-75 text-muted-foreground">
            Real reviews from real customers. See what people love about Magnetic Bliss India.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          {firstColumn.length > 0 && <TestimonialsColumn testimonials={firstColumn} duration={15} />}
          {secondColumn.length > 0 && <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />}
          {thirdColumn.length > 0 && <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />}
        </div>
      </div>
    </section>
  );
};

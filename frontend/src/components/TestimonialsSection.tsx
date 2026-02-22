import { motion } from "framer-motion";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import type { TestimonialItem } from "@/components/ui/testimonials-columns-1";

const testimonials: TestimonialItem[] = [
  {
    text: "The custom photo magnets turned out even better than I hoped. Quality is superb and delivery was fast. Highly recommend!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Priya S.",
    role: "Hyderabad",
  },
  {
    text: "Ordered heart-shaped magnets for our anniversary. My wife loved them. The print clarity and finish are excellent.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Rahul K.",
    role: "Customer",
  },
  {
    text: "Used these as wedding favors. Guests kept asking where we got them. Affordable, beautiful, and the team was so helpful.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Anitha M.",
    role: "Bride",
  },
  {
    text: "Family photos on the fridge look so good. The magnets are strong and the colors are vibrant. Will order again for gifts.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Vikram R.",
    role: "Customer",
  },
  {
    text: "Baby shower favors were a hit. Everyone wanted to know the source. Great quality and the customization process was easy.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    name: "Deepa L.",
    role: "Event Host",
  },
  {
    text: "The custom text magnets with our family motto are perfect. Sturdy, well-packaged, and arrived on time. Very happy.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Kiran P.",
    role: "Customer",
  },
  {
    text: "Ordered multiple sets for our café — menu boards and specials. Customers love the look. Professional finish.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
    name: "Arjun N.",
    role: "Café Owner",
  },
  {
    text: "Gift for my parents — their wedding photo as a magnet. They were so touched. Beautiful product and thoughtful packaging.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
    name: "Meera T.",
    role: "Customer",
  },
  {
    text: "Travel magnets from our trip look amazing. Way better than generic souvenirs. Fast turnaround and great communication.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face",
    name: "Suresh G.",
    role: "Customer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
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
            <div className="border border-border py-1 px-4 rounded-lg text-muted-foreground text-sm">
              Testimonials
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-foreground font-display">
            What our customers say
          </h2>
          <p className="text-center mt-5 opacity-75 text-muted-foreground">
            See what people are saying about Magnetic Bliss India.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

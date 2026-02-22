import { Star } from "lucide-react";

const reviews = [
  { name: "Sarah M.", text: "These magnets are incredible quality! My family photos look amazing on the fridge.", rating: 5 },
  { name: "Jake T.", text: "Ordered as a gift — my mom absolutely loved them. Will order again!", rating: 5 },
  { name: "Emily R.", text: "The colors are so vibrant and the magnets are thick and sturdy. 10/10.", rating: 5 },
  { name: "Michael B.", text: "Super easy to upload and customize. Arrived in 3 days!", rating: 5 },
  { name: "Lisa K.", text: "Perfect way to display vacation photos. Better than any frame.", rating: 5 },
  { name: "David W.", text: "Gift-wrapped beautifully. The recipient was thrilled!", rating: 5 },
  { name: "Anna P.", text: "I've ordered 4 sets now. They make the best gifts ever.", rating: 5 },
  { name: "Chris L.", text: "The print quality is studio-grade. Absolutely impressed.", rating: 5 },
];

const ReviewCard = ({ name, text, rating }: typeof reviews[0]) => (
  <div className="flex-shrink-0 w-80 p-6 rounded-2xl bg-card shadow-card mx-3">
    <div className="flex gap-1 mb-3">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
    <p className="text-sm text-foreground leading-relaxed mb-4">"{text}"</p>
    <p className="text-xs font-medium text-muted-foreground">{name}</p>
  </div>
);

export const ReviewMarquee = () => {
  return (
    <section className="py-20 overflow-hidden bg-background">
      <h2 className="text-h1 text-center text-foreground mb-4 px-6">
        Loved by Thousands
      </h2>
      <p className="text-center text-muted-foreground mb-12 px-6">
        See what our customers are saying
      </p>
      <div className="relative">
        <div className="flex animate-marquee" style={{ "--marquee-duration": "50s" } as React.CSSProperties}>
          {[...reviews, ...reviews].map((review, i) => (
            <ReviewCard key={i} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
};

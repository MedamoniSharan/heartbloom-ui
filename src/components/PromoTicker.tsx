import { useProductStore } from "@/stores/productStore";
import { Tag } from "lucide-react";

export const PromoTicker = () => {
  const { promoCodes } = useProductStore();
  const active = promoCodes.filter((p) => p.active);

  if (active.length === 0) return null;

  const items = [...active, ...active]; // duplicate for seamless loop

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2" style={{ "--marquee-duration": `${active.length * 8}s` } as React.CSSProperties}>
        {items.map((promo, i) => (
          <span key={`${promo.id}-${i}`} className="inline-flex items-center gap-2 mx-8 text-xs font-medium">
            <Tag className="w-3 h-3" />
            {promo.description}
            <span className="font-mono bg-primary-foreground/20 px-1.5 py-0.5 rounded text-[10px]">{promo.code}</span>
            <span className="opacity-70">({promo.discount}% off)</span>
          </span>
        ))}
      </div>
    </div>
  );
};

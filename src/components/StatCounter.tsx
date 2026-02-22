import { useEffect, useRef, useState } from "react";
import { formatCount, useCountUp } from "@/hooks/useCountUp";

interface StatCounterProps {
  target: number;
  suffix?: string;
  label: string;
}

export const StatCounter = ({ target, suffix = "+", label }: StatCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const value = useCountUp(target, 1800, isVisible);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-h2 text-foreground">
        {formatCount(value, suffix)}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

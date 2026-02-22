import { type ReactNode } from "react";

interface SkeletonBoxProps {
  className?: string;
  delay?: number;
}

const SkeletonBox = ({ className = "", delay = 0 }: SkeletonBoxProps) => (
  <div
    className={`shimmer rounded-xl ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  />
);

/** 3×3 magnet grid skeleton */
export const SkeletonMagnetGrid = () => (
  <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
    {Array.from({ length: 9 }).map((_, i) => (
      <SkeletonBox
        key={i}
        className="aspect-square rounded-xl"
        delay={i * 50}
      />
    ))}
  </div>
);

/** Product card skeleton */
export const SkeletonProductCard = () => (
  <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
    <SkeletonBox className="aspect-[4/3] rounded-xl" />
    <SkeletonBox className="h-4 w-[70%]" delay={50} />
    <SkeletonBox className="h-4 w-[50%]" delay={100} />
    <div className="flex justify-end">
      <SkeletonBox className="h-5 w-16 rounded-full" delay={150} />
    </div>
  </div>
);

/** Order row skeleton */
export const SkeletonOrderRow = () => (
  <div className="flex items-center gap-3 py-3">
    <SkeletonBox className="w-10 h-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-3 w-[60%]" delay={50} />
      <SkeletonBox className="h-3 w-[40%]" delay={100} />
    </div>
    <SkeletonBox className="h-6 w-16 rounded-full" delay={150} />
  </div>
);

/** Review card skeleton */
export const SkeletonReviewCard = () => (
  <div className="flex-shrink-0 w-80 p-6 rounded-2xl bg-card shadow-card space-y-3">
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBox key={i} className="w-4 h-4 rounded" delay={i * 30} />
      ))}
    </div>
    <SkeletonBox className="h-3 w-full" delay={100} />
    <SkeletonBox className="h-3 w-[85%]" delay={150} />
    <SkeletonBox className="h-3 w-[60%]" delay={200} />
    <div className="flex items-center gap-2 pt-2">
      <SkeletonBox className="w-6 h-6 rounded-full" delay={250} />
      <SkeletonBox className="h-3 w-20" delay={300} />
    </div>
  </div>
);

/** Dashboard stat cards skeleton */
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-card shadow-card space-y-2">
          <SkeletonBox className="h-8 w-16" delay={i * 50} />
          <SkeletonBox className="h-3 w-24" delay={i * 50 + 50} />
        </div>
      ))}
    </div>
    <SkeletonBox className="h-48 rounded-2xl" delay={250} />
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonOrderRow key={i} />
      ))}
    </div>
  </div>
);

/** Smart loading wrapper — delays showing skeleton to prevent flash */
interface SmartLoadingProps {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  minDelay?: number;
}

export const SmartLoading = ({
  loading,
  skeleton,
  children,
  minDelay = 200,
}: SmartLoadingProps) => {
  // If loading is fast (< minDelay), we skip showing skeleton entirely
  // For now we use CSS transitions for smooth swap
  return (
    <div className="relative">
      <div
        className={`transition-opacity duration-300 ${
          loading ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
        }`}
      >
        {skeleton}
      </div>
      <div
        className={`transition-opacity duration-300 ${
          loading ? "opacity-0 absolute inset-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

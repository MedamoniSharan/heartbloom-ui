import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Heart, MessageCircle } from "lucide-react";
import { journeyVideosApi, type ApiJourneyVideo } from "@/lib/api";
import { Reveal } from "./Reveal";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const FollowMyJourney = () => {
  const [videos, setVideos] = useState<ApiJourneyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    journeyVideosApi
      .getAll()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-muted/30" id="follow-my-journey">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-h1 text-center text-foreground mb-3">Follow My Journey</h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">
            Join millions who watch our magnet-making process and get inspired daily.
          </p>
        </Reveal>

        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide py-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {videos.map((v, i) => (
              <motion.a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[280px] rounded-2xl overflow-hidden bg-card border border-border shadow-card hover:shadow-elevated transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className="relative aspect-[9/16] bg-muted">
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">Video</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-2 px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                    {v.platform === "facebook" ? (
                      <FacebookIcon className="w-4 h-4" />
                    ) : (
                      <InstagramIcon className="w-4 h-4" />
                    )}
                    <span>{v.username || "heartprinted"}</span>
                  </div>
                </div>
                <div className="p-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {v.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {v.views}
                    </span>
                  )}
                  {v.likes && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {v.likes}
                    </span>
                  )}
                  {v.comments && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {v.comments}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

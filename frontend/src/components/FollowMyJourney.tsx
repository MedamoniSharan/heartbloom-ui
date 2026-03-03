import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Play, Share2, Bookmark, X } from "lucide-react";
import { journeyVideosApi, type ApiJourneyVideo } from "@/lib/api";
import { Reveal } from "./Reveal";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const ReelsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);

function extractReelShortcode(url: string): string | null {
  const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export const FollowMyJourney = () => {
  const [videos, setVideos] = useState<ApiJourneyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<ApiJourneyVideo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    journeyVideosApi
      .getAll()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const closeModal = useCallback(() => setActiveVideo(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (activeVideo) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo, closeModal]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <>
      <section className="py-24 px-6 bg-muted/30" id="follow-my-journey">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center">
                <ReelsIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-h1 text-center text-foreground">Follow My Journey</h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">
              Watch our magnet-making reels and get inspired. Tap to play right here!
            </p>
          </Reveal>

          <div className="relative">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-elevated flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-elevated flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide py-4 px-1"
            >
              {videos.map((v, i) => (
                <motion.button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVideo(v)}
                  className="flex-shrink-0 w-[240px] group text-left cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-card group-hover:shadow-elevated transition-shadow bg-card border border-border">
                    <div className="absolute top-0 left-0 right-0 h-1 z-20 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]" />

                    <div className="relative aspect-[9/16] bg-black overflow-hidden">
                      {v.thumbnailUrl ? (
                        <img
                          src={v.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-muted to-muted-foreground/20 flex items-center justify-center">
                          <ReelsIcon className="w-12 h-12 text-white/50" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                        </motion.div>
                      </div>

                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold">
                          <InstagramIcon className="w-3.5 h-3.5" />
                          Reels
                        </div>
                        {v.views && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium">
                            <Eye className="w-3 h-3" />
                            {v.views}
                          </div>
                        )}
                      </div>

                      {/* Right side actions */}
                      <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 z-10">
                        {v.likes && (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                              <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] text-white font-semibold">{v.likes}</span>
                          </div>
                        )}
                        {v.comments && (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] text-white font-semibold">{v.comments}</span>
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                          <Bookmark className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Bottom: username + audio */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                              <InstagramIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">@{v.username || "magneticblissindia"}</p>
                            <p className="text-white/60 text-[10px] truncate">Original Audio</p>
                          </div>
                        </div>
                        <div className="flex items-end gap-[2px] mt-2 h-3">
                          {Array.from({ length: 24 }).map((_, j) => (
                            <motion.div
                              key={j}
                              className="flex-1 bg-white/40 rounded-full min-w-[2px]"
                              style={{ height: `${20 + Math.sin(j * 0.8) * 60 + Math.random() * 20}%` }}
                              animate={{ height: ["30%", `${30 + Math.random() * 70}%`, "30%"] }}
                              transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: j * 0.05 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Instagram Reel Embed Modal ─── */}
      <AnimatePresence>
        {activeVideo && (() => {
          const shortcode = extractReelShortcode(activeVideo.url);
          return (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />

              {/* Modal */}
              <motion.div
                className="relative z-10 w-full max-w-[420px] mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Close */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Embed container with phone-like aspect ratio */}
                <div className="rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                  {/* Instagram gradient bar */}
                  <div className="h-1 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]" />

                  {shortcode ? (
                    <div className="relative" style={{ paddingBottom: "177.78%" /* 16:9 inverted = 9:16 */ }}>
                      <iframe
                        src={`https://www.instagram.com/reel/${shortcode}/embed/`}
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                        title={`Instagram Reel by @${activeVideo.username}`}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[9/16] flex flex-col items-center justify-center gap-4 text-white/70">
                      <InstagramIcon className="w-12 h-12" />
                      <p className="text-sm">Could not load this reel</p>
                      <a
                        href={activeVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline text-white hover:text-white/80"
                      >
                        Watch on Instagram
                      </a>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 py-3 bg-black border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                          <InstagramIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <span className="text-white text-xs font-semibold">@{activeVideo.username || "magneticblissindia"}</span>
                    </div>
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
                    >
                      Open in Instagram
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
};

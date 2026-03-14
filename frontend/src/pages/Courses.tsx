import { motion } from "framer-motion";
import { Video, Calendar, Users, Play, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { useSiteContentStore } from "@/stores/siteContentStore";

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

const Courses = () => {
  const { courses } = useSiteContentStore();
  const embedUrl = getYoutubeEmbedUrl(courses.youtubeUrl);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-4 sm:pt-32 sm:px-6 pb-12 sm:pb-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-5">
              <GraduationCap className="w-3.5 h-3.5" />
              {courses.title || "Online Course + Community"}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-hero text-foreground mb-4 leading-tight">
              Launch Your Own<br />
              <span className="text-gradient-pink">Magnet Making Business</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {courses.description || "Create a Successful Magnet Business from Home, So You Can Spend More Time with Your Family."}
            </p>
          </Reveal>
        </div>

        {/* Video Section */}
        {embedUrl && (
          <div className="max-w-3xl mx-auto mb-14">
            <Reveal delay={180}>
              <div className="relative">
                {/* Annotation arrow */}
                <div className="absolute -left-4 top-1/4 -translate-x-full hidden lg:block">
                  <div className="text-right">
                    <p className="text-sm italic text-muted-foreground leading-snug">
                      First, watch this<br />short video.<br />
                      <span className="font-semibold text-foreground">It changes <span className="underline decoration-primary decoration-2 underline-offset-2">everything</span></span> 👇
                    </p>
                    <svg className="w-10 h-10 text-primary ml-auto mt-1 rotate-[30deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 7l10 10" />
                      <path d="M17 7v10H7" />
                    </svg>
                  </div>
                </div>

                {/* Video Card */}
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

        {/* Booking Buttons */}
        <div className="max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {courses.book1to1Url && (
              <Reveal delay={240}>
                <motion.a
                  href={courses.book1to1Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card shadow-card hover:border-primary/50 hover:shadow-elevated transition-all group"
                  whileHover={{ y: -3 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-pink flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{courses.book1to1Label || "Book 1:1 Session"}</h3>
                    <p className="text-xs text-muted-foreground">One-on-one with our expert</p>
                  </div>
                </motion.a>
              </Reveal>
            )}
            {courses.bookGroupUrl && (
              <Reveal delay={280}>
                <motion.a
                  href={courses.bookGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card shadow-card hover:border-primary/50 hover:shadow-elevated transition-all group"
                  whileHover={{ y: -3 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-pink flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{courses.bookGroupLabel || "Book Group Session"}</h3>
                    <p className="text-xs text-muted-foreground">Join a group workshop</p>
                  </div>
                </motion.a>
              </Reveal>
            )}
          </div>

          {/* What You'll Learn */}
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

        {!embedUrl && !courses.book1to1Url && !courses.bookGroupUrl && (
          <div className="max-w-2xl mx-auto">
            <Reveal delay={120}>
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Course content will appear here once the admin adds a video and booking links.</p>
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

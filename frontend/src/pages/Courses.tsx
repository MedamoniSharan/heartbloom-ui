import { motion } from "framer-motion";
import { Video, Calendar, Users } from "lucide-react";
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
      <main className="pt-32 px-6 pb-16 max-w-4xl mx-auto">
        <Reveal>
          <h1 className="text-h1 text-foreground mb-3">{courses.title || "Courses"}</h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-muted-foreground mb-8 whitespace-pre-line">
            {courses.description || "Learn to create beautiful photo magnets. Watch our intro video and book a session."}
          </p>
        </Reveal>

        {embedUrl && (
          <Reveal delay={120}>
            <div className="rounded-2xl overflow-hidden border border-border shadow-card bg-card mb-8">
              <div className="aspect-video relative">
                <iframe
                  title="Course video"
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="p-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="w-4 h-4 text-primary" />
                <span>YouTube</span>
              </div>
            </div>
          </Reveal>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {courses.book1to1Url && (
            <Reveal delay={160}>
              <a
                href={courses.book1to1Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card shadow-card hover:border-primary/50 hover:shadow-elevated transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{courses.book1to1Label || "Book 1:1 Session"}</h3>
                  <p className="text-xs text-muted-foreground">One-on-one with our team</p>
                </div>
              </a>
            </Reveal>
          )}
          {courses.bookGroupUrl && (
            <Reveal delay={200}>
              <a
                href={courses.bookGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card shadow-card hover:border-primary/50 hover:shadow-elevated transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{courses.bookGroupLabel || "Book Group Session"}</h3>
                  <p className="text-xs text-muted-foreground">Join a group workshop</p>
                </div>
              </a>
            </Reveal>
          )}
        </div>

        {!embedUrl && !courses.book1to1Url && !courses.bookGroupUrl && (
          <Reveal delay={120}>
            <p className="text-muted-foreground text-center py-8">Content will appear here once the admin adds a video and booking links.</p>
          </Reveal>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Courses;

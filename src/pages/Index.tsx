import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { MagnetGrid } from "@/components/MagnetGrid";
import { ReviewMarquee } from "@/components/ReviewMarquee";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageTransition } from "@/components/PageTransition";
import { MagneticCursor } from "@/components/MagneticCursor";
import { UploadModal } from "@/components/UploadModal";

const Index = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <MagneticCursor />
        <ScrollProgress />
        <Navbar />
        <main>
          <HeroSection onUploadClick={() => setUploadOpen(true)} />
          <HowItWorks />
          <MagnetGrid />
          <ReviewMarquee />
        </main>
        <Footer />
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </div>
    </PageTransition>
  );
};

export default Index;

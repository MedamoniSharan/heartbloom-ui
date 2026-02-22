import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductPreview } from "@/components/ProductPreview";
import { ReviewMarquee } from "@/components/ReviewMarquee";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageTransition } from "@/components/PageTransition";
import { MagneticCursor } from "@/components/MagneticCursor";
import { UploadModal } from "@/components/UploadModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SkipToContent, SRAnnouncer } from "@/components/Accessibility";

const Index = () => {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <SkipToContent />
        <SRAnnouncer />
        <MagneticCursor />
        <ScrollProgress />
        <Navbar />
        <main id="main-content" role="main">
          <HeroSection onUploadClick={() => setUploadOpen(true)} />
          <HowItWorks />
          <ProductPreview />
          <ReviewMarquee />
        </main>
        <Footer />
        <MobileBottomNav onUploadClick={() => setUploadOpen(true)} />
        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </div>
    </PageTransition>
  );
};

export default Index;

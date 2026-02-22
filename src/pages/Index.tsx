import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { MagnetGrid } from "@/components/MagnetGrid";
import { ReviewMarquee } from "@/components/ReviewMarquee";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <MagnetGrid />
        <ReviewMarquee />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

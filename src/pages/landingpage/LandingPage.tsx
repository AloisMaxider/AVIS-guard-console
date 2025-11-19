import { useEffect } from "react";
import HeroSection from "./sections/HeroSection";
import ProblemSolution from "./sections/ProblemSolution";
import FeaturesCarousel from "./sections/FeaturesCarousel";
import LiveDemo from "./sections/LiveDemo";
import AIShowcase from "./sections/AIShowcase";
import Technology from "./sections/Technology";
import Pricing from "./sections/Pricing";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";
import ProgressBar from "./components/ProgressBar";
import MagneticCursor from "./components/MagneticCursor";

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";
    
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="relative bg-[#0b0e17] text-foreground overflow-x-hidden">
      <ProgressBar />
      <MagneticCursor />
      
      {/* Animated noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />
      
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]" 
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.03) 2px, rgba(0, 240, 255, 0.03) 4px)'
           }} />
      
      <main className="relative z-10">
        <HeroSection />
        <ProblemSolution />
        <FeaturesCarousel />
        <LiveDemo />
        <AIShowcase />
        <Technology />
        <Pricing />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;

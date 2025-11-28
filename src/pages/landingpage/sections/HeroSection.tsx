import { motion } from "framer-motion";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { useState, useEffect } from "react";
import LogoMarquee from "../components/LogoMarquee";
import AnimatedCounter from "../components/AnimatedCounter";

const HeroSection = () => {
  const [text, setText] = useState("");
  const fullText = "The Only Platform That Predicts Outages Before They Happen";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
               `,
               backgroundSize: '100px 100px',
               animation: 'grid-flow 20s linear infinite'
             }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00f0ff] rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Main headline with glitch effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold mt-12 mb-12 leading-tight">
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#d900ff] to-[#ff006e] bg-clip-text text-transparent inline-block relative">
              {text}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          
          {/* Scanline effect on headline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/5 to-transparent animate-scan pointer-events-none" />
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-[#00f0ff] mb-24 font-light"
        >
          Near-instant AI problem analysis · Auto-triage · Root cause · One-click fixes
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
        >
          <button className="group relative px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] rounded-3xl text-lg font-semibold text-background overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]">
            <span className="relative z-10 flex items-center gap-2">
              Start Free 14-Day Trial
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#d900ff] to-[#ff006e] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button className="group px-8 py-4 glass-card border border-[#00f0ff]/30 rounded-3xl text-lg font-semibold text-foreground hover:border-[#00f0ff] transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <span className="flex items-center gap-2">
              <FiPlay className="group-hover:scale-110 transition-transform" />
              Watch 90-Second Demo
            </span>
          </button>
        </motion.div>

        {/* Trust metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="glass-card p-6 rounded-2xl border border-[#00f0ff]/20 hover:border-[#00f0ff]/50 transition-all">
            <AnimatedCounter end={1847291} duration={2} className="text-4xl font-bold text-[#00f0ff] mb-2" />
            <p className="text-muted-foreground">Hosts Monitored</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-[#d900ff]/20 hover:border-[#d900ff]/50 transition-all">
            <AnimatedCounter end={12483} duration={2} className="text-4xl font-bold text-[#d900ff] mb-2" />
            <p className="text-muted-foreground">Outages Prevented This Month</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-[#ff006e]/20 hover:border-[#ff006e]/50 transition-all">
            <AnimatedCounter end={532} duration={2} className="text-4xl font-bold text-[#ff006e] mb-2" />
            <p className="text-muted-foreground">Teams Online Now</p>
          </div>
        </motion.div>

        {/* Logo marquee */}
        <LogoMarquee />
      </div>

      <style>{`
        @keyframes grid-flow {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

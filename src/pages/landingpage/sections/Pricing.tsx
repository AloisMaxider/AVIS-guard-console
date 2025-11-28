import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiUser, FiMail, FiBriefcase, FiMessageSquare, FiSend } from "react-icons/fi";
import { Building } from "lucide-react";

const features = [
  "Unlimited hosts monitoring",
  "AI-powered root cause analysis",
  "Real-time event streaming",
  "Auto-remediation workflows",
  "Enterprise RBAC & SSO",
  "24/7 Priority support",
  "White-label options",
  "99.99% SLA guarantee"
];

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted!");
    
    // Close modal after submission
    setIsModalOpen(false);
    
    // You can add toast notification here
    alert("Demo request submitted! We'll contact you within 24 hours.");
  };

  return (
    <section id="pricing" className="relative py-16 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-foreground">Enterprise </span>
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            One plan, unlimited possibilities
          </p>
        </motion.div>
        
        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl border-2 border-[#00f0ff]/50 relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00f0ff]/10 via-[#d900ff]/10 to-[#ff006e]/10 animate-gradient-shift pointer-events-none" />

          {/* MAIN CONTENT WRAPPER */}
          <div className="relative z-10 px-6 sm:px-10 py-10 space-y-10">

            {/* Popular badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute mt-4 top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] rounded-full text-background font-bold text-sm"
            >
              MOST POPULAR
            </motion.div>

            {/* Price */}
            <div className="text-center space-y-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
                  $799
                </span>
                <div className="text-left">
                  <p className="text-muted-foreground text-lg">/month</p>
                  <p className="text-sm text-muted-foreground">billed annually</p>
                </div>
              </div>

              <p className="text-muted-foreground">or $999/month billed monthly</p>

              <p className="text-2xl font-bold text-[#39ff14]">Cheaper than one outage per year</p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#39ff14] to-[#00f0ff] flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-background" />
                  </div>

                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>

        {/* Demo CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="glass-card rounded-3xl p-8 border-2 border-[#00f0ff]/30">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
                Ready to See It in Action?
              </span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Book a 15-minute demo and see how Jarvis can transform your monitoring strategy. 
              No commitment, no sales pitch - just pure value.
            </p>
            <button 
              className="px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] rounded-2xl text-background font-semibold hover:scale-105 transition-transform hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
              onClick={() => setIsModalOpen(true)}
            >
              Book Your Demo Now
            </button>
          </div>
        </motion.div>

        {/* Contact Form Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-md my-8" 
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Content */}
                <div className="glass-card rounded-3xl border-2 border-[#00f0ff]/50 p-6 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 via-[#d900ff]/10 to-[#ff006e]/10 animate-pulse" />
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#ff006e] to-[#d900ff] flex items-center justify-center text-background hover:scale-110 transition-transform z-10"
                  >
                    <FiX className="w-4 h-4" />
                  </button>

                  {/* Header */}
                  <div className="relative z-10 text-center mb-6"> 
                    <h3 className="text-xl font-bold mb-2"> 
                      <span className="bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
                        Book Your Demo
                      </span>
                    </h3>
                    <p className="text-muted-foreground text-xs"> 
                      We'll contact you within 24 hours to schedule
                    </p>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-3"> 
                    {/* Name Field */}
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f0ff] w-4 h-4" /> 
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full pl-10 pr-4 py-3 glass-card border border-[#00f0ff]/30 rounded-2xl focus:border-[#00f0ff] focus:outline-none text-foreground placeholder-muted-foreground text-sm" 
                      />
                    </div>

                    {/* Email Field */}
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f0ff] w-4 h-4" /> 
                      <input
                        type="email"
                        placeholder="Work Email"
                        required
                        className="w-full pl-10 pr-4 py-3 glass-card border border-[#00f0ff]/30 rounded-2xl focus:border-[#00f0ff] focus:outline-none text-foreground placeholder-muted-foreground text-sm" 
                      />
                    </div>

                    {/* Company Field */}
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00f0ff] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Company Name"
                        required
                        className="w-full pl-10 pr-4 py-3 glass-card border border-[#00f0ff]/30 rounded-2xl focus:border-[#00f0ff] focus:outline-none text-foreground placeholder-muted-foreground text-sm" 
                      />
                    </div>

                    {/* Message Field */}
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-3 text-[#00f0ff] w-4 h-4" /> 
                      <textarea
                        placeholder="What would you like to see in the demo?"
                        rows={2} 
                        className="w-full pl-10 pr-4 py-3 glass-card border border-[#00f0ff]/30 rounded-2xl focus:border-[#00f0ff] focus:outline-none text-foreground placeholder-muted-foreground resize-none text-sm" 
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] rounded-2xl text-background font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] text-sm"
                    >
                      <FiSend className="w-4 h-4" />
                      Request Demo
                    </button>
                  </form>

                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(6)].map((_, i) => ( 
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#00f0ff] rounded-full"
                        initial={{ 
                          x: Math.random() * 250, 
                          y: Math.random() * 300, 
                          opacity: 0
                        }}
                        animate={{
                          y: [null, -15], 
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 3
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Value propositions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            { title: "ROI Guarantee", desc: "See positive ROI in 30 days or get a full refund" },
            { title: "Free Migration", desc: "Our team handles the entire migration process" },
            { title: "Cancel Anytime", desc: "No contracts, no commitments, cancel with one click" }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-surface p-6 rounded-2xl border border-border/30 text-center"
            >
              <h4 className="text-lg font-bold text-primary mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
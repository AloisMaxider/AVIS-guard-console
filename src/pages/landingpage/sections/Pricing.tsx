import { motion } from "framer-motion";
import { FiCheck, FiCalendar } from "react-icons/fi";

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
  return (
    <section className="relative py-32 overflow-hidden">
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
          className="glass-card p-12 rounded-3xl border-2 border-[#00f0ff]/50 relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 via-[#d900ff]/10 to-[#ff006e]/10 animate-gradient-shift" />
          
          {/* Popular badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] rounded-full text-background font-bold text-sm"
          >
            MOST POPULAR
          </motion.div>

          <div className="relative z-10">
            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
                  $799
                </span>
                <div className="text-left">
                  <p className="text-muted-foreground text-lg">/month</p>
                  <p className="text-sm text-muted-foreground">billed annually</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-2">or $999/month billed monthly</p>
              <p className="text-2xl font-bold text-[#39ff14]">
                Cheaper than one outage per year
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
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

            {/* CTA */}
            <button className="w-full py-5 bg-gradient-to-r from-[#00f0ff] via-[#d900ff] to-[#ff006e] rounded-2xl text-lg font-bold text-background hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all hover:scale-105 flex items-center justify-center gap-3">
              <FiCalendar className="w-5 h-5" />
              Book 15 Min Demo Call
            </button>

            {/* Trust message */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6 text-muted-foreground"
            >
              No credit card required · 14-day free trial · Cancel anytime
            </motion.p>
          </div>

          {/* Neon glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff] via-[#d900ff] to-[#ff006e] opacity-20 blur-2xl -z-10" />
        </motion.div>

        {/* Value proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-muted-foreground mb-4">
            Used by 532+ teams worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["30-day money-back guarantee", "Dedicated account manager", "Custom integrations available"].map((item, i) => (
              <span
                key={item}
                className="px-4 py-2 glass-card rounded-full border border-[#00f0ff]/30 text-sm text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;

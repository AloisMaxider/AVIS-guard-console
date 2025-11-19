import { motion } from "framer-motion";
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiHeart } from "react-icons/fi";

const Footer = () => {
  const links = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" },
      { name: "Roadmap", href: "#roadmap" }
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" }
    ],
    resources: [
      { name: "Documentation", href: "#docs" },
      { name: "API Reference", href: "#api" },
      { name: "Status Page", href: "#status" },
      { name: "Community", href: "#community" }
    ],
    legal: [
      { name: "Privacy", href: "#privacy" },
      { name: "Terms", href: "#terms" },
      { name: "Security", href: "#security" },
      { name: "DPA", href: "#dpa" }
    ]
  };

  const socials = [
    { icon: FiGithub, href: "#", color: "#00f0ff" },
    { icon: FiTwitter, href: "#", color: "#d900ff" },
    { icon: FiLinkedin, href: "#", color: "#ff006e" },
    { icon: FiMail, href: "#", color: "#39ff14" }
  ];

  return (
    <footer className="relative py-20 border-t border-border/50 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#00f0ff]/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {/* Logo & tagline */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#00f0ff] to-[#d900ff] bg-clip-text text-transparent">
                  NebulaGuard™
                </span>
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                AI-powered monitoring that predicts outages before they happen
              </p>
              
              {/* Social links */}
              <div className="flex gap-4">
                {socials.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="w-10 h-10 rounded-full glass-card border border-border/50 flex items-center justify-center hover:border-[#00f0ff] transition-all group"
                    style={{
                      boxShadow: `0 0 0 rgba(${social.color}, 0)`
                    }}
                  >
                    <social.icon className="w-5 h-5 text-foreground group-hover:text-[#00f0ff] transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h4 className="font-bold text-foreground mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {items.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-[#00f0ff] transition-colors relative group inline-block"
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#d900ff] group-hover:w-full transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <FiHeart className="text-[#ff006e] w-4 h-4 animate-pulse" /> by the NebulaGuard Team
          </p>
          
          <p className="text-muted-foreground text-sm">
            © 2025 NebulaGuard. All rights reserved.
          </p>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
      </div>
    </footer>
  );
};

export default Footer;

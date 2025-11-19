import { motion, useScroll } from "framer-motion";

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#d900ff] to-[#ff006e] origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export default ProgressBar;

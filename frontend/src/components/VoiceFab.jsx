import { FaMicrophone } from "react-icons/fa";
import { motion } from "framer-motion";

export default function VoiceFab({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Open voice assistant"
      className="absolute z-40 h-14 w-14 rounded-full bg-setu-marigold text-white shadow-fab flex items-center justify-center bottom-6 right-5"
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="absolute inset-0 rounded-full bg-setu-marigold animate-pulse-ring" />
      <FaMicrophone className="text-xl relative" />
    </motion.button>
  );
}

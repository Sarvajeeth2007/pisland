import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-neutral-300 hover:bg-white/10 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${className ?? ''}`}
  >
    <ArrowLeft size={14} />
  </motion.button>
);

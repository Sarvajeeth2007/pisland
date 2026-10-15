import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  active?: boolean;
  onClick: () => void;
  className?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ active, onClick, className }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md ${active ? 'bg-white/10' : ''} text-neutral-300 hover:bg-white/10 transition-colors ${className ?? ''}`}
  >
    <Settings size={14} />
  </motion.button>
);

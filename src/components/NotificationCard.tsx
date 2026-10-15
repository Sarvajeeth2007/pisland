import React from 'react';
import { motion } from 'framer-motion';

interface NotificationCardProps {
  title: string;
  subtitle?: string;
  thumbnail?: string; // optional image URL
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ title, subtitle, thumbnail }) => {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 p-3 bg-black/30 border border-white/10 rounded-2xl min-h-[56px] overflow-hidden"
    >
      {thumbnail && (
        <img src={thumbnail} alt="thumb" className="w-10 h-10 rounded-md object-cover" />
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold text-white truncate" title={title}>
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-neutral-400 truncate" title={subtitle}>
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

import React from 'react';
import { useSettingsStore } from '../store/settingsStore';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glow = false,
  ...props 
}) => {
  const { settings } = useSettingsStore();

  const customStyle: React.CSSProperties = {
    backgroundColor: `rgba(0, 0, 0, ${Math.max(0.4, settings.opacity - 0.25)})`,
    backdropFilter: `blur(${settings.blurAmount}px)`,
    WebkitBackdropFilter: `blur(${settings.blurAmount}px)`,
  };

  return (
    <div
      style={customStyle}
      className={`
        relative 
        rounded-2xl 
        border border-white/[0.08] 
        shadow-2xl 
        transition-all duration-300 ease-out
        ${glow ? 'shadow-[0_0_15px_rgba(59,130,246,0.15)] border-accent/40' : 'hover:border-white/[0.12]'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;

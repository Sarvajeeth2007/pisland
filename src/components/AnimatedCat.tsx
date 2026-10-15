import React, { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useSettingsStore } from '../store/settingsStore';

interface AnimatedCatProps {
  isHovered: boolean;
  type?: string; // Optional override for settings gallery previews
}

export const AnimatedCat: React.FC<AnimatedCatProps> = ({ isHovered, type }) => {
  const { activeNotification, media, isCharging, bluetoothConnected, clipboardHistory } = useSystemStore();
  const { settings } = useSettingsStore();
  
  // Resolve active companion type
  const companion = type || settings.activeCompanion || 'cat';

  const [catState, setCatState] = useState<'sleeping' | 'awake'>('sleeping');
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clipboardWink, setClipboardWink] = useState(false);
  
  const catRef = useRef<SVGSVGElement | null>(null);
  const prevClipLength = useRef(clipboardHistory.length);

  // Mouse move listener for eye-tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Wink on copy reaction
  useEffect(() => {
    if (clipboardHistory.length > prevClipLength.current) {
      setClipboardWink(true);
      const t = setTimeout(() => setClipboardWink(false), 1500);
      prevClipLength.current = clipboardHistory.length;
      return () => clearTimeout(t);
    }
    prevClipLength.current = clipboardHistory.length;
  }, [clipboardHistory]);

  // Update companion state based on activity
  useEffect(() => {
    if (isHovered || activeNotification || media.isPlaying || isCharging) {
      setCatState('awake');
    } else {
      const timer = setTimeout(() => {
        setCatState('sleeping');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, activeNotification, media.isPlaying, isCharging]);

  // Periodic blinking when awake
  useEffect(() => {
    if (catState === 'sleeping') return;

    let blinkTimeout: any;
    
    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
        scheduleNextBlink();
      }, 150);
    };

    const scheduleNextBlink = () => {
      const delay = 3000 + Math.random() * 4000;
      blinkTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();

    return () => clearTimeout(blinkTimeout);
  }, [catState]);

  // Calculate eye pupil offsets pointing toward mouse cursor
  const getEyeOffset = () => {
    if (catState === 'sleeping' || !catRef.current) {
      return { x: 0, y: 0 };
    }

    try {
      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;

      const dx = mousePos.x - catCenterX;
      const dy = mousePos.y - catCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 15) {
        return { x: 0, y: 0 };
      }

      // Max eye pupil shift of 1.2px
      const maxShift = 1.2;
      return {
        x: (dx / distance) * maxShift,
        y: (dy / distance) * maxShift,
      };
    } catch {
      return { x: 0, y: 0 };
    }
  };

  const eyeOffset = getEyeOffset();

  // CSS classes for animations
  const animationClass = 
    (media.isPlaying || isCharging) && catState === 'awake'
      ? 'animate-cat-bob' 
      : catState === 'sleeping' 
        ? 'animate-cat-breath' 
        : '';

  // Determine colors based on companion type
  const getCompanionColors = () => {
    switch (companion) {
      case 'dog':
        return { main: '#CD853F', accent: '#8B5A2B', eye: '#181818' };
      case 'owl':
        return { main: '#5C4033', accent: '#4A3B32', eye: '#181818' };
      case 'fox':
        return { main: '#E67E22', accent: '#D35400', eye: '#181818' };
      case 'cheetah':
        return { main: '#F1C40F', accent: '#D4AC0D', eye: '#181818' };
      case 'panda':
        return { main: '#F5F5F5', accent: '#1A1A1A', eye: '#FFFFFF' };
      case 'penguin':
        return { main: '#1A1A1A', accent: '#E6E6E6', eye: '#181818' };
      case 'rabbit':
        return { main: '#ECF0F1', accent: '#F8BBD0', eye: '#181818' };
      case 'hamster':
        return { main: '#EDBB99', accent: '#E67E22', eye: '#181818' };
      case 'bear':
        return { main: '#6D4C41', accent: '#8D6E63', eye: '#181818' };
      case 'red_panda':
        return { main: '#E67E22', accent: '#D35400', eye: '#181818' };
      case 'person':
        return { main: '#F5CBA7', accent: '#2C3E50', eye: '#181818' };
      case 'robot':
        return { main: '#7F8C8D', accent: '#BDC3C7', eye: '#5DADE2' };
      case 'ghost':
        return { main: '#F2F4F4', accent: '#E5E8E8', eye: '#2C3E50' };
      case 'alien':
        return { main: '#58D68D', accent: '#FF5E5E', eye: '#181818' };
      case 'cat':
      default:
        return { main: '#E6E6E6', accent: '#CFCFCF', eye: '#181818' };
    }
  };

  const colors = getCompanionColors();

  return (
    <svg
      ref={catRef}
      width="24"
      height="20"
      viewBox="0 0 24 20"
      className={`transition-transform duration-500 ease-out origin-bottom ${animationClass}`}
    >
      {/* 1. COMPANION EARS / HEAD APPENDAGES */}
      {companion === 'cat' && (
        <>
          <path d="M 3 6 L 7 1 L 10 5 Z" fill={colors.main} />
          <path d="M 14 5 L 17 1 L 21 6 Z" fill={colors.main} />
          <path d="M 4.8 5.4 L 7 2.2 L 8.8 4.7 Z" fill={colors.accent} />
          <path d="M 15.2 4.7 L 17 2.2 L 19.2 5.4 Z" fill={colors.accent} />
        </>
      )}

      {companion === 'dog' && (
        <>
          {/* Floppy ears hanging down */}
          <rect x="1.5" y="4" width="2.5" height="9" rx="1.25" fill={colors.accent} />
          <rect x="20" y="4" width="2.5" height="9" rx="1.25" fill={colors.accent} />
        </>
      )}

      {companion === 'owl' && (
        <>
          <path d="M 4 4 L 7 1 L 8 4 Z" fill={colors.accent} />
          <path d="M 16 4 L 17 1 L 20 4 Z" fill={colors.accent} />
        </>
      )}

      {companion === 'fox' && (
        <>
          <path d="M 2 5 L 7 0 L 10 5 Z" fill={colors.accent} />
          <path d="M 14 5 L 17 0 L 22 5 Z" fill={colors.accent} />
          <path d="M 3.5 4.5 L 7 1.5 L 8.5 4.5 Z" fill={colors.main} />
          <path d="M 15.5 4.5 L 17 1.5 L 20.5 4.5 Z" fill={colors.main} />
        </>
      )}

      {companion === 'cheetah' && (
        <>
          <circle cx="5" cy="4" r="2.5" fill={colors.accent} />
          <circle cx="19" cy="4" r="2.5" fill={colors.accent} />
        </>
      )}

      {companion === 'panda' && (
        <>
          <circle cx="5" cy="3.5" r="3" fill={colors.accent} />
          <circle cx="19" cy="3.5" r="3" fill={colors.accent} />
        </>
      )}

      {companion === 'rabbit' && (
        <>
          <rect x="5.5" y="0" width="3" height="7.5" rx="1.5" fill={colors.main} />
          <rect x="15.5" y="0" width="3" height="7.5" rx="1.5" fill={colors.main} />
          <rect x="6.5" y="1" width="1" height="5" rx="0.5" fill={colors.accent} />
          <rect x="16.5" y="1" width="1" height="5" rx="0.5" fill={colors.accent} />
        </>
      )}

      {companion === 'hamster' && (
        <>
          <circle cx="5.5" cy="3.5" r="2.2" fill={colors.main} />
          <circle cx="18.5" cy="3.5" r="2.2" fill={colors.main} />
          <circle cx="6.2" cy="4.2" r="1" fill="#F8BBD0" />
          <circle cx="17.8" cy="4.2" r="1" fill="#F8BBD0" />
        </>
      )}

      {companion === 'bear' && (
        <>
          <circle cx="5.5" cy="3.5" r="3" fill={colors.main} />
          <circle cx="18.5" cy="3.5" r="3" fill={colors.main} />
          <circle cx="5.5" cy="3.5" r="1.5" fill={colors.accent} />
          <circle cx="18.5" cy="3.5" r="1.5" fill={colors.accent} />
        </>
      )}

      {companion === 'red_panda' && (
        <>
          <path d="M 3 6 L 7 1 L 10 5 Z" fill={colors.accent} />
          <path d="M 14 5 L 17 1 L 21 6 Z" fill={colors.accent} />
          <path d="M 4.5 5.5 L 7 2.5 L 8.5 4.5 Z" fill="#FFFFFF" />
          <path d="M 15.5 4.5 L 17 2.5 L 19.5 5.5 Z" fill="#FFFFFF" />
        </>
      )}

      {companion === 'robot' && (
        <>
          {/* Side bolts and top antenna */}
          <rect x="0.5" y="8" width="1.5" height="4" rx="0.5" fill={colors.accent} />
          <rect x="22" y="8" width="1.5" height="4" rx="0.5" fill={colors.accent} />
          <line x1="12" y1="4" x2="12" y2="1.5" stroke={colors.accent} strokeWidth="1" />
          <circle cx="12" cy="1.2" r="1.2" fill="#E74C3C" />
        </>
      )}

      {companion === 'alien' && (
        <>
          {/* Antennae */}
          <line x1="8" y1="4" x2="5" y2="1" stroke={colors.main} strokeWidth="1" />
          <circle cx="5" cy="1" r="1" fill={colors.accent} />
          <line x1="16" y1="4" x2="19" y2="1" stroke={colors.main} strokeWidth="1" />
          <circle cx="19" cy="1" r="1" fill={colors.accent} />
        </>
      )}

      {/* 2. MAIN HEAD BODY */}
      {companion === 'ghost' ? (
        <path
          d="M 2 11 rx 7 Q 12 2 22 11 L 22 16 Q 19 18 16 16 Q 12 18 8 16 Q 5 18 2 16 Z"
          fill={colors.main}
          opacity="0.8"
        />
      ) : (
        <rect
          x="2"
          y="4"
          width="20"
          height="14"
          rx={companion === 'robot' ? '3' : '7'}
          fill={colors.main}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.75"
        />
      )}

      {/* 3. COMPANION SPECIFIC OVERLAYS */}
      {companion === 'fox' && (
        <>
          {/* White cheek patches */}
          <path d="M 2.2 13 Q 5 15 8 13.5 Q 6 12 2.2 13 Z" fill="#FFFFFF" opacity="0.85" />
          <path d="M 21.8 13 Q 19 15 16 13.5 Q 18 12 21.8 13 Z" fill="#FFFFFF" opacity="0.85" />
        </>
      )}

      {companion === 'owl' && (
        <>
          {/* Facial eye discs */}
          <circle cx="7" cy="11" r="3.5" fill="#F5F5F5" opacity="0.25" />
          <circle cx="17" cy="11" r="3.5" fill="#F5F5F5" opacity="0.25" />
        </>
      )}

      {companion === 'panda' && (
        <>
          {/* Dark spots around eyes */}
          <ellipse cx="7" cy="11" rx="2.5" ry="3.2" fill={colors.accent} />
          <ellipse cx="17" cy="11" rx="2.5" ry="3.2" fill={colors.accent} />
        </>
      )}

      {companion === 'cheetah' && (
        <>
          {/* Spots */}
          <circle cx="6" cy="6.5" r="0.6" fill="#1A1A1A" />
          <circle cx="18" cy="6.5" r="0.6" fill="#1A1A1A" />
          <circle cx="12" cy="5" r="0.6" fill="#1A1A1A" />
          <circle cx="5" cy="14" r="0.6" fill="#1A1A1A" />
          <circle cx="19" cy="14" r="0.6" fill="#1A1A1A" />
        </>
      )}

      {companion === 'penguin' && (
        <>
          {/* Penguin white belly/face patch */}
          <path d="M 4.5 10 Q 12 7 19.5 10 Q 12 17 4.5 10 Z" fill={colors.accent} opacity="0.9" />
        </>
      )}

      {companion === 'person' && (
        <>
          {/* Hair block */}
          <rect x="2" y="3.5" width="20" height="3" rx="1" fill={colors.accent} />
        </>
      )}

      {companion === 'red_panda' && (
        <>
          {/* Cheek markings */}
          <path d="M 3.8 11.5 L 5.5 13.5 L 4.5 14.5 Z" fill="#FFFFFF" opacity="0.8" />
          <path d="M 20.2 11.5 L 18.5 13.5 L 19.5 14.5 Z" fill="#FFFFFF" opacity="0.8" />
        </>
      )}

      {companion === 'hamster' && (
        <>
          {/* Cute pink hamster cheeks */}
          <circle cx="4.5" cy="13.5" r="1.5" fill="#FFB7B2" opacity="0.8" />
          <circle cx="19.5" cy="13.5" r="1.5" fill="#FFB7B2" opacity="0.8" />
        </>
      )}

      {companion === 'alien' && (
        <>
          {/* Giant black alien eye backing */}
          <ellipse cx="6.5" cy="11" rx="2.5" ry="3.5" fill="#181818" />
          <ellipse cx="17.5" cy="11" rx="2.5" ry="3.5" fill="#181818" />
        </>
      )}

      {/* 4. EYES RENDER ENGINE */}
      {catState === 'sleeping' ? (
        // Sleeping eye arcs
        <>
          <path
            d="M 5.5 11 Q 7 12.5 8.5 11"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 15.5 11 Q 17 12.5 18.5 11"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : clipboardWink ? (
        // Wink mode (Left blinked, right awake)
        <>
          <path
            d="M 5.5 11 H 8.5"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle
            cx={17 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.x}
            cy={11 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.y}
            r={companion === 'alien' ? '1' : '1.5'}
            fill={colors.eye}
          />
        </>
      ) : bluetoothConnected ? (
        // Bluetooth smiley arcs
        <>
          <path
            d="M 5.5 11.5 Q 7 9.5 8.5 11.5"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 15.5 11.5 Q 17 9.5 18.5 11.5"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : isBlinking ? (
        // Blink flat lines
        <>
          <path
            d="M 5.5 11 H 8.5"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M 15.5 11 H 18.5"
            fill="none"
            stroke={colors.eye}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        // Normal awake state with eye tracking
        <>
          <circle
            cx={7 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.x}
            cy={11 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.y}
            r={companion === 'alien' ? '1' : '1.5'}
            fill={colors.eye}
          />
          <circle
            cx={17 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.x}
            cy={11 + (companion === 'alien' ? 0.5 : 1) * eyeOffset.y}
            r={companion === 'alien' ? '1' : '1.5'}
            fill={colors.eye}
          />
        </>
      )}

      {/* 5. NOSE / BEAK / MOUTH */}
      {companion === 'owl' ? (
        // Owl yellow beak
        <path d="M 11 12.5 L 13 12.5 L 12 14.5 Z" fill="#FFD700" />
      ) : companion === 'penguin' ? (
        // Penguin yellow beak
        <path d="M 11 12 L 13 12 L 12 14 Z" fill="#FF9F43" />
      ) : companion === 'robot' ? (
        // Robot rectangular speaker mouth
        <rect x="10" y="14" width="4" height="1" rx="0.5" fill="#4D4D4D" />
      ) : companion === 'ghost' ? (
        // Ghost small cute circular open mouth
        <circle cx="12" cy="13.8" r="1" fill="#2C3E50" />
      ) : companion === 'alien' ? (
        // Alien tiny line smile
        <path d="M 10.5 14 Q 12 15 13.5 14" fill="none" stroke="#181818" strokeWidth="0.75" />
      ) : (
        // Standard nose dot
        <circle
          cx="12"
          cy="13.5"
          r="0.75"
          fill={companion === 'hamster' ? '#FFB7B2' : '#181818'}
        />
      )}
    </svg>
  );
};

export default AnimatedCat;

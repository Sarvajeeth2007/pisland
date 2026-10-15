import React from 'react';
import { useSystemStore } from '../store/systemStore';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Music, RotateCcw, RotateCw } from 'lucide-react';

export const MediaWidget: React.FC = () => {
  const { media, togglePlayPause, nextTrack, prevTrack, setMediaProgress } = useSystemStore();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.round(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const progressPercent = (media.progress / media.duration) * 100;

  const handleSeek = (val: number) => {
    setMediaProgress(val);
  };

  const seekOffset = (offset: number) => {
    setMediaProgress(media.progress + offset);
  };

  return (
    <div className="flex flex-col gap-3.5 p-1 select-none font-sans">
      <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">Now Playing</h3>
      
      <div className="flex items-center gap-4">
        {/* Cover Art (Vinyl Disk animation) */}
        <div className="relative flex-shrink-0 select-none">
          <motion.div
            animate={media.isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={media.isPlaying ? { ease: 'linear', duration: 20, repeat: Infinity } : { duration: 0.5 }}
            className="relative h-14 w-14 rounded-full overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center"
          >
            {media.artwork ? (
              <img 
                src={media.artwork} 
                alt={media.title} 
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-500 rounded-full">
                <Music size={20} />
              </div>
            )}
            
            {/* Vinyl record center hole */}
            <div className="absolute h-3 w-3 bg-[#050505] rounded-full border border-white/20 shadow-inner flex items-center justify-center">
              <div className="h-1 w-1 bg-neutral-800 rounded-full" />
            </div>
          </motion.div>
          
          {/* Playing beats animation */}
          {media.isPlaying && (
            <div className="absolute -bottom-1 -right-1 bg-accent/90 border border-white/10 rounded-full p-1 shadow-md flex items-end justify-center gap-[1px] h-4.5 w-4.5">
              <div className="w-[1.5px] h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-[1.5px] h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></div>
              <div className="w-[1.5px] h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          )}
        </div>

        {/* Details & Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Scroll title if too long */}
          {media.title.length > 20 ? (
            <div className="w-full overflow-hidden relative flex">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ ease: 'linear', duration: 12, repeat: Infinity }}
                className="flex gap-10 whitespace-nowrap text-sm font-semibold text-white tracking-wide pr-10"
              >
                <span>{media.title}</span>
                <span>{media.title}</span>
              </motion.div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-white tracking-wide truncate">{media.title}</div>
          )}
          <div className="truncate text-xs text-neutral-400 mt-0.5">{media.artist}</div>
          
          {/* Controls */}
          <div className="flex items-center gap-3.5 mt-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTrack}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack size={14} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => seekOffset(-10)}
              className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              title="Seek Back 10s"
            >
              <RotateCcw size={12} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={togglePlayPause}
              className="h-7 w-7 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              {media.isPlaying ? <Pause size={12} fill="black" /> : <Play size={12} fill="black" className="ml-0.5" />}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => seekOffset(10)}
              className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              title="Seek Forward 10s"
            >
              <RotateCw size={12} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTrack}
              className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward size={14} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Seek */}
      <div className="flex flex-col gap-1.5 mt-1.5">
        <div className="premium-slider-container w-full h-3">
          <input 
            type="range" 
            min="0" 
            max={media.duration} 
            value={media.progress}
            onChange={(e) => handleSeek(parseInt(e.target.value))}
            className="premium-slider"
            style={{
              '--slider-progress': `${progressPercent}%`
            } as React.CSSProperties}
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono leading-none">
          <span>{formatTime(media.progress)}</span>
          <span>-{formatTime(media.duration - media.progress)}</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useSystemStore } from '../store/systemStore';
import { Cpu, HardDrive, ArrowUp, ArrowDown } from 'lucide-react';

export const SystemStatsWidget: React.FC = () => {
  const { cpuUsage, ramUsage, networkSpeed } = useSystemStore();

  const getStatsColor = (percent: number) => {
    if (percent < 50) return 'stroke-emerald-400 text-emerald-400';
    if (percent < 80) return 'stroke-amber-400 text-amber-400';
    return 'stroke-red-400/90 text-red-400/90';
  };

  // Ring details
  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  const renderProgressRing = (percentage: number, label: string, Icon: any) => {
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const colorClass = getStatsColor(percentage);

    return (
      <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-2xl border border-white/[0.04] flex-1 justify-center">
        <div className="relative h-14 w-14 flex items-center justify-center">
          <svg className="absolute transform -rotate-90 h-full w-full">
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              className="stroke-white/[0.06]" 
              strokeWidth="3" 
              fill="transparent"
            />
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              className={`transition-all duration-1000 ease-out ${colorClass.split(' ')[0]}`}
              strokeWidth="3" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="text-neutral-400 scale-90">
            <Icon size={15} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <span className="text-[9px] text-neutral-500 font-semibold tracking-wider leading-none uppercase">{label}</span>
          <span className={`text-sm font-bold font-mono mt-1 leading-none ${colorClass.split(' ')[1]}`}>{percentage}%</span>
        </div>
      </div>
    );
  };

  const formatSpeed = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 B/s';
    if (bytes < 1024) return `${bytes} B/s`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB/s`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB/s`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB/s`;
  };

  return (
    <div className="flex flex-col gap-3 p-1 select-none font-sans">
      <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">System Monitoring</h3>

      {/* Progress Rings row */}
      <div className="flex flex-wrap gap-2.5">
        {renderProgressRing(cpuUsage, 'CPU', Cpu)}
        {renderProgressRing(ramUsage, 'RAM', HardDrive)}
      </div>

      {/* Network Speeds row */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-black/20 border border-white/[0.04] flex-1 min-w-0">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
            <ArrowDown size={12} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-neutral-500 leading-none uppercase font-semibold">Download</span>
            <span className="text-xs font-mono font-bold text-white mt-1 leading-none truncate">{formatSpeed(networkSpeed.download)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-black/20 border border-white/[0.04] flex-1 min-w-0">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400">
            <ArrowUp size={12} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-neutral-500 leading-none uppercase font-semibold">Upload</span>
            <span className="text-xs font-mono font-bold text-white mt-1 leading-none truncate">{formatSpeed(networkSpeed.upload)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

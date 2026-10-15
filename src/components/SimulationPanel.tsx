import React, { useState } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useThemeStore, ThemeType } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { 
  Sliders, Camera, Battery, Cpu, Wifi, Bluetooth, 
  Volume2, Sun, RefreshCw, X, ChevronRight
} from 'lucide-react';

export const SimulationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    volume, brightness, batteryLevel, isCharging, 
    wifiEnabled, wifiConnected, bluetoothEnabled, bluetoothConnected, 
    setVolume, setBrightness, toggleWifi, toggleBluetooth, 
    updateStats, updateBattery, takeScreenshotSimulated,
    triggerNotification
  } = useSystemStore();

  const { theme, setTheme } = useThemeStore();
  const { resetSettings } = useSettingsStore();

  const [customNotification, setCustomNotification] = useState('');

  const themes: { id: ThemeType; name: string }[] = [
    { id: 'default-dark', name: 'Default Dark' },
    { id: 'light', name: 'Light Mode' },
    { id: 'nothing-os', name: 'Nothing OS' },
    { id: 'glass', name: 'Glassmorphism' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'oled-black', name: 'OLED Black' },
    { id: 'fluent', name: 'Fluent Design' },
    { id: 'minimal', name: 'Minimalist' }
  ];

  const handleCustomNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotification.trim()) return;
    triggerNotification({
      type: 'bluetooth',
      title: 'Alert',
      subtitle: customNotification,
      duration: 3500
    });
    setCustomNotification('');
  };

  return (
    <div className={`fixed right-0 top-0 h-screen z-50 flex items-center transition-all duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[280px]'}`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-neutral-900 border border-r-0 border-white/10 hover:border-white/20 text-neutral-300 p-2.5 rounded-l-2xl shadow-2xl flex items-center justify-center cursor-pointer transition-all"
      >
        {isOpen ? <ChevronRight size={18} /> : <Sliders size={18} />}
      </button>

      {/* Main Panel Content */}
      <div className="w-[280px] h-full bg-neutral-950/90 border-l border-white/10 backdrop-blur-xl p-5 flex flex-col gap-6 text-white text-xs select-none overflow-y-auto font-sans">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 font-semibold text-accent">
            <Sliders size={14} />
            <span>Simulation Panel</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>

        {/* Section: Quick Triggers */}
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-neutral-400">System Actions</span>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={takeScreenshotSimulated}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-left"
            >
              <Camera size={12} className="text-cyan-400" />
              <span>Screenshot</span>
            </button>
            <button 
              onClick={() => {
                triggerNotification({
                  type: 'charging',
                  title: 'Power Connected',
                  subtitle: '80% charged',
                  duration: 3000
                });
                updateBattery(80, true);
              }}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Battery size={12} className="text-emerald-400" />
              <span>Low/Charge</span>
            </button>
          </div>
        </div>

        {/* Section: Themes */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-neutral-400">Pisland Themes</span>
          <div className="grid grid-cols-2 gap-1.5 font-sans">
            {themes.map((t) => (
              <button 
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer text-[10px] ${
                  theme === t.id 
                    ? 'bg-accent/20 border-accent text-white font-medium' 
                    : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section: System Sliders */}
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-neutral-400">Hardware Simulation</span>
          
          {/* Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1"><Volume2 size={10} /> Volume</span>
              <span>{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-accent"
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1"><Sun size={10} /> Brightness</span>
              <span>{brightness}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-accent"
            />
          </div>

          {/* Battery */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1"><Battery size={10} /> Battery Level</span>
              <span>{batteryLevel}% {isCharging ? '(Charging)' : ''}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={batteryLevel}
              onChange={(e) => updateBattery(parseInt(e.target.value), isCharging)}
              className="w-full cursor-pointer accent-accent"
            />
            <label className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isCharging}
                onChange={(e) => updateBattery(batteryLevel, e.target.checked)}
                className="rounded border-white/20 bg-white/5 accent-accent"
              />
              <span>Simulate Charging State</span>
            </label>
          </div>

          {/* CPU / RAM Mock */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 flex items-center gap-1"><Cpu size={10} /> CPU Load Simulator</span>
            <div className="flex gap-1.5 mt-0.5">
              {[15, 45, 85].map((lvl) => (
                <button 
                  key={lvl}
                  onClick={() => updateStats(lvl, lvl - 10 + Math.round(Math.random()*10))}
                  className="flex-1 py-1 rounded bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-[10px] transition-all cursor-pointer"
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
          <span className="font-semibold text-neutral-400">Quick Toggles</span>
          <div className="flex flex-col gap-2">
            <button 
              onClick={toggleWifi}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                wifiEnabled 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-white/5 border-white/5 text-neutral-500'
              }`}
            >
              <span className="flex items-center gap-1.5"><Wifi size={12} /> Wifi</span>
              <span>{wifiEnabled ? (wifiConnected ? 'Connected' : 'On') : 'Off'}</span>
            </button>

            <button 
              onClick={toggleBluetooth}
              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                bluetoothEnabled 
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                  : 'bg-white/5 border-white/5 text-neutral-500'
              }`}
            >
              <span className="flex items-center gap-1.5"><Bluetooth size={12} /> Bluetooth</span>
              <span>{bluetoothEnabled ? (bluetoothConnected ? 'Connected' : 'On') : 'Off'}</span>
            </button>
          </div>
        </div>

        {/* Custom Notification */}
        <form onSubmit={handleCustomNotificationSubmit} className="flex flex-col gap-2 border-t border-white/10 pt-3">
          <span className="font-semibold text-neutral-400">Custom Alert Trigger</span>
          <div className="flex gap-1.5">
            <input 
              type="text" 
              placeholder="Enter message..." 
              value={customNotification}
              onChange={(e) => setCustomNotification(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
            />
            <button type="submit" className="p-1.5 rounded-md bg-accent text-white hover:bg-accent/80 transition-all cursor-pointer">
              Send
            </button>
          </div>
        </form>

        {/* Reset settings */}
        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-neutral-500">
          <span>Pisland Companion</span>
          <button 
            onClick={resetSettings}
            className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
          >
            <RefreshCw size={10} />
            <span>Reset Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../store/systemStore';
import { useSettingsStore } from '../store/settingsStore';
import { 
  Volume2, VolumeX, Sun, Wifi, WifiOff, 
  Bluetooth, Shield, ShieldOff, Mic, MicOff,
  BatteryCharging, Plane, Radio, Moon, Target, 
  BellOff, Circle, RotateCw, Share2, Camera, 
  MousePointer, Keyboard, Plus, RefreshCw, Lock,
  Headphones, Smartphone, Speaker
} from 'lucide-react';

export const QuickControlsWidget: React.FC = () => {
  const {
    volume, setVolume, playbackMuted, togglePlaybackMute,
    brightness, setBrightness,
    wifiEnabled, wifiConnected, wifiName, toggleWifi,
    wifiNetworks, wifiScanning, wifiConnectingSsid,
    scanWifiNetworks, connectWifi, disconnectWifi,
    bluetoothEnabled, bluetoothConnected, bluetoothDevice, toggleBluetooth,
    bluetoothDevices, btScanning, btConnectingId,
    scanBluetoothDevices, connectBluetoothDevice, disconnectBluetoothDevice,
    vpnConnected, toggleVpn,
    microphoneMuted, toggleMicrophone,
    batterySaverActive, toggleBatterySaver,
    airplaneModeActive, toggleAirplaneMode,
    mobileHotspotActive, toggleMobileHotspot,
    nightLightActive, toggleNightLight,
    dndActive, toggleDnd,
    nearbySharingActive, toggleNearbySharing,
    cameraActive, toggleCamera,
    rotationLockActive, rotationLockSupported, toggleRotationLock,
    triggerNotification
  } = useSystemStore();

  const { settings } = useSettingsStore();
  const { enabledQuickControls, quickControlsOrder } = settings;

  const [showPopup, setShowPopup] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'wifi' | 'bluetooth' | null>(null);
  const [selectedSsidForPassword, setSelectedSsidForPassword] = useState<string | null>(null);
  const [wifiPasswordInput, setWifiPasswordInput] = useState('');
  
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!showPopup && !activeDrawer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPopup(false);
        setActiveDrawer(null);
        setSelectedSsidForPassword(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPopup, activeDrawer]);

  // Close on click outside the System Controls card
  useEffect(() => {
    if (!showPopup && !activeDrawer) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowPopup(false);
        setActiveDrawer(null);
        setSelectedSsidForPassword(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPopup, activeDrawer]);

  // Auto scan on drawer open
  useEffect(() => {
    if (activeDrawer === 'wifi') {
      scanWifiNetworks();
    } else if (activeDrawer === 'bluetooth') {
      scanBluetoothDevices();
    }
  }, [activeDrawer]);

  // Local state persistence for simulation toggles
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('pisland-quicktoggles-states');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default fallback
      }
    }
    return {
      'wifi': true,
      'bluetooth': false,
      'vpn': false,
      'microphone': false,
      'battery-saver': false,
      'airplane-mode': false,
      'mobile-hotspot': false,
      'night-light': false,
      'focus-mode': false,
      'dnd': false,
      'screen-record': false,
      'lock-rotation': false,
      'nearby-sharing': false,
      'camera': false,
      'touchpad': false,
      'kb-backlight': false,
    };
  });

  const togglesConfig: Record<string, { label: string, icon: React.ReactNode, active: boolean, colorClass: string, supported?: boolean }> = {
    'wifi': { 
      label: wifiEnabled ? (wifiConnected ? (wifiName ? wifiName.split('_')[0] : 'Connected') : 'On') : 'Off', 
      icon: wifiEnabled ? <Wifi size={15} /> : <WifiOff size={15} />, 
      active: wifiEnabled, 
      colorClass: 'bg-accent/[0.12] border-accent/25 text-accent font-medium' 
    },
    'bluetooth': { 
      label: bluetoothEnabled ? (bluetoothDevice ? bluetoothDevice.split(' ')[0] : 'On') : 'Off', 
      icon: <Bluetooth size={15} className={bluetoothConnected ? 'animate-pulse' : ''} />, 
      active: bluetoothEnabled, 
      colorClass: 'bg-purple-500/[0.12] border-purple-500/25 text-purple-400 font-medium' 
    },
    'vpn': { 
      label: vpnConnected ? 'VPN' : 'Off', 
      icon: vpnConnected ? <Shield size={15} /> : <ShieldOff size={15} />, 
      active: vpnConnected, 
      colorClass: 'bg-emerald-500/[0.12] border-emerald-500/25 text-emerald-400 font-medium' 
    },
    'microphone': { 
      label: microphoneMuted ? 'Muted' : 'On', 
      icon: microphoneMuted ? <MicOff size={15} /> : <Mic size={15} />, 
      active: microphoneMuted, 
      colorClass: 'bg-red-500/[0.12] border-red-500/25 text-red-400 font-medium' 
    },
    'battery-saver': { 
      label: batterySaverActive ? 'Saver' : 'Off', 
      icon: <BatteryCharging size={15} />, 
      active: batterySaverActive, 
      colorClass: 'bg-yellow-500/[0.12] border-yellow-500/25 text-yellow-400 font-medium' 
    },
    'airplane-mode': { 
      label: airplaneModeActive ? 'Flight' : 'Off', 
      icon: <Plane size={15} />, 
      active: airplaneModeActive, 
      colorClass: 'bg-accent/[0.12] border-accent/25 text-accent font-medium' 
    },
    'mobile-hotspot': { 
      label: mobileHotspotActive ? 'Hotspot' : 'Off', 
      icon: <Radio size={15} />, 
      active: mobileHotspotActive, 
      colorClass: 'bg-orange-500/[0.12] border-orange-500/25 text-orange-400 font-medium' 
    },
    'night-light': { 
      label: nightLightActive ? 'Warm' : 'Off', 
      icon: <Moon size={15} />, 
      active: nightLightActive, 
      colorClass: 'bg-amber-400/[0.12] border-amber-400/25 text-amber-400 font-medium',
      supported: false
    },
    'focus-mode': { 
      label: 'Off', 
      icon: <Target size={15} />, 
      active: false, 
      colorClass: 'bg-teal-400/[0.12] border-teal-400/25 text-teal-400 font-medium',
      supported: false
    },
    'dnd': { 
      label: dndActive ? 'Dnd' : 'Off', 
      icon: <BellOff size={15} />, 
      active: dndActive, 
      colorClass: 'bg-red-400/[0.12] border-red-400/25 text-red-400 font-medium' 
    },
    'screen-record': { 
      label: 'Off', 
      icon: <Circle size={15} />, 
      active: false, 
      colorClass: 'bg-red-500/[0.12] border-red-500/25 text-red-400 font-medium',
      supported: false
    },
    'lock-rotation': { 
      label: rotationLockActive ? 'Locked' : 'Off', 
      icon: <RotateCw size={15} />, 
      active: rotationLockActive, 
      colorClass: 'bg-zinc-400/[0.12] border-zinc-400/25 text-zinc-300 font-medium',
      supported: rotationLockSupported
    },
    'nearby-sharing': { 
      label: nearbySharingActive ? 'Nearby' : 'Off', 
      icon: <Share2 size={15} />, 
      active: nearbySharingActive, 
      colorClass: 'bg-zinc-400/[0.12] border-zinc-400/25 text-zinc-300 font-medium' 
    },
    'camera': { 
      label: cameraActive ? 'Cam' : 'Off', 
      icon: <Camera size={15} />, 
      active: cameraActive, 
      colorClass: 'bg-emerald-400/[0.12] border-emerald-400/25 text-emerald-400 font-medium' 
    },
    'touchpad': { 
      label: 'Off', 
      icon: <MousePointer size={15} />, 
      active: false, 
      colorClass: 'bg-zinc-400/[0.12] border-zinc-400/25 text-zinc-300 font-medium',
      supported: false
    },
    'kb-backlight': { 
      label: 'Off', 
      icon: <Keyboard size={15} />, 
      active: false, 
      colorClass: 'bg-accent/[0.12] border-accent/25 text-accent font-medium',
      supported: false
    },
  };

  const renderSlider = (type: 'volume' | 'brightness') => {
    if (!enabledQuickControls[type]) return null;

    if (type === 'volume') {
      return (
        <div className="flex items-center gap-4.5 w-full">
          <button 
            onClick={() => togglePlaybackMute()} 
            title={playbackMuted ? 'Unmute' : 'Mute'}
            className={`w-[36px] h-[36px] min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer ${
              playbackMuted || volume === 0 ? 'text-red-400' : 'text-neutral-300'
            }`}
          >
            {volume === 0 || playbackMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between text-[11px] text-neutral-400 font-sans font-medium">
              <span>Volume</span>
              <span>{playbackMuted ? 'Muted' : `${volume}%`}</span>
            </div>
            <div className="premium-slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="premium-slider w-full cursor-pointer"
                style={{
                  '--slider-progress': `${volume}%`
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-4.5 w-full">
          <button className="w-[36px] h-[36px] min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.06] text-neutral-400 pointer-events-none">
            <Sun size={14} />
          </button>
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between text-[11px] text-neutral-400 font-sans font-medium">
              <span>Brightness</span>
              <span>{brightness}%</span>
            </div>
            <div className="premium-slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="premium-slider w-full cursor-pointer"
                style={{
                  '--slider-progress': `${brightness}%`
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      );
    }
  };

  const renderToggle = (id: string) => {
    const config = togglesConfig[id];
    if (!config) return null;
    const isSupported = config.supported !== false;

    const handleClick = () => {
      if (!isSupported) return;
      if (id === 'wifi') {
        if (activeDrawer === 'wifi') {
          setActiveDrawer(null);
        } else {
          setActiveDrawer('wifi');
          if (!wifiEnabled) toggleWifi();
        }
      } else if (id === 'bluetooth') {
        if (activeDrawer === 'bluetooth') {
          setActiveDrawer(null);
        } else {
          setActiveDrawer('bluetooth');
          if (!bluetoothEnabled) toggleBluetooth();
        }
      }
      else if (id === 'vpn') toggleVpn();
      else if (id === 'microphone') toggleMicrophone();
      else if (id === 'battery-saver') toggleBatterySaver();
      else if (id === 'airplane-mode') toggleAirplaneMode();
      else if (id === 'mobile-hotspot') toggleMobileHotspot();
      else if (id === 'night-light') toggleNightLight();
      else if (id === 'dnd') toggleDnd();
      else if (id === 'nearby-sharing') toggleNearbySharing();
      else if (id === 'camera') toggleCamera();
      else if (id === 'lock-rotation') toggleRotationLock();
      else {
        const nextStates = { ...toggleStates, [id]: !toggleStates[id] };
        setToggleStates(nextStates);
        localStorage.setItem('pisland-quicktoggles-states', JSON.stringify(nextStates));

        const active = nextStates[id];
        const titleMap: Record<string, string> = {
          'battery-saver': 'Battery Saver',
          'airplane-mode': 'Airplane Mode',
          'mobile-hotspot': 'Mobile Hotspot',
          'night-light': 'Night Light',
          'focus-mode': 'Focus Mode',
          'dnd': 'Do Not Disturb',
          'screen-record': 'Screen Recording',
          'lock-rotation': 'Rotation Lock',
          'nearby-sharing': 'Nearby Sharing',
          'camera': 'Camera Access',
          'touchpad': 'Touchpad',
          'kb-backlight': 'Keyboard Backlight',
        };
        
        triggerNotification({
          type: 'bluetooth',
          title: `${titleMap[id] || id} ${active ? 'Enabled' : 'Disabled'}`,
          subtitle: active ? 'Status: Active' : 'Status: Off',
          duration: 2000
        });
      }
    };

    const statusText = isSupported ? (config.active ? 'On' : 'Off') : 'Not Supported';
    const labelMap: Record<string, string> = {
      'wifi': 'Wi-Fi',
      'bluetooth': 'Bluetooth',
      'vpn': 'VPN',
      'microphone': 'Mute'
    };
    const displayName = labelMap[id] || config.label;
    const isDrawerOpen = (id === 'wifi' && activeDrawer === 'wifi') || (id === 'bluetooth' && activeDrawer === 'bluetooth');

    return (
      <button 
        key={id}
        onClick={handleClick}
        title={config.label}
        disabled={!isSupported}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 w-full text-center aspect-[5/6] relative
          ${!isSupported 
            ? 'opacity-40 border-white/[0.02] bg-white/[0.01] text-neutral-600 pointer-events-none'
            : isDrawerOpen
              ? 'bg-accent/25 border-accent text-accent font-semibold cursor-pointer ring-1 ring-accent/50'
              : config.active 
                ? 'bg-accent/15 border-accent/30 text-accent font-semibold cursor-pointer' 
                : 'bg-white/[0.03] border-white/[0.04] text-neutral-400 hover:border-white/[0.08] hover:bg-white/[0.06] cursor-pointer'
          }`}
      >
        <span className={!isSupported ? 'text-neutral-600' : config.active ? 'text-accent' : 'text-neutral-300'}>
          {config.icon}
        </span>
        <span className="text-[9px] font-sans font-semibold mt-1.5 leading-none truncate max-w-full text-neutral-200">
          {displayName}
        </span>
        <span className="text-[8px] font-sans font-medium mt-0.5 leading-none text-neutral-500">
          {statusText}
        </span>
      </button>
    );
  };

  const renderGridToggle = (id: string, index?: number, total?: number) => {
    const config = togglesConfig[id];
    if (!config) return null;
    const isSupported = config.supported !== false;

    const handleClick = () => {
      if (!isSupported) return;
      if (id === 'wifi') {
        if (activeDrawer === 'wifi') setActiveDrawer(null);
        else { setActiveDrawer('wifi'); if (!wifiEnabled) toggleWifi(); }
      } else if (id === 'bluetooth') {
        if (activeDrawer === 'bluetooth') setActiveDrawer(null);
        else { setActiveDrawer('bluetooth'); if (!bluetoothEnabled) toggleBluetooth(); }
      }
      else if (id === 'vpn') toggleVpn();
      else if (id === 'microphone') toggleMicrophone();
      else if (id === 'battery-saver') toggleBatterySaver();
      else if (id === 'airplane-mode') toggleAirplaneMode();
      else if (id === 'mobile-hotspot') toggleMobileHotspot();
      else if (id === 'night-light') toggleNightLight();
      else if (id === 'dnd') toggleDnd();
      else if (id === 'nearby-sharing') toggleNearbySharing();
      else if (id === 'camera') toggleCamera();
      else if (id === 'lock-rotation') toggleRotationLock();
      else {
        const nextStates = { ...toggleStates, [id]: !toggleStates[id] };
        setToggleStates(nextStates);
        localStorage.setItem('pisland-quicktoggles-states', JSON.stringify(nextStates));

        const active = nextStates[id];
        const titleMap: Record<string, string> = {
          'battery-saver': 'Battery Saver',
          'airplane-mode': 'Airplane Mode',
          'mobile-hotspot': 'Mobile Hotspot',
          'night-light': 'Night Light',
          'focus-mode': 'Focus Mode',
          'dnd': 'Do Not Disturb',
          'screen-record': 'Screen Recording',
          'lock-rotation': 'Rotation Lock',
          'nearby-sharing': 'Nearby Sharing',
          'camera': 'Camera Access',
          'touchpad': 'Touchpad',
          'kb-backlight': 'Keyboard Backlight',
        };
        
        triggerNotification({
          type: 'bluetooth',
          title: `${titleMap[id] || id} ${active ? 'Enabled' : 'Disabled'}`,
          subtitle: active ? 'Status: Active' : 'Status: Off',
          duration: 2000
        });
      }
    };

    const labelOverrideMap: Record<string, string> = {
      'battery-saver': 'Battery Saver',
      'airplane-mode': 'Airplane Mode',
      'mobile-hotspot': 'Mobile Hotspot',
      'night-light': 'Night Light',
      'focus-mode': 'Focus Assist',
      'dnd': 'Do Not Disturb',
      'screen-record': 'Screen Record',
      'lock-rotation': 'Rotation Lock',
      'nearby-sharing': 'Nearby Share',
      'camera': 'Camera',
      'touchpad': 'Touchpad',
      'kb-backlight': 'Backlight',
    };
    const displayName = labelOverrideMap[id] || config.label;
    const isLoneLastItem = typeof index === 'number' && typeof total === 'number' && total % 5 === 1 && index === total - 1;

    return (
      <motion.button 
        key={id}
        onClick={handleClick}
        disabled={!isSupported}
        whileHover={isSupported ? { 
          scale: 1.03, 
          backgroundColor: config.active ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)' 
        } : undefined}
        whileTap={isSupported ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 450, damping: 18 }}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-colors duration-200 text-center aspect-square
          ${!isSupported 
            ? 'opacity-40 border-white/[0.02] bg-white/[0.01] text-neutral-600 pointer-events-none'
            : config.active 
              ? 'bg-white/[0.08] border-white/20 text-white shadow-md cursor-pointer' 
              : 'bg-white/[0.02] border-white/[0.04] text-neutral-400 hover:border-white/[0.08] cursor-pointer'
          }
          ${isLoneLastItem ? 'col-span-5 justify-self-center w-[calc(20%-8px)]' : 'w-full'}
        `}
      >
        <span className={`transition-colors ${!isSupported ? 'text-neutral-600' : config.active ? 'text-accent' : 'text-neutral-400'}`}>
          {React.cloneElement(config.icon as React.ReactElement<{ size?: number }>, { size: 12 })}
        </span>
        <span className="text-[8.5px] font-sans font-semibold mt-1 leading-tight truncate max-w-full text-neutral-200">
          {displayName}
        </span>
        {!isSupported && (
          <span className="text-[7.5px] font-sans font-medium text-neutral-500 mt-0.5 leading-none">
            N/A
          </span>
        )}
        {isSupported && config.active && (
          <span className="w-1 h-1 rounded-full bg-accent mt-0.5 animate-pulse" />
        )}
      </motion.button>
    );
  };

  const enabledToggles = quickControlsOrder.filter(id => enabledQuickControls[id]);
  const showSliders = enabledQuickControls['volume'] || enabledQuickControls['brightness'];

  const visibleToggles = enabledToggles.slice(0, 4);
  const collapsedToggles = enabledToggles.length > 4 
    ? enabledToggles.slice(4)
    : quickControlsOrder.filter(id => !visibleToggles.includes(id));

  const gridColsClass = 
    visibleToggles.length === 0 ? 'grid-cols-1' :
    visibleToggles.length === 1 ? 'grid-cols-2' :
    visibleToggles.length === 2 ? 'grid-cols-3' :
    visibleToggles.length === 3 ? 'grid-cols-4' : 'grid-cols-5';

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Audio': return <Headphones size={13} />;
      case 'Phone': return <Smartphone size={13} />;
      case 'Speaker': return <Speaker size={13} />;
      case 'Input': return <MousePointer size={13} />;
      default: return <Bluetooth size={13} />;
    }
  };

  return (
    <div ref={widgetRef} className="flex flex-col gap-5 p-1 text-sm select-none font-sans w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">System Controls</h3>
        {activeDrawer && (
          <button 
            onClick={() => { setActiveDrawer(null); setSelectedSsidForPassword(null); }} 
            className="text-[10px] text-accent hover:underline cursor-pointer"
          >
            Back to Toggles
          </button>
        )}
      </div>

      {/* WI-FI NETWORK DRAWER PANEL */}
      {activeDrawer === 'wifi' && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-col gap-3 bg-black/30 p-3 rounded-2xl border border-white/10 w-full"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-accent" />
              <span className="font-semibold text-xs text-neutral-200">Wi-Fi Networks</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scanWifiNetworks()} 
                title="Scan networks"
                className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-all cursor-pointer ${
                  wifiScanning ? 'animate-spin text-accent' : ''
                }`}
              >
                <RefreshCw size={12} />
              </button>
              <button 
                onClick={() => toggleWifi()}
                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                  wifiEnabled ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-neutral-400'
                }`}
              >
                {wifiEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {wifiNetworks.length === 0 ? (
              <div className="text-center py-4 text-xs text-neutral-500">
                {wifiScanning ? 'Scanning nearby Wi-Fi networks...' : 'No Wi-Fi networks found.'}
              </div>
            ) : (
              wifiNetworks.map((net) => {
                const isConnecting = wifiConnectingSsid === net.ssid;
                const isShowPassword = selectedSsidForPassword === net.ssid;

                return (
                  <div 
                    key={net.ssid}
                    className={`flex flex-col p-2.5 rounded-xl border transition-all ${
                      net.is_connected 
                        ? 'bg-accent/15 border-accent/40 text-white' 
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Wifi size={13} className={net.is_connected ? 'text-accent' : 'text-neutral-400'} />
                        <span className="font-semibold text-xs truncate">{net.ssid}</span>
                        {net.is_secured && <Lock size={10} className="text-neutral-500" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-neutral-400">{net.signal_strength}%</span>
                        
                        {net.is_connected ? (
                          <button 
                            onClick={() => disconnectWifi(net.ssid)}
                            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-semibold cursor-pointer transition-all"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (net.is_saved || !net.is_secured) {
                                connectWifi(net.ssid);
                              } else {
                                setSelectedSsidForPassword(isShowPassword ? null : net.ssid);
                                setWifiPasswordInput('');
                              }
                            }}
                            disabled={isConnecting}
                            className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 text-[10px] font-semibold cursor-pointer transition-all disabled:opacity-50"
                          >
                            {isConnecting ? 'Connecting...' : net.is_saved ? 'Connect' : net.is_secured ? 'Join' : 'Connect'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline password dialog for password protected networks */}
                    {isShowPassword && !net.is_connected && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-2 items-center mt-2 pt-2 border-t border-white/10"
                      >
                        <input 
                          type="password" 
                          placeholder="Enter Wi-Fi password..." 
                          value={wifiPasswordInput}
                          onChange={(e) => setWifiPasswordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              connectWifi(net.ssid, wifiPasswordInput);
                              setSelectedSsidForPassword(null);
                            }
                          }}
                          className="flex-1 bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent"
                        />
                        <button 
                          onClick={() => {
                            connectWifi(net.ssid, wifiPasswordInput);
                            setSelectedSsidForPassword(null);
                          }}
                          className="px-3 py-1 rounded-lg bg-accent text-black font-semibold text-xs cursor-pointer hover:bg-white transition-all"
                        >
                          Connect
                        </button>
                        <button 
                          onClick={() => setSelectedSsidForPassword(null)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-neutral-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* BLUETOOTH DEVICE DRAWER PANEL */}
      {activeDrawer === 'bluetooth' && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-col gap-3 bg-black/30 p-3 rounded-2xl border border-white/10 w-full"
        >
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bluetooth size={14} className="text-purple-400" />
              <span className="font-semibold text-xs text-neutral-200">Bluetooth Devices</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scanBluetoothDevices()} 
                title="Scan Bluetooth devices"
                className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-all cursor-pointer ${
                  btScanning ? 'animate-spin text-purple-400' : ''
                }`}
              >
                <RefreshCw size={12} />
              </button>
              <button 
                onClick={() => toggleBluetooth()}
                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                  bluetoothEnabled ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-white/5 border-white/10 text-neutral-400'
                }`}
              >
                {bluetoothEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {bluetoothDevices.length === 0 ? (
              <div className="text-center py-4 text-xs text-neutral-500">
                {btScanning ? 'Searching Bluetooth devices...' : 'No Bluetooth devices found.'}
              </div>
            ) : (
              bluetoothDevices.map((dev) => {
                const isConnecting = btConnectingId === dev.id;

                return (
                  <div 
                    key={dev.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      dev.is_connected 
                        ? 'bg-purple-500/15 border-purple-500/40 text-white' 
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={dev.is_connected ? 'text-purple-400' : 'text-neutral-400'}>
                        {getDeviceIcon(dev.device_type)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs truncate leading-tight">{dev.name}</span>
                        <span className="text-[8.5px] text-neutral-500 leading-tight">
                          {dev.is_connected ? 'Connected' : dev.is_paired ? 'Paired' : 'Available'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {dev.is_connected ? (
                        <button 
                          onClick={() => disconnectBluetoothDevice(dev.id, dev.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-semibold cursor-pointer transition-all"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button 
                          onClick={() => connectBluetoothDevice(dev.id, dev.name)}
                          disabled={isConnecting}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-semibold cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* MAIN QUICK TOGGLES ROW */}
      {!activeDrawer && enabledToggles.length > 0 && (
        <div className="w-full flex flex-col gap-1.5">
          <div className={`grid ${gridColsClass} gap-2.5 mt-1 relative w-full`}>
            {visibleToggles.map(id => renderToggle(id))}
            
            <button 
              key="more-button"
              onClick={() => setShowPopup(!showPopup)}
              className="w-full flex flex-col items-center justify-center p-2 rounded-2xl border cursor-pointer aspect-[5/6] bg-white/[0.03] border-white/[0.04] text-neutral-400 hover:border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300"
            >
              <Plus 
                size={15} 
                className={`transition-transform duration-300 ${showPopup ? 'rotate-45 text-accent' : 'text-neutral-400'}`} 
              />
              <span className="text-[9px] font-sans font-semibold mt-1.5 leading-none text-neutral-200">
                More
              </span>
              <span className="text-[8px] font-sans font-medium mt-0.5 leading-none opacity-0 select-none">
                -
              </span>
            </button>
          </div>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showPopup ? 'auto' : 0, 
              opacity: showPopup ? 1 : 0 
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden w-full"
          >
            <div className="py-2 flex flex-col gap-2.5 w-full">
              <div className="grid grid-cols-3 min-[320px]:grid-cols-4 min-[420px]:grid-cols-5 gap-2.5 w-full justify-center">
                {collapsedToggles.map((id, index) => renderGridToggle(id, index, collapsedToggles.length))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* VOLUME & BRIGHTNESS SLIDERS */}
      {!activeDrawer && showSliders && (
        <div className="flex flex-col gap-7 mt-1.5 w-full">
          {renderSlider('volume')}
          {renderSlider('brightness')}
        </div>
      )}

      {!showSliders && enabledToggles.length === 0 && !activeDrawer && (
        <div className="text-center text-neutral-500 text-xs py-2">
          No controls enabled. Customize in Settings.
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, Bluetooth, Battery, BatteryCharging, 
  Clock, ChevronUp, ChevronDown, Sparkles, ShieldCheck, HelpCircle, HardDrive, Bell, CheckCircle, Zap, Globe, GripVertical,
  Pin, Smile
} from 'lucide-react';
import { SettingsButton } from './components/SettingsButton';
import { BackButton } from './components/BackButton';
import { useSystemStore } from './store/systemStore';
import { useThemeStore } from './store/themeStore';
import { useSettingsStore } from './store/settingsStore';
import { WIDGET_COMPONENTS } from './widgets';
import { SimulationPanel } from './components/SimulationPanel';
import { AnimatedCat } from './components/AnimatedCat';
import { NotificationCard } from './components/NotificationCard';

const companionsList = [
  { id: 'cat', name: 'Cat', previewEmoji: '🐱' },
  { id: 'dog', name: 'Dog', previewEmoji: '🐶' },
  { id: 'owl', name: 'Owl', previewEmoji: '🦉' },
  { id: 'fox', name: 'Fox', previewEmoji: '🦊' },
  { id: 'cheetah', name: 'Cheetah', previewEmoji: '🐆' },
  { id: 'panda', name: 'Panda', previewEmoji: '🐼' },
  { id: 'penguin', name: 'Penguin', previewEmoji: '🐧' },
  { id: 'rabbit', name: 'Rabbit', previewEmoji: '🐰' },
  { id: 'hamster', name: 'Hamster', previewEmoji: '🐹' },
  { id: 'bear', name: 'Bear', previewEmoji: '🐻' },
  { id: 'red_panda', name: 'Red Panda', previewEmoji: '🦝' },
  { id: 'person', name: 'Person', previewEmoji: '🧍' },
  { id: 'robot', name: 'Robot', previewEmoji: '🤖' },
  { id: 'ghost', name: 'Ghost', previewEmoji: '👻' },
  { id: 'alien', name: 'Alien', previewEmoji: '👽' }
];

const contentVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  animate: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    filter: 'blur(4px)',
  }),
};

const contentTransition = {
  x: { type: 'spring' as const, stiffness: 220, damping: 24, mass: 0.95 },
  opacity: { duration: 0.25 },
  filter: { duration: 0.25 },
};

const App: React.FC = () => {
  const { 
    batteryLevel, isCharging, wifiConnected, wifiName, 
    bluetoothConnected, bluetoothDevice, activeNotification, clearNotification, triggerNotification,
    notificationHistory, clearNotificationHistory, media
  } = useSystemStore();

  const { theme } = useThemeStore();
  const { 
    settings, updateSetting, toggleWidget, toggleQuickControl, reorderQuickControls, togglePinWidget 
  } = useSettingsStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings'>('widgets');
  const [currentTime, setCurrentTime] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const direction = activeTab === 'settings' ? 1 : -1;
  const [expandedCategory, setExpandedCategory] = useState<string | null>('general');

  // Sync calendar events from localStorage for Smart Stack
  useEffect(() => {
    const loadEvents = () => {
      try {
        const saved = localStorage.getItem('pisland-planner-events');
        if (saved) setEvents(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };
    loadEvents();
    const interval = setInterval(loadEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  // Helper to load settings from localStorage with defaults
  const loadSavedSettings = <T,>(key: string, defaults: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(`Failed to load ${key}`, e);
    }
    return defaults;
  };

  const [generalSettings, setGeneralSettings] = useState(() => 
    loadSavedSettings('pisland-general-settings', {
      launchOnStartup: true,
      minimizeToTray: true,
      autoUpdates: true,
      restoreSession: false,
      timeFormat: '12h',
      alwaysOnTop: true,
    })
  );

  const [appearanceSettings, setAppearanceSettings] = useState(() => 
    loadSavedSettings('pisland-appearance-settings', {
      theme: 'default-dark',
      accentColor: '#F2F2F2',
      cornerRadius: 32,
      shadowIntensity: 'high',
      fontSize: 'medium',
      fontFamily: 'Outfit',
      iconStyle: 'outline',
      widgetDensity: 'spacious',
    })
  );

  const [animSettings, setAnimSettings] = useState(() => 
    loadSavedSettings('pisland-anim-settings', {
      springs: true,
      reduceMotion: false,
      blurStrength: 80,
      cursorTracking: 75,
    })
  );

  const [companionSettings, setCompanionSettings] = useState(() => 
    loadSavedSettings('pisland-companion-settings', {
      enableCat: true,
      enableEyes: false,
      enableClassicDot: false,
      animFreq: 50,
      cursorTracking: true,
      sleepMode: false,
      soundReactions: true,
      notifReactions: true,
      activeCompanion: 'cat',
    })
  );

  const [notifSettings, setNotifSettings] = useState(() => 
    loadSavedSettings('pisland-notif-settings', {
      enable: true,
      sound: true,
      dnd: false,
      priority: true,
    })
  );

  const [musicSettings, setMusicSettings] = useState(() => 
    loadSavedSettings('pisland-music-settings', {
      source: 'Spotify',
      autoDetect: true,
      artQuality: 'high',
      smoothProgress: true,
      mediaKeys: true,
    })
  );

  const [privacySettings, setPrivacySettings] = useState(() => 
    loadSavedSettings('pisland-privacy-settings', {
      localOnly: true,
      history: true,
      telemetry: false,
      crashReports: false,
    })
  );

  const [accessSettings, setAccessSettings] = useState(() => 
    loadSavedSettings('pisland-access-settings', {
      highContrast: false,
      largerText: false,
      kbdNav: true,
    })
  );


  interface LayoutProfile {
    id: string;
    name: string;
    widgetOrder: string[];
    widgetSizes: Record<string, 'small' | 'medium' | 'large'>;
    enabledWidgets: Record<string, boolean>;
    theme: string;
    opacity: number;
    blurAmount: number;
    accentColor: string;
  }

  // Layout profiles state
  const [profiles, setProfiles] = useState<LayoutProfile[]>(() => {
    const saved = localStorage.getItem('pisland-profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse profiles", e);
      }
    }
    return [
      {
        id: 'work',
        name: 'Work',
        widgetOrder: ['calendar', 'system-stats', 'clipboard', 'quick-controls'],
        widgetSizes: { calendar: 'large', 'system-stats': 'medium', clipboard: 'medium', 'quick-controls': 'large' },
        enabledWidgets: { calendar: true, 'system-stats': true, clipboard: true, 'quick-controls': true, weather: false, media: false },
        theme: 'default-dark', opacity: 0.9, blurAmount: 30, accentColor: '#F2F2F2'
      },
      {
        id: 'study',
        name: 'Study',
        widgetOrder: ['calendar', 'clipboard', 'weather'],
        widgetSizes: { calendar: 'medium', clipboard: 'medium', weather: 'large' },
        enabledWidgets: { calendar: true, clipboard: true, weather: true, 'system-stats': false, 'quick-controls': false, media: false },
        theme: 'nothing-os', opacity: 0.85, blurAmount: 20, accentColor: '#ef4444'
      },
      {
        id: 'gaming',
        name: 'Gaming',
        widgetOrder: ['system-stats', 'quick-controls'],
        widgetSizes: { 'system-stats': 'large', 'quick-controls': 'large' },
        enabledWidgets: { 'system-stats': true, 'quick-controls': true, calendar: false, clipboard: false, weather: false, media: false },
        theme: 'fluent', opacity: 0.75, blurAmount: 15, accentColor: '#10b981'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        widgetOrder: ['weather', 'media'],
        widgetSizes: { weather: 'medium', media: 'medium' },
        enabledWidgets: { weather: true, media: true, 'system-stats': false, 'quick-controls': false, calendar: false, clipboard: false },
        theme: 'default-dark', opacity: 0.95, blurAmount: 40, accentColor: '#8b5cf6'
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        widgetOrder: ['media', 'weather'],
        widgetSizes: { media: 'large', weather: 'large' },
        enabledWidgets: { media: true, weather: true, 'system-stats': false, 'quick-controls': false, calendar: false, clipboard: false },
        theme: 'fluent', opacity: 0.8, blurAmount: 25, accentColor: '#f59e0b'
      }
    ];
  });
  
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('pisland-active-profile') || 'work';
  });

  const [newProfileName, setNewProfileName] = useState('');

  const [showAdvancedGeneral, setShowAdvancedGeneral] = useState(false);
  const [showAdvancedWidgets, setShowAdvancedWidgets] = useState(false);
  const [showAdvancedMedia, setShowAdvancedMedia] = useState(false);
  const [expandedAdvancedSub, setExpandedAdvancedSub] = useState<string | null>(null);

  // Edit layout mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempWidgetOrder, setTempWidgetOrder] = useState<string[]>([]);
  const [tempWidgetSizes, setTempWidgetSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
  const [tempEnabledWidgets, setTempEnabledWidgets] = useState<Record<string, boolean>>({});

  const { setTheme } = useThemeStore();

  const applyProfile = (profile: LayoutProfile) => {
    setActiveProfileId(profile.id);
    localStorage.setItem('pisland-active-profile', profile.id);
    
    updateSetting('widgetOrder', profile.widgetOrder);
    updateSetting('widgetSizes', profile.widgetSizes);
    updateSetting('enabledWidgets', profile.enabledWidgets);
    updateSetting('opacity', profile.opacity);
    updateSetting('blurAmount', profile.blurAmount);
    updateSetting('accentColor', profile.accentColor);
    
    setTheme(profile.theme as any);
  };

  // Mount effect to restore profile
  useEffect(() => {
    const savedActiveId = localStorage.getItem('pisland-active-profile') || 'work';
    const savedProfiles = localStorage.getItem('pisland-profiles');
    let loadedProfiles = profiles;
    if (savedProfiles) {
      try {
        loadedProfiles = JSON.parse(savedProfiles);
      } catch (e) {}
    }
    const currentProfile = loadedProfiles.find(p => p.id === savedActiveId);
    if (currentProfile) {
      applyProfile(currentProfile);
    }
  }, []);

  const startEditMode = () => {
    setTempWidgetOrder([...(settings.widgetOrder || ['quick-controls', 'media', 'clipboard', 'system-stats', 'weather', 'calendar'])]);
    setTempWidgetSizes({ ...(settings.widgetSizes || {}) });
    setTempEnabledWidgets({ ...settings.enabledWidgets });
    setIsEditMode(true);
  };

  const handleSaveLayout = () => {
    updateSetting('widgetOrder', tempWidgetOrder);
    updateSetting('widgetSizes', tempWidgetSizes);
    updateSetting('enabledWidgets', tempEnabledWidgets);
    
    const updatedProfiles = profiles.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          widgetOrder: tempWidgetOrder,
          widgetSizes: tempWidgetSizes,
          enabledWidgets: tempEnabledWidgets
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    localStorage.setItem('pisland-profiles', JSON.stringify(updatedProfiles));
    
    setIsEditMode(false);
    triggerNotification({
      type: 'screenshot',
      title: 'Layout Saved',
      subtitle: 'Widget configurations successfully updated',
      duration: 2500
    });
  };

  const handleDiscardLayout = () => {
    setIsEditMode(false);
  };

  const handleResetLayout = () => {
    const defaultOrder = ['quick-controls', 'media', 'clipboard', 'system-stats', 'weather', 'calendar'];
    const defaultSizes = {
      'quick-controls': 'large' as const,
      'media': 'large' as const,
      'system-stats': 'medium' as const,
      'weather': 'medium' as const,
      'calendar': 'medium' as const,
      'clipboard': 'medium' as const,
    };
    const defaultEnabled = {
      'quick-controls': true,
      'media': true,
      'clipboard': true,
      'system-stats': true,
      'weather': true,
      'calendar': true,
    };
    setTempWidgetOrder(defaultOrder);
    setTempWidgetSizes(defaultSizes);
    setTempEnabledWidgets(defaultEnabled);
  };

  const handleSwapGridWidgets = (idxA: number, idxB: number, orderArray: string[]) => {
    const nextOrder = [...orderArray];
    const temp = nextOrder[idxA];
    nextOrder[idxA] = nextOrder[idxB];
    nextOrder[idxB] = temp;
    setTempWidgetOrder(['quick-controls', 'media', ...nextOrder]);
  };

  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    if (!tempEnabledWidgets[draggedWidgetId]) {
      const newEnabled = { ...tempEnabledWidgets };
      newEnabled[draggedWidgetId] = true;
      setTempEnabledWidgets(newEnabled);
    }

    const currentOrder = [...tempWidgetOrder];
    const topWidgets = ['quick-controls', 'media'];
    const gridWidgetsOrder = currentOrder.filter(id => !topWidgets.includes(id));
    const allGridWidgets = ['system-stats', 'weather', 'calendar', 'clipboard'];
    const missingWidgets = allGridWidgets.filter(id => !gridWidgetsOrder.includes(id));
    const activeGridOrder = [...gridWidgetsOrder, ...missingWidgets];

    const idxA = activeGridOrder.indexOf(draggedWidgetId);
    const idxB = activeGridOrder.indexOf(targetId);
    
    if (idxA !== -1 && idxB !== -1) {
      const nextGridOrder = [...activeGridOrder];
      nextGridOrder[idxA] = targetId;
      nextGridOrder[idxB] = draggedWidgetId;
      setTempWidgetOrder(['quick-controls', 'media', ...nextGridOrder]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
  };

  // Detect if running in Tauri native mode
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  // 1. General Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-general-settings', JSON.stringify(generalSettings));
    
    // Side effect: Launch on Startup
    if (isTauri) {
      import('@tauri-apps/api/core').then((m) => {
        m.invoke('set_launch_on_startup', { enabled: generalSettings.launchOnStartup }).catch(console.error);
      });
    }
    
    // Side effect: Always on Top
    if (isTauri) {
      import('@tauri-apps/api/window').then((m) => {
        m.getCurrentWindow().setAlwaysOnTop(generalSettings.alwaysOnTop).catch(console.error);
      });
    }
  }, [generalSettings]);

  // 2. Appearance Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-appearance-settings', JSON.stringify(appearanceSettings));
    
    // Side effect: Apply Theme to HTML attribute & store
    setTheme(appearanceSettings.theme as any);
    
    // Side effect: Accent Color synchronization
    updateSetting('accentColor', appearanceSettings.accentColor);
  }, [appearanceSettings]);

  // 3. Animation Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-anim-settings', JSON.stringify(animSettings));
  }, [animSettings]);

  // 4. Companion Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-companion-settings', JSON.stringify(companionSettings));
  }, [companionSettings]);

  // 5. Notification Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-notif-settings', JSON.stringify(notifSettings));
  }, [notifSettings]);

  // 6. Music Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-music-settings', JSON.stringify(musicSettings));
  }, [musicSettings]);

  // 7. Privacy Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-privacy-settings', JSON.stringify(privacySettings));
  }, [privacySettings]);

  // 8. Accessibility Settings Effect
  useEffect(() => {
    localStorage.setItem('pisland-access-settings', JSON.stringify(accessSettings));
  }, [accessSettings]);

  // Clock Helper for Blinking Colon
  const renderClockString = (timeStr: string) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parts[0];
    const rest = parts.slice(1).join(':');
    return (
      <span className="inline-flex items-center">
        <span>{hours}</span>
        <span className="animate-clock-blink mx-[0.5px]">:</span>
        <span>{rest}</span>
      </span>
    );
  };

  // Clock Update Loop
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const is12h = generalSettings.timeFormat === '12h';
      setCurrentTime(date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: is12h 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [generalSettings.timeFormat]);

  // Auto collapse timer
  useEffect(() => {
    if (isExpanded && settings.autoCollapse) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 30000); // Collapse after 30 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [isExpanded, settings.autoCollapse]);

  // Premium Spring animations slowed down by 25% for a calmer, more luxurious feel
  const getSpringConfig = () => {
    switch (settings.animationSpeed) {
      case 'fast': return { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 };
      case 'slow': return { type: 'spring' as const, stiffness: 110, damping: 20, mass: 1.25 };
      case 'normal':
      default: return { type: 'spring' as const, stiffness: 200, damping: 24, mass: 0.95 };
    }
  };

  const springTransition = getSpringConfig();
  const collapsedTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 24,
    mass: 0.65
  };

  // Helper to get active style override based on settings
  const calculatedBlur = settings.blurAmount * (animSettings.blurStrength / 100) + (isHovered && !isExpanded ? 4 : 0);
  const islandStyle: React.CSSProperties = {
    backgroundColor: isExpanded
      ? 'rgba(var(--bg-island-rgb, 5, 5, 5), var(--opacity, 0.85))'
      : isHovered
        ? 'rgba(255, 255, 255, 0.09)'
        : 'rgba(var(--bg-island-rgb, 5, 5, 5), var(--opacity, 0.82))',
    backdropFilter: `blur(${calculatedBlur}px)`,
    WebkitBackdropFilter: `blur(${calculatedBlur}px)`,
    borderColor: isHovered && !isExpanded ? 'rgba(255, 255, 255, 0.18)' : 'var(--border-island)',
    borderRadius: isExpanded ? `${appearanceSettings.cornerRadius}px` : '9999px',
    fontFamily: appearanceSettings.fontFamily,
    boxShadow: isHovered && !isExpanded 
      ? '0 12px 30px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.08)' 
      : 'none',
    // @ts-ignore
    '--opacity': settings.opacity,
  };

  const moveControl = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.quickControlsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      reorderQuickControls(newOrder);
    }
  };

  const renderSettingsContent = () => {
    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => {
      return (
        <motion.button 
          type="button"
          onClick={onChange}
          whileHover={{ scale: 1.04, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            backgroundColor: checked ? settings.accentColor : '#2A2A2A',
            boxShadow: checked ? `0 0 8px ${settings.accentColor}50` : 'none',
            borderColor: checked ? `${settings.accentColor}80` : 'rgba(255,255,255,0.08)'
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`relative w-10 h-5.5 rounded-full border cursor-pointer flex-shrink-0 flex items-center transition-all duration-200 ${checked ? 'justify-end pr-[3px]' : 'justify-start pl-[3px]'}`}
        >
          {accessSettings.highContrast && (
            <span className={`absolute text-[7px] font-bold select-none transition-all ${checked ? 'left-1 text-white/90' : 'right-1 text-neutral-400'}`}>
              {checked ? 'ON' : 'OFF'}
            </span>
          )}
          <motion.span 
            layout
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_1.5px_3.5px_rgba(0,0,0,0.45)] block"
          />
        </motion.button>
      );
    };

    const categories = [
      {
        id: 'general-interface',
        title: 'General & Interface',
        icon: <CheckCircle size={14} className="text-blue-400" />,
        content: (
          <div className="flex flex-col gap-3.5">
            {/* Primary Settings */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span>Theme</span>
                <select 
                  value={appearanceSettings.theme}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                >
                  <option value="default-dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                  <option value="nothing-os">Nothing OS</option>
                  <option value="fluent">Windows Fluent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span>Accent Color</span>
                <div className="flex gap-2.5 mt-1">
                  {['#F2F2F2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, accentColor: color })}
                      style={{ backgroundColor: color }}
                      className="w-5 h-5 rounded-full border border-white/20 shadow-md cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                    >
                      {appearanceSettings.accentColor === color && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Corner Radius</span>
                  <span>{appearanceSettings.cornerRadius}px</span>
                </div>
                <input 
                  type="range" min="0" max="48" value={appearanceSettings.cornerRadius}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, cornerRadius: parseInt(e.target.value) })}
                  className="w-full cursor-pointer accent-accent"
                />
              </div>

              <div className="flex justify-between items-center">
                <span>Always on Top</span>
                <ToggleSwitch checked={generalSettings.alwaysOnTop} onChange={() => setGeneralSettings({ ...generalSettings, alwaysOnTop: !generalSettings.alwaysOnTop })} />
              </div>

              <div className="flex justify-between items-center">
                <span>Launch on Startup</span>
                <ToggleSwitch checked={generalSettings.launchOnStartup} onChange={() => setGeneralSettings({ ...generalSettings, launchOnStartup: !generalSettings.launchOnStartup })} />
              </div>
            </div>

            {/* Expandable Advanced Sub-section */}
            <div className="border-t border-white/[0.04] pt-2 mt-1">
              <button 
                onClick={() => setShowAdvancedGeneral(!showAdvancedGeneral)}
                className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                <span>Advanced Interface Settings</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvancedGeneral ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvancedGeneral && (
                <div className="flex flex-col gap-3 mt-3 pl-1 border-l border-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <span>Time Format</span>
                    <select 
                      value={generalSettings.timeFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="12h">12-Hour</option>
                      <option value="24h">24-Hour</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Minimize to Tray</span>
                    <ToggleSwitch checked={generalSettings.minimizeToTray} onChange={() => setGeneralSettings({ ...generalSettings, minimizeToTray: !generalSettings.minimizeToTray })} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Auto Updates</span>
                    <ToggleSwitch checked={generalSettings.autoUpdates} onChange={() => setGeneralSettings({ ...generalSettings, autoUpdates: !generalSettings.autoUpdates })} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Restore Previous Session</span>
                    <ToggleSwitch checked={generalSettings.restoreSession} onChange={() => setGeneralSettings({ ...generalSettings, restoreSession: !generalSettings.restoreSession })} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Shadow Intensity</span>
                    <select 
                      value={appearanceSettings.shadowIntensity}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, shadowIntensity: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="low">Low Shadow</option>
                      <option value="medium">Medium Shadow</option>
                      <option value="high">High Shadow</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Font Size</span>
                    <select 
                      value={appearanceSettings.fontSize}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Font Family</span>
                    <select 
                      value={appearanceSettings.fontFamily}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontFamily: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Sans-serif">Sans-Serif</option>
                      <option value="Monospace">Monospace</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Widget Density</span>
                    <select 
                      value={appearanceSettings.widgetDensity}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, widgetDensity: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="compact">Compact</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Base Width</span>
                      <span>{settings.width}px</span>
                    </div>
                    <input 
                      type="range" min="280" max="480" value={settings.width}
                      onChange={(e) => updateSetting('width', parseInt(e.target.value))}
                      className="w-full cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Expanded Width</span>
                      <span>{settings.expandedWidth}px</span>
                    </div>
                    <input 
                      type="range" min="420" max="650" value={settings.expandedWidth}
                      onChange={(e) => updateSetting('expandedWidth', parseInt(e.target.value))}
                      className="w-full cursor-pointer accent-accent"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-white/[0.03] pt-2.5">
                    <span>Seasonal Theme</span>
                    <select 
                      value={settings.seasonalThemeMode}
                      onChange={(e) => updateSetting('seasonalThemeMode', e.target.value as any)}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="auto">Auto (Current Date)</option>
                      <option value="winter">Winter Theme</option>
                      <option value="spring">Spring Theme</option>
                      <option value="summer">Summer Theme</option>
                      <option value="autumn">Autumn Theme</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-white/[0.03] pt-2.5">
                    <div className="flex justify-between items-center">
                      <span>Adaptive Transparency</span>
                      <ToggleSwitch 
                        checked={settings.adaptiveTransparency} 
                        onChange={() => {
                          alert("Adaptive Transparency (Wallpaper brightness adjustment) is disabled to respect your privacy. Adjusting transparency dynamically would require screen capture or local file system read permissions.");
                        }} 
                      />
                    </div>
                    <span className="text-[8px] text-neutral-500 leading-normal">Requires screen capture permissions. Disabled by default to stay sandboxed.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        id: 'widgets',
        title: 'Widgets',
        icon: <HardDrive size={14} className="text-violet-400" />,
        content: (
          <div className="flex flex-col gap-3.5">
            {/* Active Widgets */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Active Widgets</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(settings.enabledWidgets).map((widgetId) => (
                  <label 
                    key={widgetId} 
                    className="flex items-center gap-2 p-2 rounded-lg bg-black/35 border border-white/[0.04] hover:border-white/[0.08] cursor-pointer"
                  >
                    <ToggleSwitch 
                      checked={settings.enabledWidgets[widgetId]} 
                      onChange={() => toggleWidget(widgetId)} 
                    />
                    <span className="capitalize text-[10px]">{widgetId.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Automatic Profile Switching */}
            <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Automatic Profile Switching</span>
              <div className="flex justify-between items-center">
                <span>Enable Auto-Switching</span>
                <ToggleSwitch 
                  checked={settings.autoProfileSwitching} 
                  onChange={() => {
                    if (!settings.autoProfileSwitching) {
                      alert("Automatic Profile Switching requires running processes monitoring permissions to detect when games or study apps launch. Enabling this is disabled by default to maintain your Privacy Sandbox. You can switch profiles manually.");
                    } else {
                      updateSetting('autoProfileSwitching', false);
                    }
                  }} 
                />
              </div>
              <span className="text-[8px] text-neutral-500 leading-normal">Requires scanning active applications on your system. Disabled by default to protect your privacy.</span>
            </div>

            {/* Layout Profiles Selection */}
            <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Layout Profile</span>
              <div className="grid grid-cols-2 gap-2">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyProfile(p)}
                    className={`px-3 py-1.5 rounded-xl text-left border transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${p.id === activeProfileId ? 'bg-accent/15 border-accent text-white shadow-md' : 'bg-black/20 border-white/[0.04] text-neutral-400 hover:border-white/[0.08]'}`}
                  >
                    <span>{p.name}</span>
                    {p.id === activeProfileId && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Advanced Sub-section */}
            <div className="border-t border-white/[0.04] pt-2 mt-1">
              <button 
                onClick={() => setShowAdvancedWidgets(!showAdvancedWidgets)}
                className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                <span>Advanced Widget Settings</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvancedWidgets ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvancedWidgets && (
                <div className="flex flex-col gap-3.5 mt-3 pl-1 border-l border-white/[0.04]">
                  {/* Create Profile */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-semibold">Create New Profile:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New profile name..."
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                      />
                      <button
                        onClick={() => {
                          if (!newProfileName.trim()) return;
                          const newProfile = {
                            id: 'profile-' + Date.now(),
                            name: newProfileName.trim(),
                            widgetOrder: [...settings.widgetOrder],
                            widgetSizes: { ...(settings.widgetSizes || {}) },
                            enabledWidgets: { ...settings.enabledWidgets },
                            theme: theme,
                            opacity: settings.opacity,
                            blurAmount: settings.blurAmount,
                            accentColor: settings.accentColor
                          };
                          const nextProfiles = [...profiles, newProfile];
                          setProfiles(nextProfiles);
                          localStorage.setItem('pisland-profiles', JSON.stringify(nextProfiles));
                          applyProfile(newProfile);
                          setNewProfileName('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-accent text-white hover:bg-accent/80 transition-all font-semibold text-xs cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const current = profiles.find(p => p.id === activeProfileId);
                        if (!current) return;
                        const newName = prompt("Rename profile:", current.name);
                        if (newName && newName.trim()) {
                          const nextProfiles = profiles.map(p => p.id === activeProfileId ? { ...p, name: newName.trim() } : p);
                          setProfiles(nextProfiles);
                          localStorage.setItem('pisland-profiles', JSON.stringify(nextProfiles));
                        }
                      }}
                      className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Rename
                    </button>
                    <button
                      disabled={profiles.length <= 1}
                      onClick={() => {
                        if (profiles.length <= 1) return;
                        const nextProfiles = profiles.filter(p => p.id !== activeProfileId);
                        setProfiles(nextProfiles);
                        localStorage.setItem('pisland-profiles', JSON.stringify(nextProfiles));
                        applyProfile(nextProfiles[0]);
                      }}
                      className="py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/10 text-center cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-colors text-[10px]"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        const current = profiles.find(p => p.id === activeProfileId);
                        if (!current) return;
                        navigator.clipboard.writeText(JSON.stringify(current, null, 2)).then(() => {
                          alert("Profile configuration copied to clipboard!");
                        });
                      }}
                      className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Export
                    </button>
                  </div>

                  {/* Quick Controls ordering checklist */}
                  <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-2">
                    <span className="font-semibold text-neutral-400 text-[10px]">Quick Controls Ordering</span>
                    <div className="flex flex-col gap-1.5">
                      {settings.quickControlsOrder.map((controlId, index) => (
                        <div 
                          key={controlId}
                          className="flex justify-between items-center p-2 rounded-lg bg-black/35 border border-white/[0.04]"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <ToggleSwitch 
                              checked={settings.enabledQuickControls[controlId]} 
                              onChange={() => toggleQuickControl(controlId)} 
                            />
                            <span className="capitalize font-mono text-[10px]">{controlId}</span>
                          </label>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => moveControl(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button 
                              onClick={() => moveControl(index, 'down')}
                              disabled={index === settings.quickControlsOrder.length - 1}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layout editor triggers */}
                  <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3">
                    <button
                      onClick={() => {
                        setIsExpanded(true);
                        setActiveTab('widgets');
                        startEditMode();
                      }}
                      className="w-full py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-accent/20"
                    >
                      <Sparkles size={13} /> Custom Layout Editor
                    </button>
                    <button
                      onClick={() => {
                        const defaultOrder = ['quick-controls', 'media', 'clipboard', 'system-stats', 'weather', 'calendar'];
                        const defaultSizes = {
                          'quick-controls': 'large' as const,
                          'media': 'large' as const,
                          'system-stats': 'medium' as const,
                          'weather': 'medium' as const,
                          'calendar': 'medium' as const,
                          'clipboard': 'medium' as const,
                        };
                        const defaultEnabled = {
                          'quick-controls': true,
                          'media': true,
                          'clipboard': true,
                          'system-stats': true,
                          'weather': true,
                          'calendar': true,
                        };
                        updateSetting('widgetOrder', defaultOrder);
                        updateSetting('widgetSizes', defaultSizes);
                        updateSetting('enabledWidgets', defaultEnabled);
                        updateSetting('width', 380);
                        updateSetting('expandedWidth', 520);
                        updateSetting('opacity', 0.85);
                        updateSetting('blurAmount', 24);
                      }}
                      className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer text-xs font-semibold"
                    >
                      Reset Default Layout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        id: 'companions',
        title: 'Companions',
        icon: <Smile size={14} className="text-emerald-400" />,
        content: (
          <div className="flex flex-col gap-3.5 max-h-[330px] overflow-y-auto pr-0.5 custom-scrollbar pb-2">
            <div className="flex flex-col gap-2 bg-black/20 p-2.5 rounded-2xl border border-white/[0.04]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[11px] text-neutral-300">Enable Companion</span>
                <ToggleSwitch 
                  checked={companionSettings.enableCat} 
                  onChange={() => setCompanionSettings({ ...companionSettings, enableCat: !companionSettings.enableCat })} 
                />
              </div>
              <span className="text-[8.5px] text-neutral-500 leading-normal">
                Render an interactive desktop companion inside the dynamic island capsule.
              </span>
            </div>

            {companionSettings.enableCat && (
              <>
                {/* Advanced Settings */}
                <div className="flex flex-col gap-3 bg-black/20 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Mascot Preferences</span>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>Mascot Frequency</span>
                      <span>{companionSettings.animFreq}%</span>
                    </div>
                    <input 
                      type="range" min="10" max="100" value={companionSettings.animFreq}
                      onChange={(e) => setCompanionSettings({ ...companionSettings, animFreq: parseInt(e.target.value) })}
                      className="w-full cursor-pointer accent-accent"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-300">
                    <span>Mascot Cursor Tracking</span>
                    <ToggleSwitch checked={companionSettings.cursorTracking} onChange={() => setCompanionSettings({ ...companionSettings, cursorTracking: !companionSettings.cursorTracking })} />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-300">
                    <span>Sleep Mode</span>
                    <ToggleSwitch checked={companionSettings.sleepMode} onChange={() => setCompanionSettings({ ...companionSettings, sleepMode: !companionSettings.sleepMode })} />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-300">
                    <span>Sound & Music Reactions</span>
                    <ToggleSwitch checked={companionSettings.soundReactions} onChange={() => setCompanionSettings({ ...companionSettings, soundReactions: !companionSettings.soundReactions })} />
                  </div>
                </div>

                {/* Companion Gallery Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Companion Library</span>
                  <div className="grid grid-cols-3 gap-2">
                    {companionsList.map(c => {
                      const isActive = (settings.activeCompanion || companionSettings.activeCompanion) === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            updateSetting('activeCompanion', c.id as any);
                            setCompanionSettings({ ...companionSettings, activeCompanion: c.id as any });
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer aspect-square relative hover:scale-105 duration-200
                            ${isActive 
                              ? 'bg-accent/15 border-accent text-white shadow-md' 
                              : 'bg-black/20 border-white/[0.04] text-neutral-400 hover:border-white/[0.08]'
                            }
                          `}
                        >
                          {/* Live preview container */}
                          <div className="w-10 h-8 flex items-center justify-center mb-1">
                            <AnimatedCat isHovered={true} type={c.id} />
                          </div>
                          <span className="text-[9px] font-sans font-semibold text-center leading-none text-neutral-300 truncate max-w-full">
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      },
      {
        id: 'media-notifications',
        title: 'Media & Notifications',
        icon: <Bell size={14} className="text-teal-400" />,
        content: (
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <span>Preferred Music Source</span>
              <select 
                value={musicSettings.source}
                onChange={(e) => setMusicSettings({ ...musicSettings, source: e.target.value })}
                className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
              >
                <option value="Spotify">Spotify Desktop</option>
                <option value="Apple Music">Apple Music</option>
                <option value="System Audio">System Audio</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span>Enable Notifications</span>
              <ToggleSwitch checked={notifSettings.enable} onChange={() => setNotifSettings({ ...notifSettings, enable: !notifSettings.enable })} />
            </div>

            <div className="flex justify-between items-center">
              <span>Do Not Disturb</span>
              <ToggleSwitch checked={notifSettings.dnd} onChange={() => setNotifSettings({ ...notifSettings, dnd: !notifSettings.dnd })} />
            </div>

            {/* Expandable Advanced Sub-section */}
            <div className="border-t border-white/[0.04] pt-2 mt-1">
              <button 
                onClick={() => setShowAdvancedMedia(!showAdvancedMedia)}
                className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                <span>Advanced Media & Alerts</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvancedMedia ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvancedMedia && (
                <div className="flex flex-col gap-3.5 mt-3 pl-1 border-l border-white/[0.04]">
                  <div className="flex justify-between items-center">
                    <span>Auto Detect Media</span>
                    <ToggleSwitch checked={musicSettings.autoDetect} onChange={() => setMusicSettings({ ...musicSettings, autoDetect: !musicSettings.autoDetect })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Smooth Progress Animation</span>
                    <ToggleSwitch checked={musicSettings.smoothProgress} onChange={() => setMusicSettings({ ...musicSettings, smoothProgress: !musicSettings.smoothProgress })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Media Key Support</span>
                    <ToggleSwitch checked={musicSettings.mediaKeys} onChange={() => setMusicSettings({ ...musicSettings, mediaKeys: !musicSettings.mediaKeys })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Album Art Quality</span>
                    <select 
                      value={musicSettings.artQuality}
                      onChange={(e) => setMusicSettings({ ...musicSettings, artQuality: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                    >
                      <option value="low">Standard (Low)</option>
                      <option value="medium">Optimized (Medium)</option>
                      <option value="high">High Definition</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Notification Sound</span>
                    <ToggleSwitch checked={notifSettings.sound} onChange={() => setNotifSettings({ ...notifSettings, sound: !notifSettings.sound })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Priority Notifications</span>
                    <ToggleSwitch checked={notifSettings.priority} onChange={() => setNotifSettings({ ...notifSettings, priority: !notifSettings.priority })} />
                  </div>

                  <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-3 mt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Local Notification History</span>
                      {(notificationHistory || []).length > 0 && (
                        <button
                          onClick={clearNotificationHistory}
                          className="px-2 py-0.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-[9px] font-bold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {(notificationHistory || []).length === 0 ? (
                      <span className="text-[9px] text-neutral-500 italic py-1">No logged notifications on device.</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-0.5 mt-1 border border-white/[0.02] bg-white/[0.01] rounded-xl p-1.5">
                        {notificationHistory.map((item, idx) => (
                          <div key={item.id || idx} className="flex justify-between items-start text-[9px] py-1 border-b border-white/[0.02] last:border-b-0">
                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                              <span className="text-white font-semibold leading-normal">{item.title}</span>
                              {item.subtitle && <span className="text-neutral-500 leading-normal">{item.subtitle}</span>}
                            </div>
                            <span className="text-neutral-600 font-mono select-none capitalize">{item.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        id: 'advanced',
        title: 'Advanced Settings',
        icon: <Zap size={14} className="text-amber-400" />,
        content: (
          <div className="flex flex-col gap-3">
            {[
              {
                id: 'sub-animations',
                title: 'Animations',
                icon: <Zap size={12} className="text-amber-400" />,
                content: (
                  <div className="flex flex-col gap-3.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span>Animation Speed</span>
                      <select 
                        value={settings.animationSpeed}
                        onChange={(e) => updateSetting('animationSpeed', e.target.value as 'slow' | 'normal' | 'fast')}
                        className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 focus:outline-none focus:border-accent text-white cursor-pointer text-[11px]"
                      >
                        <option value="slow">Calm (Slow)</option>
                        <option value="normal">Default (Normal)</option>
                        <option value="fast">Instant (Fast)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Enable Springs</span>
                      <ToggleSwitch checked={animSettings.springs} onChange={() => setAnimSettings({ ...animSettings, springs: !animSettings.springs })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Reduce Motion</span>
                      <ToggleSwitch checked={animSettings.reduceMotion} onChange={() => setAnimSettings({ ...animSettings, reduceMotion: !animSettings.reduceMotion })} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Blur Strength</span>
                        <span>{animSettings.blurStrength}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={animSettings.blurStrength}
                        onChange={(e) => setAnimSettings({ ...animSettings, blurStrength: parseInt(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Cursor Tracking Speed</span>
                        <span>{animSettings.cursorTracking}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={animSettings.cursorTracking}
                        onChange={(e) => setAnimSettings({ ...animSettings, cursorTracking: parseInt(e.target.value) })}
                        className="w-full cursor-pointer accent-accent"
                      />
                    </div>
                  </div>
                )
              },
              {
                id: 'sub-privacy',
                title: 'Privacy & Security',
                icon: <ShieldCheck size={12} className="text-emerald-400" />,
                content: (
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="flex justify-between items-center">
                      <span>Local Data Only</span>
                      <ToggleSwitch checked={privacySettings.localOnly} onChange={() => setPrivacySettings({ ...privacySettings, localOnly: !privacySettings.localOnly })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Clipboard History</span>
                      <ToggleSwitch checked={privacySettings.history} onChange={() => setPrivacySettings({ ...privacySettings, history: !privacySettings.history })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Share Telemetry</span>
                      <ToggleSwitch checked={privacySettings.telemetry} onChange={() => setPrivacySettings({ ...privacySettings, telemetry: !privacySettings.telemetry })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Crash Reports</span>
                      <ToggleSwitch checked={privacySettings.crashReports} onChange={() => setPrivacySettings({ ...privacySettings, crashReports: !privacySettings.crashReports })} />
                    </div>
                  </div>
                )
              },
              {
                id: 'sub-accessibility',
                title: 'Accessibility',
                icon: <Globe size={12} className="text-cyan-400" />,
                content: (
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="flex justify-between items-center">
                      <span>High Contrast UI</span>
                      <ToggleSwitch checked={accessSettings.highContrast} onChange={() => setAccessSettings({ ...accessSettings, highContrast: !accessSettings.highContrast })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Larger Text Size</span>
                      <ToggleSwitch checked={accessSettings.largerText} onChange={() => setAccessSettings({ ...accessSettings, largerText: !accessSettings.largerText })} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Keyboard Navigation</span>
                      <ToggleSwitch checked={accessSettings.kbdNav} onChange={() => setAccessSettings({ ...accessSettings, kbdNav: !accessSettings.kbdNav })} />
                    </div>
                  </div>
                )
              },
              {
                id: 'sub-backup',
                title: 'Backup & Sync',
                icon: <HardDrive size={12} className="text-amber-500" />,
                content: (
                  <div className="flex flex-col gap-3 pt-1">
                    <span className="text-[10px] text-neutral-500 leading-normal">Export or import your entire configuration (all layout profiles and options).</span>
                    <button
                      onClick={() => {
                        const data = {
                          settings: settings,
                          profiles: profiles,
                          activeProfileId: activeProfileId,
                          generalSettings: generalSettings,
                          appearanceSettings: appearanceSettings,
                          animSettings: animSettings,
                          companionSettings: companionSettings,
                          notifSettings: notifSettings,
                          musicSettings: musicSettings,
                          accessSettings: accessSettings,
                          privacySettings: privacySettings
                        };
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
                          alert("Backup JSON copied to clipboard!");
                        });
                      }}
                      className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                    >
                      Copy Backup JSON
                    </button>
                    <div className="flex flex-col gap-1.5 border-t border-white/[0.04] pt-2">
                      <span className="text-[9px] text-neutral-500">Restore Backup JSON:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste backup JSON..."
                          id="import-backup-input"
                          className="flex-1 bg-black/45 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => {
                            const el = document.getElementById('import-backup-input') as HTMLInputElement;
                            if (!el || !el.value.trim()) return;
                            try {
                              const parsed = JSON.parse(el.value.trim());
                              if (parsed && parsed.settings) {
                                Object.keys(parsed.settings).forEach((k) => {
                                  updateSetting(k as any, parsed.settings[k]);
                                });
                                if (parsed.profiles) {
                                  setProfiles(parsed.profiles);
                                  localStorage.setItem('pisland-profiles', JSON.stringify(parsed.profiles));
                                }
                                if (parsed.activeProfileId) {
                                  setActiveProfileId(parsed.activeProfileId);
                                  localStorage.setItem('pisland-active-profile', parsed.activeProfileId);
                                }
                                if (parsed.generalSettings) localStorage.setItem('pisland-general-settings', JSON.stringify(parsed.generalSettings));
                                if (parsed.appearanceSettings) localStorage.setItem('pisland-appearance-settings', JSON.stringify(parsed.appearanceSettings));
                                if (parsed.animSettings) localStorage.setItem('pisland-anim-settings', JSON.stringify(parsed.animSettings));
                                if (parsed.companionSettings) localStorage.setItem('pisland-companion-settings', JSON.stringify(parsed.companionSettings));
                                if (parsed.notifSettings) localStorage.setItem('pisland-notif-settings', JSON.stringify(parsed.notifSettings));
                                if (parsed.musicSettings) localStorage.setItem('pisland-music-settings', JSON.stringify(parsed.musicSettings));
                                if (parsed.accessSettings) localStorage.setItem('pisland-access-settings', JSON.stringify(parsed.accessSettings));
                                if (parsed.privacySettings) localStorage.setItem('pisland-privacy-settings', JSON.stringify(parsed.privacySettings));
                                alert("Backup restored successfully!");
                                el.value = '';
                                window.location.reload();
                              } else {
                                alert("Invalid backup format.");
                              }
                            } catch (e) {
                              alert("Restore failed.");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent/80 transition-all cursor-pointer text-xs"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'sub-about',
                title: 'About Pisland',
                icon: <HelpCircle size={12} className="text-neutral-400" />,
                content: (
                  <div className="flex flex-col gap-2 pt-1 text-center items-center py-2.5">
                    <span className="text-xs font-bold text-white">Pisland Companion v2.2</span>
                    <span className="text-[10px] text-neutral-400 leading-normal max-w-[180px]">Minimal & Premium Desktop Dynamic Island Companion for Windows.</span>
                    <div className="flex gap-2 mt-2 w-full">
                      <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer text-[10px] font-semibold text-white">Check Updates</button>
                      <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer text-[10px] font-semibold text-white">Changelog</button>
                    </div>
                  </div>
                )
              }
            ].map(sub => (
              <div key={sub.id} className="border border-white/[0.03] rounded-xl bg-white/[0.01] overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedAdvancedSub(expandedAdvancedSub === sub.id ? null : sub.id)}
                  className="w-full flex items-center justify-between p-3 text-left font-medium text-white hover:bg-white/[0.02] cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    {sub.icon}
                    <span className="text-[11px] font-semibold text-neutral-300">{sub.title}</span>
                  </div>
                  <ChevronDown size={11} className={`text-neutral-500 transition-transform duration-200 ${expandedAdvancedSub === sub.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedAdvancedSub === sub.id && (
                  <div className="p-3 pt-1.5 border-t border-white/[0.02] bg-black/10 flex flex-col gap-3 text-xs text-neutral-300">
                    {sub.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    ];

    return (
      <div className="flex flex-col gap-3 font-sans w-full">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-white/[0.04] rounded-2xl bg-black/25 overflow-hidden transition-all duration-300">
            <button 
              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                {cat.icon}
                <span className="text-xs font-semibold tracking-wide text-neutral-200">{cat.title}</span>
              </div>
              {expandedCategory === cat.id ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
            </button>
            
            {expandedCategory === cat.id && (
              <div className="p-4 pt-1 border-t border-white/[0.03] flex flex-col gap-4 text-xs text-neutral-300 bg-white/[0.01]">
                {cat.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Seasonal Themes calculation
  const getActiveSeason = () => {
    if (settings.seasonalThemeMode !== 'auto') return settings.seasonalThemeMode;
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };
  const activeSeason = getActiveSeason();

  // Collapsed View Adaptive Widths (15% scaled up)
  const getCollapsedWidth = () => {
    let baseWidth = 207; // default clock layout width
    if (hasNotification) return 483;
    else if (media.isPlaying) baseWidth = 334;
    else if (isCharging || batteryLevel < 20) baseWidth = 242;
    else {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodayEvent = events.some(ev => ev.date === todayStr && !ev.completed);
      if (hasTodayEvent) baseWidth = 276;
    }
    // 5-8% width increase on hover:
    return isHovered ? Math.round(baseWidth * 1.07) : baseWidth;
  };

  // Collapsed View Adaptive Height
  const getCollapsedHeight = () => {
    if (hasNotification) {
      return activeNotification && activeNotification.type === 'screenshot' ? 84 : 56;
    }
    const baseHeight = settings.height === 48 ? 44 : settings.height;
    // 3-5% height increase on hover:
    return isHovered ? Math.round(baseHeight * 1.04) : baseHeight;
  };

  // Collapsed View content state routing
  const renderCollapsedContent = () => {
    if (media.isPlaying) {
      const currentTrack = `${media.title} - ${media.artist}`;
      return (
        <div className="w-full flex items-center justify-between px-7 py-2.5 h-full select-none">
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`flex items-center text-neutral-300 transition-all duration-300 ${isHovered ? 'gap-3.5' : 'gap-2.5'}`}
          >
            <span className="animate-spin text-accent font-bold text-[10px]" style={{ animationDuration: '4s' }}>🎵</span>
          </motion.div>
          
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-center"
          >
            {companionSettings.enableCat ? <AnimatedCat isHovered={isHovered} /> : <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </motion.div>

          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="text-[10px] font-sans font-medium text-neutral-300 truncate max-w-[190px] tracking-wide"
          >
            {currentTrack}
          </motion.div>
        </div>
      );
    }
    
    if (isCharging || batteryLevel < 20) {
      return (
        <div className="w-full flex items-center justify-between px-7 py-2.5 h-full select-none">
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`flex items-center text-neutral-300 transition-all duration-300 ${isHovered ? 'gap-3' : 'gap-2'}`}
          >
            {isCharging ? '⚡' : '⚠️'}
          </motion.div>

          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-center"
          >
            {companionSettings.enableCat ? <AnimatedCat isHovered={isHovered} /> : <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </motion.div>

          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="text-[10px] font-sans font-medium text-neutral-300"
          >
            {isCharging ? 'Charging' : 'Low Battery'} ({batteryLevel}%)
          </motion.div>
        </div>
      );
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    const nextEvent = events.find(ev => ev.date === todayStr && !ev.completed);
    if (nextEvent) {
      return (
        <div className="w-full flex items-center justify-between px-7 py-2.5 h-full select-none">
          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`flex items-center text-accent transition-all duration-300 ${isHovered ? 'gap-3' : 'gap-2'}`}
          >
            📅
          </motion.div>

          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-center"
          >
            {companionSettings.enableCat ? <AnimatedCat isHovered={isHovered} /> : <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </motion.div>

          <motion.div 
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="text-[10px] font-sans font-medium text-neutral-300 truncate max-w-[150px] tracking-wide"
          >
            {nextEvent.title}
          </motion.div>
        </div>
      );
    }
    
    // Default clock layout (Proportional padding and hover gaps)
    return (
      <div className="w-full flex items-center justify-between px-7 py-2 h-full select-none">
        {/* Left Section: Time */}
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={`flex items-center font-sans font-normal text-xs text-neutral-300 tracking-wide transition-all duration-300 ${isHovered ? 'gap-3.5' : 'gap-2.5'}`}
        >
          <Clock size={13} className="text-neutral-400" />
          <span>{renderClockString(currentTime || '12:00 PM')}</span>
        </motion.div>

        {/* Center Section: Cat Mascot */}
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="flex items-center justify-center"
        >
          {companionSettings.enableCat ? (
            <AnimatedCat isHovered={isHovered} />
          ) : companionSettings.enableClassicDot ? (
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ backgroundColor: settings.accentColor }} />
          ) : companionSettings.enableEyes ? (
            <div className="flex gap-1 items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-bounce" style={{ animationDelay: '150ms' }} />
            </div>
          ) : null}
        </motion.div>

        {/* Right Section: System Indicators */}
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={`flex items-center text-neutral-300 transition-all duration-300 ${isHovered ? 'gap-4.5' : 'gap-3.5'}`}
        >
          {wifiConnected && (
            <span title={wifiName}>
              <Wifi size={13} className="text-neutral-400" />
            </span>
          )}
          {bluetoothConnected && (
            <span title={bluetoothDevice}>
              <Bluetooth size={13} className="text-purple-400" />
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {isCharging ? (
              <BatteryCharging size={13} className="text-emerald-400" />
            ) : (
              <Battery size={13} className={batteryLevel < 20 ? 'text-red-500' : 'text-neutral-400'} />
            )}
            <span className="text-[10px] font-sans font-medium">{batteryLevel}%</span>
          </div>
        </motion.div>
      </div>
    );
  };




  const renderWidgetsGrid = () => {
    const topWidgets = ['quick-controls', 'media'];
    
    // Grid widgets order list (excluding controls and media player)
    const rawOrder = isEditMode ? tempWidgetOrder : (settings.widgetOrder || []);
    const gridWidgetsOrder = rawOrder.filter(id => !topWidgets.includes(id));
    
    // Default fallback if some widgets are missing
    const allGridWidgets = ['system-stats', 'weather', 'calendar', 'clipboard'];
    const missingWidgets = allGridWidgets.filter(id => !gridWidgetsOrder.includes(id));
    const activeGridOrderUnsorted = [...gridWidgetsOrder, ...missingWidgets];
    let activeGridOrder = activeGridOrderUnsorted;
    
    if (!isEditMode) {
      const pinned = activeGridOrderUnsorted.filter(id => settings.pinnedWidgets[id]);
      const unpinned = activeGridOrderUnsorted.filter(id => !settings.pinnedWidgets[id]);
      
      const prioritized: string[] = [];
      if (batteryLevel < 20 && unpinned.includes('system-stats')) {
        prioritized.push('system-stats');
      }
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodayEvent = events.some(ev => ev.date === todayStr && !ev.completed);
      if (hasTodayEvent && unpinned.includes('calendar')) {
        prioritized.push('calendar');
      }
      
      const remaining = unpinned.filter(id => !prioritized.includes(id));
      activeGridOrder = [...pinned, ...prioritized, ...remaining];
    }

    const activeSizes = isEditMode ? tempWidgetSizes : (settings.widgetSizes || {});
    const activeEnabled = isEditMode ? tempEnabledWidgets : (settings.enabledWidgets || {});

    // Filter out widgets that are currently hidden
    const hiddenWidgets = allGridWidgets.filter(id => !activeEnabled[id]);

    const density = appearanceSettings.widgetDensity;
    const densityGapClass = 
      density === 'compact' 
        ? 'gap-2.5' 
        : density === 'spacious' 
          ? 'gap-6' 
          : 'gap-4';

    return (
      <div className={`flex flex-col ${densityGapClass} font-sans w-full select-none`}>
        {/* Edit Layout Mode Banner */}
        {isEditMode && (
          <div className="flex flex-col gap-2 p-3.5 bg-accent/15 border border-accent/20 rounded-2xl mb-2 font-sans text-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Edit Layout Mode Active
                </span>
                <span className="text-[9px] text-neutral-400">Drag by handles to swap, click size, or Hide</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveLayout}
                  className="px-3 py-1.5 bg-accent hover:bg-accent/80 text-white font-semibold rounded-xl cursor-pointer text-[10px] transition-all"
                >
                  Save Layout
                </button>
                <button 
                  onClick={handleDiscardLayout}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 cursor-pointer text-[10px] transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleResetLayout}
                  className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 cursor-pointer text-[10px] transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Save Changes? layout helper */}
            <div className="text-[9px] text-neutral-500 border-t border-white/[0.04] pt-2 flex justify-between items-center">
              <span>Save changes? Changes will be written to the active layout profile.</span>
            </div>
          </div>
        )}

        {/* 1. TOP SECTION: Quick System Controls (Always pinned first if enabled) */}
        {activeEnabled['quick-controls'] && (
          <div className="border border-white/[0.06] rounded-2xl bg-black/[0.30] p-4 relative hover:border-white/[0.12] transition-all duration-300 w-full min-w-0">
            <div className={isEditMode ? 'pointer-events-none filter blur-[0.5px] opacity-60' : ''}>
              {WIDGET_COMPONENTS['quick-controls'] && React.createElement(WIDGET_COMPONENTS['quick-controls'])}
            </div>
            
            {/* Edit overlay for visibility only */}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2.5 border border-accent/20 z-20 transition-all duration-300">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Quick Controls (Pinned)</span>
                <button
                  onClick={() => {
                    const newEnabled = { ...tempEnabledWidgets };
                    newEnabled['quick-controls'] = false;
                    setTempEnabledWidgets(newEnabled);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[10px] font-semibold border border-red-500/10 transition-all cursor-pointer"
                >
                  Hide Widget
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. SECOND SECTION: Media Player (Always below controls if enabled) */}
        {activeEnabled['media'] && (
          <div className="border border-white/[0.06] rounded-2xl bg-black/[0.30] p-4 relative hover:border-white/[0.12] transition-all duration-300 w-full min-w-0">
            <div className={isEditMode ? 'pointer-events-none filter blur-[0.5px] opacity-60' : ''}>
              {WIDGET_COMPONENTS['media'] && React.createElement(WIDGET_COMPONENTS['media'])}
            </div>
            
            {/* Edit overlay for visibility only */}
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2.5 border border-accent/20 z-20 transition-all duration-300">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Media Player (Pinned)</span>
                <button
                  onClick={() => {
                    const newEnabled = { ...tempEnabledWidgets };
                    newEnabled['media'] = false;
                    setTempEnabledWidgets(newEnabled);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[10px] font-semibold border border-red-500/10 transition-all cursor-pointer"
                >
                  Hide Widget
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. WIDGETS SECTION: Grid widgets (responsive sizes & swap reordering) */}
        <div className={`flex flex-wrap ${densityGapClass} w-full`}>
          {activeGridOrder.map((widgetId, index) => {
            const WidgetComponent = WIDGET_COMPONENTS[widgetId];
            if (!WidgetComponent) return null;
            
            const isWidgetEnabled = activeEnabled[widgetId];
            if (!isWidgetEnabled && !isEditMode) return null;

            const size = activeSizes[widgetId] || 'medium';
            let widthClass = 'w-full';
            if (size === 'medium') {
              widthClass = density === 'compact' 
                ? 'w-[calc(50%-5px)]' 
                : density === 'spacious' 
                  ? 'w-[calc(50%-12px)]' 
                  : 'w-[calc(50%-8px)]';
            } else if (size === 'small') {
              widthClass = density === 'compact' 
                ? 'w-[calc(33.33%-6.7px)]' 
                : density === 'spacious' 
                  ? 'w-[calc(33.33%-16px)]' 
                  : 'w-[calc(33.33%-10.7px)]';
            }

            return (
              <div 
                key={widgetId} 
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, widgetId)}
                onDragOver={(e) => handleDragOver(e, widgetId)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`${widthClass} min-w-0`}
              >
                <motion.div
                  layout
                  transition={springTransition}
                  animate={isEditMode ? { scale: 0.98 } : { scale: 1 }}
                  className={`border rounded-2xl bg-black/[0.30] p-4 relative transition-all duration-300 overflow-hidden ${isEditMode ? 'border-accent/40 shadow-lg cursor-grab active:cursor-grabbing hover:border-accent bg-black/45' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
                >
                  <div className={`${!isWidgetEnabled ? 'pointer-events-none filter blur-[1px]' : ''} ${isEditMode ? 'pointer-events-none select-none' : ''}`}>
                    <WidgetComponent />
                  </div>

                  {/* Pinned widget visual indicator in non-edit mode */}
                  {!isEditMode && settings.pinnedWidgets[widgetId] && (
                    <div className="absolute top-2.5 right-2.5 z-30 p-0.5 text-amber-400">
                      <Pin size={10} className="fill-amber-400 rotate-45" />
                    </div>
                  )}

                  {/* Grid handle indicator */}
                  {isEditMode && isWidgetEnabled && (
                    <div className="absolute top-2.5 left-2.5 z-30 p-1 bg-black/60 rounded-lg border border-white/10 text-neutral-400 hover:text-white">
                      <GripVertical size={11} />
                    </div>
                  )}

                  {/* Edit Mode Overlay for customizable grid widgets */}
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-2 border border-accent/20 z-20 transition-all duration-300">
                      <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider mt-2">{widgetId.replace('-', ' ')}</span>
                      
                      {!isWidgetEnabled ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-red-400">Hidden Widget</span>
                          <button
                            onClick={() => {
                              const newEnabled = { ...tempEnabledWidgets };
                              newEnabled[widgetId] = true;
                              setTempEnabledWidgets(newEnabled);
                            }}
                            className="px-3 py-1 rounded-lg bg-accent text-white text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            Show Widget
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              const newSizes = { ...tempWidgetSizes };
                              const current = newSizes[widgetId] || 'medium';
                              const next = current === 'small' ? 'medium' : current === 'medium' ? 'large' : 'small';
                              newSizes[widgetId] = next;
                              setTempWidgetSizes(newSizes);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold border border-white/5 transition-all cursor-pointer capitalize"
                          >
                            Size: {size}
                          </button>

                          <button
                            onClick={() => togglePinWidget(widgetId)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1
                              ${settings.pinnedWidgets[widgetId]
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold' 
                                : 'bg-white/10 hover:bg-white/20 text-white border-white/5'
                              }`}
                            title="Pin Widget"
                          >
                            <Pin size={9} className={settings.pinnedWidgets[widgetId] ? 'fill-amber-400' : ''} />
                            <span>{settings.pinnedWidgets[widgetId] ? 'Pinned' : 'Pin'}</span>
                          </button>

                          <button
                            onClick={() => {
                              const newEnabled = { ...tempEnabledWidgets };
                              newEnabled[widgetId] = false;
                              setTempEnabledWidgets(newEnabled);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-semibold border border-red-500/10 transition-all cursor-pointer"
                          >
                            Hide
                          </button>
                        </div>
                      )}

                      {/* Swap position buttons (specifically within activeGridOrder bounds) */}
                      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 mt-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleSwapGridWidgets(index, index - 1, activeGridOrder)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <span className="text-[9px] text-neutral-500 font-bold px-1 font-mono uppercase">Order</span>
                        <button
                          disabled={index === activeGridOrder.length - 1}
                          onClick={() => handleSwapGridWidgets(index, index + 1, activeGridOrder)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* 4. AVAILABLE WIDGETS (Hidden bin section in Edit Mode) */}
        {isEditMode && hiddenWidgets.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-dashed border-white/10 flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Available Widgets (Hidden)</span>
            <div className="flex flex-wrap gap-2">
              {hiddenWidgets.map((widgetId) => (
                <div 
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widgetId)}
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-accent/40 flex items-center gap-2 cursor-grab text-[11px] font-semibold text-neutral-300 transition-all select-none"
                >
                  <GripVertical size={11} className="text-neutral-500" />
                  <span className="capitalize">{widgetId.replace('-', ' ')}</span>
                  <button
                    onClick={() => {
                      const newEnabled = { ...tempEnabledWidgets };
                      newEnabled[widgetId] = true;
                      setTempEnabledWidgets(newEnabled);
                    }}
                    className="p-1 rounded bg-accent/25 hover:bg-accent/45 text-accent-light transition-all text-[9px] cursor-pointer ml-1 font-bold px-1.5"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasNotification = !!activeNotification && notifSettings.enable && !notifSettings.dnd;
  const showCollapsed = !isExpanded && !hasNotification;
  const showNotification = !isExpanded && hasNotification;

  const shadowClass = 
    appearanceSettings.shadowIntensity === 'high' 
      ? 'shadow-[0_25px_60px_rgba(0,0,0,0.85)]' 
      : appearanceSettings.shadowIntensity === 'medium'
        ? 'shadow-[0_15px_30px_rgba(0,0,0,0.6)]'
        : 'shadow-[0_5px_15px_rgba(0,0,0,0.35)]';

  const fontClass = 
    appearanceSettings.fontSize === 'small' 
      ? 'text-[11px]' 
      : appearanceSettings.fontSize === 'large' 
        ? 'text-[13px]' 
        : 'text-xs';

  return (
    <main 
      className={`relative w-screen h-screen overflow-hidden flex flex-col items-center pt-4 transition-all duration-500 ${
        isTauri 
          ? 'bg-transparent' 
          : 'bg-[#050505] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-[#050505] to-[#010101]'
      }`}
    >
      <motion.div
        layout
        transition={isExpanded ? springTransition : collapsedTransition}
        style={islandStyle}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => !isExpanded && setIsExpanded(true)}
        data-season={activeSeason}
        className={`
          relative 
          border 
          ${shadowClass} 
          cursor-pointer 
          overflow-hidden 
          text-white
          select-none 
          z-40
          flex flex-col
          ${fontClass}
          ${theme === 'nothing-os' ? 'nothing-grid border border-white/20' : ''}
          ${isHovered ? 'shadow-[0_0_24px_rgba(255,255,255,0.06)] border-white/15' : ''}
        `}
        animate={{
          width: isExpanded 
            ? settings.expandedWidth 
            : getCollapsedWidth(),
          height: isExpanded 
            ? 520 
            : getCollapsedHeight(),
        }}
      >
        {/* Layered Content Containers to fix collapse layout shifting and clipping */}
        <div className="relative w-full h-full flex-1 overflow-hidden">
          
          {/* 1. COLLAPSED VIEW */}
          <motion.div
            animate={{ opacity: showCollapsed ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: showCollapsed ? 'auto' : 'none' }}
            className="absolute inset-0 flex items-center justify-between"
          >
            {renderCollapsedContent()}
          </motion.div>

          {/* 2. NOTIFICATION VIEW */}
          <motion.div
            layout
            animate={{ opacity: showNotification ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: showNotification ? 'auto' : 'none' }}
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-between px-5"
          >
          {hasNotification && activeNotification && (
            <div className="w-full flex items-center justify-between px-5">
              <NotificationCard
                title={activeNotification.title}
                subtitle={activeNotification.subtitle}
                thumbnail={activeNotification.extra?.thumbnail}
              />
              <button
                onClick={clearNotification}
                className="p-1 text-neutral-500 hover:text-white cursor-pointer text-xs"
              >
                Dismiss
              </button>
            </div>
          )}
          </motion.div>

          {/* 3. EXPANDED VIEW */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col font-sans"
              >
                {/* Header Tabs */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2.5 border-b border-white/[0.04] bg-black/35 flex-shrink-0 w-full min-h-[56px]">
                  {activeTab === 'widgets' ? (
                    <>
                      {/* Left: Clock */}
                      <div className="flex items-center gap-1.5 font-sans font-normal text-xs text-neutral-300 tracking-wide">
                        <Clock size={13} className="text-neutral-400" />
                        <span>{renderClockString(currentTime || '12:00 PM')}</span>
                      </div>
                      
                      {/* Right: Settings button */}
                      <SettingsButton 
                        active={false} 
                        onClick={() => setActiveTab('settings')}
                      />
                    </>
                  ) : (
                    <>
                      {/* Left: Back button */}
                      <BackButton onClick={() => setActiveTab('widgets')} />
                      
                      {/* Center: Title */}
                      <span className="text-xs font-semibold text-white tracking-wide">Settings</span>
                      
                      {/* Right: Clock (remains visible) */}
                      <div className="flex items-center gap-1.5 font-sans font-normal text-xs text-neutral-300 tracking-wide">
                        <Clock size={13} className="text-neutral-400" />
                        <span>{renderClockString(currentTime || '12:00 PM')}</span>
                      </div>
                    </>
                  )}
                </div>



                {/* Content Body */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto min-h-0 bg-black/[0.15] relative">
                  {/* Floating Notification Overlay for Expanded View */}
                  <AnimatePresence>
                    {hasNotification && activeNotification && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute top-4 left-4 right-4 z-50 pointer-events-auto"
                      >
                        <div className="flex items-center justify-between p-3 bg-black/85 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <div className="flex-1 min-w-0">
                            <NotificationCard
                              title={activeNotification.title}
                              subtitle={activeNotification.subtitle}
                              thumbnail={activeNotification.extra?.thumbnail}
                            />
                          </div>
                          <button
                            onClick={clearNotification}
                            className="p-1.5 text-neutral-400 hover:text-white cursor-pointer text-xs ml-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeTab}
                      custom={direction}
                      variants={contentVariants}
                      transition={animSettings.reduceMotion ? { duration: 0 } : contentTransition}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="p-6 w-full flex flex-col min-h-full"
                    >
                      {activeTab === 'widgets' ? (
                        renderWidgetsGrid()
                      ) : (
                        renderSettingsContent()
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer controls */}
                <div className="p-3 border-t border-white/[0.04] bg-black/35 flex justify-between items-center text-[9px] text-neutral-500 px-6 flex-shrink-0">
                  <span>Click outside or wait to auto-collapse</span>
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="hover:text-white font-medium cursor-pointer"
                  >
                    Close Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Island Backdrop Click-out */}
      {isExpanded && (
        <div 
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/10 z-30 animate-none"
        />
      )}

      {/* Simulation panel overlay for easy testing on the browser */}
      <SimulationPanel />
      
      {/* Simulated Desktop Wallpaper Title and Taskbar for Browser Mode */}
      {!isTauri && (
        <>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-neutral-800 text-[10vw] font-bold select-none pointer-events-none opacity-[0.03] tracking-widest font-sans uppercase">
            Pisland
          </div>
          {/* Simulated Taskbar at bottom */}
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 h-12 px-6 rounded-full bg-black/40 border border-white/[0.05] backdrop-blur-md flex items-center gap-4 z-10 shadow-2xl">
            <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">P</div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="w-6 h-6 rounded bg-white/5 border border-white/10" />
            <div className="w-6 h-6 rounded bg-white/5 border border-white/10" />
          </div>
        </>
      )}
    </main>
  );
};

export default App;

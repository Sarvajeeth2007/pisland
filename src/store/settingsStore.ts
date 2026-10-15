import { create } from 'zustand';

export interface PislandSettings {
  width: number; // collapsed width (px)
  expandedWidth: number; // expanded width (px)
  height: number; // collapsed height (px)
  opacity: number; // background opacity (0.1 - 1.0)
  blurAmount: number; // blur filter (px)
  animationSpeed: 'fast' | 'normal' | 'slow';
  alwaysOnTop: boolean;
  autoHide: boolean;
  autoCollapse: boolean;
  accentColor: string; // Hex color
  widgetOrder: string[];
  enabledWidgets: Record<string, boolean>;
  widgetSizes: Record<string, 'small' | 'medium' | 'large'>;
  
  // customizable quick controls
  enabledQuickControls: Record<string, boolean>;
  quickControlsOrder: string[]; // for the toggles (wifi, bluetooth, vpn, microphone)

  // Premium Privacy-First properties
  pinnedWidgets: Record<string, boolean>;
  autoProfileSwitching: boolean;
  seasonalThemeMode: 'auto' | 'winter' | 'spring' | 'summer' | 'autumn';
  adaptiveTransparency: boolean;
  activeCompanion: 'cat' | 'dog' | 'owl' | 'fox' | 'cheetah' | 'panda' | 'penguin' | 'rabbit' | 'hamster' | 'bear' | 'red_panda' | 'person' | 'robot' | 'ghost' | 'alien';
}

interface SettingsState {
  settings: PislandSettings;
  updateSetting: <K extends keyof PislandSettings>(key: K, value: PislandSettings[K]) => void;
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (newOrder: string[]) => void;
  toggleQuickControl: (controlId: string) => void;
  reorderQuickControls: (newOrder: string[]) => void;
  togglePinWidget: (widgetId: string) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: PislandSettings = {
  width: 437,
  expandedWidth: 598,
  height: 48,
  opacity: 0.85,
  blurAmount: 24,
  animationSpeed: 'normal',
  alwaysOnTop: true,
  autoHide: false,
  autoCollapse: true,
  accentColor: '#F2F2F2',
  widgetOrder: ['quick-controls', 'media', 'clipboard', 'system-stats', 'weather', 'calendar'],
  enabledWidgets: {
    'quick-controls': true,
    'media': true,
    'clipboard': true,
    'system-stats': true,
    'weather': true,
    'calendar': true,
  },
  widgetSizes: {
    'quick-controls': 'large',
    'media': 'large',
    'system-stats': 'medium',
    'weather': 'medium',
    'calendar': 'medium',
    'clipboard': 'medium',
  },
  enabledQuickControls: {
    'volume': true,
    'brightness': true,
    'wifi': true,
    'bluetooth': true,
    'vpn': true,
    'microphone': true,
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
  },
  quickControlsOrder: [
    'wifi', 'bluetooth', 'vpn', 'microphone',
    'battery-saver', 'airplane-mode', 'mobile-hotspot', 'night-light',
    'focus-mode', 'dnd', 'screen-record', 'lock-rotation',
    'nearby-sharing', 'camera', 'touchpad', 'kb-backlight'
  ],
  pinnedWidgets: {
    'quick-controls': false,
    'media': false,
    'clipboard': false,
    'system-stats': false,
    'weather': false,
    'calendar': false,
  },
  autoProfileSwitching: false,
  seasonalThemeMode: 'auto',
  adaptiveTransparency: false,
  activeCompanion: 'cat',
};

export const useSettingsStore = create<SettingsState>((set) => {
  const loadSavedSettings = (): PislandSettings => {
    try {
      const saved = localStorage.getItem('pisland-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return DEFAULT_SETTINGS;
  };

  const initialSettings = loadSavedSettings();

  return {
    settings: initialSettings,
    updateSetting: (key, value) => {
      set((state) => {
        const newSettings = { ...state.settings, [key]: value };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    toggleWidget: (widgetId) => {
      set((state) => {
        const newEnabled = {
          ...state.settings.enabledWidgets,
          [widgetId]: !state.settings.enabledWidgets[widgetId]
        };
        const newSettings = { ...state.settings, enabledWidgets: newEnabled };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    reorderWidgets: (newOrder) => {
      set((state) => {
        const newSettings = { ...state.settings, widgetOrder: newOrder };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    toggleQuickControl: (controlId) => {
      set((state) => {
        const newEnabled = {
          ...state.settings.enabledQuickControls,
          [controlId]: !state.settings.enabledQuickControls[controlId]
        };
        const newSettings = { ...state.settings, enabledQuickControls: newEnabled };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    reorderQuickControls: (newOrder) => {
      set((state) => {
        const newSettings = { ...state.settings, quickControlsOrder: newOrder };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    togglePinWidget: (widgetId) => {
      set((state) => {
        const newPinned = {
          ...state.settings.pinnedWidgets,
          [widgetId]: !state.settings.pinnedWidgets[widgetId]
        };
        const newSettings = { ...state.settings, pinnedWidgets: newPinned };
        localStorage.setItem('pisland-settings', JSON.stringify(newSettings));
        return { settings: newSettings };
      });
    },
    resetSettings: () => {
      localStorage.setItem('pisland-settings', JSON.stringify(DEFAULT_SETTINGS));
      set({ settings: DEFAULT_SETTINGS });
    },
  };
});

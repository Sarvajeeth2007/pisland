import { create } from 'zustand';

export interface PislandPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string; // Lucide icon name
  isEnabled: boolean;
  isBuiltIn: boolean;
  category: 'productivity' | 'system' | 'social' | 'entertainment';
}

interface PluginState {
  plugins: PislandPlugin[];
  togglePlugin: (pluginId: string) => void;
  registerPlugin: (plugin: PislandPlugin) => void;
}

const BUILT_IN_PLUGINS: PislandPlugin[] = [
  {
    id: 'quick-controls',
    name: 'Quick Controls',
    description: 'Adjust volume, brightness, and toggle system connections (Wifi, Bluetooth, VPN).',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'sliders',
    isEnabled: true,
    isBuiltIn: true,
    category: 'system'
  },
  {
    id: 'media',
    name: 'Media Player',
    description: 'Control your active audio streams, album artwork, track progression and player state.',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'music',
    isEnabled: true,
    isBuiltIn: true,
    category: 'entertainment'
  },
  {
    id: 'clipboard',
    name: 'Clipboard History',
    description: 'Keep track of recent texts and links copied to your clipboard with instant copy-back.',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'clipboard',
    isEnabled: true,
    isBuiltIn: true,
    category: 'productivity'
  },
  {
    id: 'system-stats',
    name: 'System Stats',
    description: 'Monitor your CPU, RAM, Network speeds, and disk readouts in real-time visualizers.',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'cpu',
    isEnabled: true,
    isBuiltIn: true,
    category: 'system'
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Current local weather forecast and atmospheric statistics.',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'cloud-sun',
    isEnabled: true,
    isBuiltIn: true,
    category: 'productivity'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'See today\'s date and current events on your agenda.',
    version: '1.0.0',
    author: 'Pisland Team',
    icon: 'calendar',
    isEnabled: true,
    isBuiltIn: true,
    category: 'productivity'
  }
];

const THIRD_PARTY_PLUGINS: PislandPlugin[] = [
  {
    id: 'spotify-plugin',
    name: 'Spotify Integration',
    description: 'Sync playlist, search songs, and control playback directly using Spotify Web APIs.',
    version: '0.1.0',
    author: 'Community',
    icon: 'spotify',
    isEnabled: false,
    isBuiltIn: false,
    category: 'entertainment'
  },
  {
    id: 'discord-plugin',
    name: 'Discord Status',
    description: 'View active voice channels, messages, and mute/deafen options from your task bar.',
    version: '0.1.0',
    author: 'Community',
    icon: 'message-square',
    isEnabled: false,
    isBuiltIn: false,
    category: 'social'
  },
  {
    id: 'github-plugin',
    name: 'GitHub Tracker',
    description: 'Real-time commit histories, issue trackers, and pull-request update reviews.',
    version: '0.2.1',
    author: 'Dev community',
    icon: 'github',
    isEnabled: false,
    isBuiltIn: false,
    category: 'productivity'
  },
  {
    id: 'vscode-plugin',
    name: 'VS Code Sync',
    description: 'Control current open workspaces, see coding times, and trigger workspace selections.',
    version: '0.0.5',
    author: 'Editor plugins',
    icon: 'code',
    isEnabled: false,
    isBuiltIn: false,
    category: 'productivity'
  },
  {
    id: 'steam-plugin',
    name: 'Steam Friends',
    description: 'See online status of friends and trigger game launches directly from Pisland.',
    version: '0.1.0',
    author: 'Gamer Guild',
    icon: 'gamepad-2',
    isEnabled: false,
    isBuiltIn: false,
    category: 'entertainment'
  },
  {
    id: 'notion-plugin',
    name: 'Notion Sync',
    description: 'Create and append quick notes, review tasks lists, and inspect workspace links.',
    version: '0.3.0',
    author: 'Workspace Devs',
    icon: 'book-open',
    isEnabled: false,
    isBuiltIn: false,
    category: 'productivity'
  }
];

export const usePluginStore = create<PluginState>((set) => {
  const loadSavedPlugins = (): PislandPlugin[] => {
    try {
      const saved = localStorage.getItem('pisland-plugins');
      if (saved) {
        const parsed = JSON.parse(saved) as PislandPlugin[];
        // Merge missing builtins/third-party just in case
        const allBase = [...BUILT_IN_PLUGINS, ...THIRD_PARTY_PLUGINS];
        return allBase.map(base => {
          const match = parsed.find(p => p.id === base.id);
          return match ? { ...base, isEnabled: match.isEnabled } : base;
        });
      }
    } catch (e) {
      console.error("Failed to load plugins settings", e);
    }
    return [...BUILT_IN_PLUGINS, ...THIRD_PARTY_PLUGINS];
  };

  return {
    plugins: loadSavedPlugins(),
    togglePlugin: (pluginId) => {
      set((state) => {
        const newPlugins = state.plugins.map(p => 
          p.id === pluginId ? { ...p, isEnabled: !p.isEnabled } : p
        );
        localStorage.setItem('pisland-plugins', JSON.stringify(newPlugins));
        return { plugins: newPlugins };
      });
    },
    registerPlugin: (plugin) => {
      set((state) => {
        if (state.plugins.some(p => p.id === plugin.id)) return state;
        const newPlugins = [...state.plugins, plugin];
        localStorage.setItem('pisland-plugins', JSON.stringify(newPlugins));
        return { plugins: newPlugins };
      });
    }
  };
});

import { create } from 'zustand';

// Check if running in Tauri environment
const isTauriEnv = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export interface SystemNotification {
  id: string;
  type: 'bluetooth' | 'volume' | 'brightness' | 'screenshot' | 'music' | 'battery-low' | 'charging';
  title: string;
  subtitle?: string;
  value?: number; // for volume, brightness, battery
  extra?: any; // for screenshot url, music cover art, bluetooth device name
  duration?: number; // ms to display
}

interface ClipboardItem {
  id: string;
  text: string;
  timestamp: string;
}

export interface WifiNetworkItem {
  ssid: string;
  signal_strength: number;
  security_type: string;
  is_secured: boolean;
  is_connected: boolean;
  is_saved: boolean;
}

export interface BluetoothDeviceItem {
  id: string;
  name: string;
  device_type: string;
  is_connected: boolean;
  is_paired: boolean;
}

interface SystemState {
  // System metrics & settings
  volume: number;
  playbackMuted: boolean;
  brightness: number;
  batteryLevel: number;
  isCharging: boolean;
  batteryTimeRemaining: string;
  wifiEnabled: boolean;
  wifiConnected: boolean;
  wifiName: string;
  wifiNetworks: WifiNetworkItem[];
  wifiScanning: boolean;
  wifiConnectingSsid: string | null;
  bluetoothEnabled: boolean;
  bluetoothConnected: boolean;
  bluetoothDevice: string;
  bluetoothDevices: BluetoothDeviceItem[];
  btScanning: boolean;
  btConnectingId: string | null;
  vpnConnected: boolean;
  batterySaverActive: boolean;
  airplaneModeActive: boolean;
  mobileHotspotActive: boolean;
  nightLightActive: boolean;
  microphoneMuted: boolean;
  cameraActive: boolean;
  dndActive: boolean;
  nearbySharingActive: boolean;
  rotationLockActive: boolean;
  rotationLockSupported: boolean;
  cpuUsage: number;
  ramUsage: number;
  networkSpeed: { download: number; upload: number };
  clipboardHistory: ClipboardItem[];
  
  // Media status
  media: {
    isPlaying: boolean;
    title: string;
    artist: string;
    album: string;
    artwork: string;
    duration: number; // in seconds
    progress: number; // in seconds
  };
  
  // Weather
  weather: {
    temp: number;
    condition: string;
    location: string;
  };
  
  // Notification Engine active item
  activeNotification: SystemNotification | null;
  notificationHistory: SystemNotification[];

  // Actions
  setVolume: (val: number, notify?: boolean) => void;
  togglePlaybackMute: () => void;
  setBrightness: (val: number, notify?: boolean) => void;
  toggleWifi: () => void;
  scanWifiNetworks: () => Promise<void>;
  connectWifi: (ssid: string, password?: string) => Promise<boolean>;
  disconnectWifi: (ssid: string) => Promise<void>;
  toggleBluetooth: () => void;
  scanBluetoothDevices: () => Promise<void>;
  connectBluetoothDevice: (id: string, name: string) => Promise<boolean>;
  disconnectBluetoothDevice: (id: string, name: string) => Promise<void>;
  toggleVpn: () => void;
  toggleMicrophone: () => void;
  togglePlayPause: () => void;
  setMediaProgress: (val: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  triggerNotification: (notif: Omit<SystemNotification, 'id'>) => void;
  clearNotification: () => void;
  clearNotificationHistory: () => void;
  addToClipboard: (text: string) => void;
  clearClipboard: () => void;
  takeScreenshotSimulated: () => void;
  toggleBatterySaver: () => void;
  toggleAirplaneMode: () => void;
  toggleMobileHotspot: () => void;
  toggleNightLight: () => void;
  toggleDnd: () => void;
  toggleNearbySharing: () => void;
  toggleCamera: () => void;
  toggleRotationLock: () => void;
  
  // Backend sync loops
  updateStats: (cpu: number, ram: number) => void;
  updateBattery: (level: number, charging: boolean) => void;
}

let volumeTimeout: any = null;
let brightnessTimeout: any = null;

export const useSystemStore = create<SystemState>((set, get) => {
  // Initialize tauri modules dynamically if available
  let tauriInvoke: any = null;
  if (isTauriEnv()) {
    import('@tauri-apps/api/core').then((m) => {
      tauriInvoke = m.invoke;
    });
    import('@tauri-apps/api/event').then((m) => {
      m.listen<any>('system-status', (event) => {
        const payload = event.payload;
        const state = get();
        
        const vol = Math.round(payload.volume);
        const bri = Math.round(payload.brightness);
        const pbMuted = payload.playback_muted ?? false;
        
        if (
          state.volume !== vol ||
          state.playbackMuted !== pbMuted ||
          state.brightness !== bri ||
          state.batteryLevel !== payload.battery_level ||
          state.isCharging !== payload.is_charging ||
          state.wifiEnabled !== (payload.wifi_adapter_on ?? true) ||
          state.wifiConnected !== payload.wifi_connected ||
          state.wifiName !== payload.wifi_name ||
          state.bluetoothConnected !== payload.bluetooth_connected ||
          state.bluetoothDevice !== payload.bluetooth_device ||
          state.vpnConnected !== payload.vpn_connected ||
          state.cpuUsage !== payload.cpu_usage ||
          state.ramUsage !== payload.ram_usage ||
          state.networkSpeed.download !== payload.download_speed ||
          state.networkSpeed.upload !== payload.upload_speed ||
          state.batterySaverActive !== payload.battery_saver ||
          state.airplaneModeActive !== payload.airplane_mode ||
          state.mobileHotspotActive !== payload.mobile_hotspot ||
          state.nightLightActive !== payload.night_light ||
          state.dndActive !== payload.dnd_active ||
          state.nearbySharingActive !== payload.nearby_sharing_active ||
          state.cameraActive !== payload.camera_active ||
          state.rotationLockActive !== payload.rotation_lock_active ||
          state.rotationLockSupported !== payload.rotation_lock_supported ||
          state.microphoneMuted !== payload.microphone_muted ||
          state.bluetoothEnabled !== (payload.bluetooth_adapter_on ?? true)
        ) {
          set({
            volume: vol,
            playbackMuted: pbMuted,
            brightness: bri,
            batteryLevel: payload.battery_level,
            isCharging: payload.is_charging,
            batteryTimeRemaining: payload.is_charging ? 'Charging' : 'Calculated by OS',
            wifiEnabled: payload.wifi_adapter_on ?? true,
            wifiConnected: payload.wifi_connected,
            wifiName: payload.wifi_name,
            bluetoothConnected: payload.bluetooth_connected,
            bluetoothDevice: payload.bluetooth_device,
            vpnConnected: payload.vpn_connected,
            cpuUsage: payload.cpu_usage,
            ramUsage: payload.ram_usage,
            batterySaverActive: payload.battery_saver,
            airplaneModeActive: payload.airplane_mode,
            mobileHotspotActive: payload.mobile_hotspot,
            nightLightActive: payload.night_light,
            dndActive: payload.dnd_active,
            nearbySharingActive: payload.nearby_sharing_active,
            cameraActive: payload.camera_active,
            rotationLockActive: payload.rotation_lock_active,
            rotationLockSupported: payload.rotation_lock_supported,
            microphoneMuted: payload.microphone_muted,
            bluetoothEnabled: payload.bluetooth_adapter_on ?? true,
            networkSpeed: {
              download: payload.download_speed,
              upload: payload.upload_speed
            }
          });
        }
      });
    }).catch(console.error);
  }

  // Simulated background state updates for web preview non-Tauri env
  if (!isTauriEnv()) {
    setInterval(() => {
      const state = get();
      const cpuDelta = (Math.random() - 0.5) * 5;
      const ramDelta = (Math.random() - 0.5) * 2;
      const newCpu = Math.min(100, Math.max(0, Math.round(state.cpuUsage + cpuDelta)));
      const newRam = Math.min(100, Math.max(0, Math.round(state.ramUsage + ramDelta)));
      
      const newSpeed = {
        download: Math.max(0.1, +(state.networkSpeed.download + (Math.random() - 0.5) * 2).toFixed(1)),
        upload: Math.max(0.1, +(state.networkSpeed.upload + (Math.random() - 0.5) * 0.5).toFixed(1)),
      };

      let newProgress = state.media.progress;
      if (state.media.isPlaying) {
        newProgress = (state.media.progress + 1) % state.media.duration;
        if (newProgress === 0) {
          setTimeout(() => state.nextTrack(), 500);
        }
      }

      set({
        cpuUsage: newCpu,
        ramUsage: newRam,
        networkSpeed: newSpeed,
        media: { ...state.media, progress: newProgress }
      });
    }, 1000);
  }

  return {
    volume: 50,
    playbackMuted: false,
    brightness: 65,
    batteryLevel: 100,
    isCharging: false,
    batteryTimeRemaining: 'Unknown remaining',
    wifiEnabled: true,
    wifiConnected: false,
    wifiName: 'Disconnected',
    wifiNetworks: [],
    wifiScanning: false,
    wifiConnectingSsid: null,
    bluetoothEnabled: true,
    bluetoothConnected: false,
    bluetoothDevice: '',
    bluetoothDevices: [],
    btScanning: false,
    btConnectingId: null,
    vpnConnected: false,
    batterySaverActive: false,
    airplaneModeActive: false,
    mobileHotspotActive: false,
    nightLightActive: false,
    microphoneMuted: false,
    cameraActive: false,
    dndActive: false,
    nearbySharingActive: false,
    rotationLockActive: false,
    rotationLockSupported: false,
    cpuUsage: 0,
    ramUsage: 0,
    networkSpeed: { download: 0.0, upload: 0.0 },
    clipboardHistory: [],
    media: {
      isPlaying: false,
      title: 'No Media Playing',
      artist: 'System Audio',
      album: '',
      artwork: '',
      duration: 0,
      progress: 0,
    },
    weather: {
      temp: 24,
      condition: 'Partly Cloudy',
      location: 'Hyderabad, IN'
    },
    activeNotification: null,
    notificationHistory: (() => {
      try {
        const saved = localStorage.getItem('pisland-notification-history');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    })(),

    setVolume: (val, notify = true) => {
      const vol = Math.min(100, Math.max(0, val));
      set({ volume: vol, playbackMuted: false });
      
      if (volumeTimeout) {
        clearTimeout(volumeTimeout);
      }
      volumeTimeout = setTimeout(() => {
        if (tauriInvoke) {
          tauriInvoke('set_volume', { volume: vol }).catch(console.error);
        }
      }, 30);
      
      if (notify) {
        get().triggerNotification({
          type: 'volume',
          title: 'Volume Changed',
          value: vol,
          duration: 2000
        });
      }
    },

    togglePlaybackMute: () => {
      const nextMuted = !get().playbackMuted;
      set({ playbackMuted: nextMuted });
      if (tauriInvoke) {
        tauriInvoke('set_playback_mute', { mute: nextMuted }).catch(console.error);
      }
      get().triggerNotification({
        type: 'volume',
        title: nextMuted ? 'Volume Muted' : 'Volume Unmuted',
        value: get().volume,
        duration: 2000
      });
    },

    setBrightness: (val, notify = true) => {
      const bri = Math.min(100, Math.max(0, val));
      set({ brightness: bri });
      
      if (isTauriEnv()) {
        if (brightnessTimeout) {
          clearTimeout(brightnessTimeout);
        }
        brightnessTimeout = setTimeout(() => {
          if (tauriInvoke) {
            tauriInvoke('set_brightness', { brightness: bri }).catch(console.error);
          }
        }, 120);
      }

      if (notify) {
        get().triggerNotification({
          type: 'brightness',
          title: 'Brightness Changed',
          value: bri,
          duration: 2000
        });
      }
    },

    toggleWifi: () => {
      const enabled = !get().wifiEnabled;
      set({ wifiEnabled: enabled });
      if (tauriInvoke) {
        tauriInvoke('set_wifi_state', { active: enabled }).catch(console.error);
      }
      
      get().triggerNotification({
        type: 'bluetooth',
        title: enabled ? 'Wi-Fi Enabled' : 'Wi-Fi Disabled',
        subtitle: enabled ? 'Scanning networks...' : 'Radio off',
        duration: 2500
      });
    },

    scanWifiNetworks: async () => {
      set({ wifiScanning: true });
      if (tauriInvoke) {
        try {
          const res: WifiNetworkItem[] = await tauriInvoke('scan_wifi_networks');
          set({ wifiNetworks: res, wifiScanning: false });
          return;
        } catch (e) {
          console.error("Failed to scan wifi:", e);
        }
      }
      set({ wifiScanning: false });
    },

    connectWifi: async (ssid: string, password?: string) => {
      set({ wifiConnectingSsid: ssid });
      if (tauriInvoke) {
        try {
          await tauriInvoke('connect_wifi', { ssid, password: password || null });
          set({ wifiConnectingSsid: null, wifiConnected: true, wifiName: ssid });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Wi-Fi Connected',
            subtitle: `Connected to ${ssid}`,
            duration: 3000
          });
          get().scanWifiNetworks();
          return true;
        } catch (e: any) {
          console.error("Failed to connect wifi:", e);
          set({ wifiConnectingSsid: null });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Wi-Fi Connection Failed',
            subtitle: typeof e === 'string' ? e : 'Unable to connect to network',
            duration: 4000
          });
          return false;
        }
      }
      set({ wifiConnectingSsid: null });
      return false;
    },

    disconnectWifi: async (ssid: string) => {
      if (tauriInvoke) {
        try {
          await tauriInvoke('disconnect_wifi', { ssid });
          set({ wifiConnected: false, wifiName: 'Disconnected' });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Wi-Fi Disconnected',
            subtitle: `Disconnected from ${ssid}`,
            duration: 2500
          });
          get().scanWifiNetworks();
        } catch (e) {
          console.error("Failed to disconnect wifi:", e);
        }
      }
    },

    toggleBluetooth: () => {
      const enabled = !get().bluetoothEnabled;
      set({ bluetoothEnabled: enabled });
      if (tauriInvoke) {
        tauriInvoke('set_bluetooth_state', { active: enabled }).catch(console.error);
      }

      get().triggerNotification({
        type: 'bluetooth',
        title: enabled ? 'Bluetooth Enabled' : 'Bluetooth Disabled',
        subtitle: enabled ? 'Scanning devices...' : 'Bluetooth turned off',
        duration: 2500
      });
    },

    scanBluetoothDevices: async () => {
      set({ btScanning: true });
      if (tauriInvoke) {
        try {
          const res: BluetoothDeviceItem[] = await tauriInvoke('scan_bluetooth_devices');
          set({ bluetoothDevices: res, btScanning: false });
          return;
        } catch (e) {
          console.error("Failed to scan bluetooth:", e);
        }
      }
      set({ btScanning: false });
    },

    connectBluetoothDevice: async (id: string, name: string) => {
      set({ btConnectingId: id });
      if (tauriInvoke) {
        try {
          await tauriInvoke('connect_bluetooth_device', { id, name });
          set({ btConnectingId: null, bluetoothConnected: true, bluetoothDevice: name });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Bluetooth Connected',
            subtitle: `Connected to ${name}`,
            duration: 3000
          });
          get().scanBluetoothDevices();
          return true;
        } catch (e: any) {
          console.error("Failed to connect bluetooth:", e);
          set({ btConnectingId: null });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Bluetooth Connection Failed',
            subtitle: typeof e === 'string' ? e : 'Device failed to connect',
            duration: 4000
          });
          return false;
        }
      }
      set({ btConnectingId: null });
      return false;
    },

    disconnectBluetoothDevice: async (id: string, name: string) => {
      if (tauriInvoke) {
        try {
          await tauriInvoke('disconnect_bluetooth_device', { id, name });
          set({ bluetoothConnected: false, bluetoothDevice: '' });
          get().triggerNotification({
            type: 'bluetooth',
            title: 'Bluetooth Disconnected',
            subtitle: `Disconnected ${name}`,
            duration: 2500
          });
          get().scanBluetoothDevices();
        } catch (e) {
          console.error("Failed to disconnect bluetooth:", e);
        }
      }
    },

    toggleVpn: () => {
      const connected = !get().vpnConnected;
      set({ vpnConnected: connected });
      get().triggerNotification({
        type: 'bluetooth',
        title: connected ? 'VPN Connected' : 'VPN Disconnected',
        subtitle: connected ? ' Amsterdam Secure Node' : 'Direct connection',
        duration: 2500
      });
    },

    toggleMicrophone: () => {
      const active = !get().microphoneMuted;
      set({ microphoneMuted: active });
      if (tauriInvoke) {
        tauriInvoke('set_microphone_mute', { mute: active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Microphone Muted' : 'Microphone Active',
        subtitle: active ? 'Mic hardware disabled' : 'Mic listening',
        duration: 2000
      });
    },

    toggleDnd: () => {
      const active = !get().dndActive;
      set({ dndActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_dnd_state', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Do Not Disturb Enabled' : 'Do Not Disturb Disabled',
        subtitle: active ? 'Notifications silenced' : 'Notifications restored',
        duration: 2000
      });
    },

    toggleNearbySharing: () => {
      const active = !get().nearbySharingActive;
      set({ nearbySharingActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_nearby_sharing', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Nearby Sharing Enabled' : 'Nearby Sharing Disabled',
        subtitle: active ? 'Visible to devices' : 'Status: Off',
        duration: 2000
      });
    },

    toggleCamera: () => {
      const active = !get().cameraActive;
      set({ cameraActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_camera_state', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Camera Access Allowed' : 'Camera Access Denied',
        subtitle: active ? 'Apps can use camera' : 'Hardware blocked',
        duration: 2000
      });
    },

    toggleRotationLock: () => {
      const active = !get().rotationLockActive;
      set({ rotationLockActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_rotation_lock', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Rotation Locked' : 'Rotation Unlocked',
        subtitle: active ? 'Portrait locking' : 'Auto rotation active',
        duration: 2000
      });
    },

    toggleBatterySaver: () => {
      const active = !get().batterySaverActive;
      set({ batterySaverActive: active });
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Battery Saver Enabled' : 'Battery Saver Disabled',
        subtitle: active ? 'Status: Active' : 'Status: Off',
        duration: 2000
      });
    },

    toggleAirplaneMode: () => {
      const active = !get().airplaneModeActive;
      set({ airplaneModeActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_airplane_mode', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Airplane Mode Enabled' : 'Airplane Mode Disabled',
        subtitle: active ? 'All radios offline' : 'Radios restored',
        duration: 2000
      });
    },

    toggleMobileHotspot: () => {
      const active = !get().mobileHotspotActive;
      set({ mobileHotspotActive: active });
      if (tauriInvoke) {
        tauriInvoke('set_mobile_hotspot', { active }).catch(console.error);
      }
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Mobile Hotspot Enabled' : 'Mobile Hotspot Disabled',
        subtitle: active ? 'Status: Sharing active' : 'Status: Off',
        duration: 2000
      });
    },

    toggleNightLight: () => {
      const active = !get().nightLightActive;
      set({ nightLightActive: active });
      get().triggerNotification({
        type: 'bluetooth',
        title: active ? 'Night Light Enabled' : 'Night Light Disabled',
        subtitle: active ? 'Warm colors active' : 'Status: Off',
        duration: 2000
      });
    },

    togglePlayPause: () => {
      set((state) => ({ 
        media: { ...state.media, isPlaying: !state.media.isPlaying } 
      }));
    },

    setMediaProgress: (val: number) => {
      set((state) => ({
        media: { ...state.media, progress: Math.min(state.media.duration, Math.max(0, val)) }
      }));
    },

    nextTrack: () => {
      const songs = [
        { title: 'Starboy', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80' },
        { title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80' },
        { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80' },
        { title: 'After Hours', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100&q=80' }
      ];
      const currentSongIdx = songs.findIndex(s => s.title === get().media.title);
      const nextIdx = (currentSongIdx + 1) % songs.length;
      
      const newSong = songs[nextIdx];
      set({
        media: {
          isPlaying: true,
          title: newSong.title,
          artist: newSong.artist,
          album: 'Single',
          artwork: newSong.artwork,
          duration: 210,
          progress: 0
        }
      });

      get().triggerNotification({
        type: 'music',
        title: 'Now Playing',
        subtitle: `${newSong.title} - ${newSong.artist}`,
        extra: { artwork: newSong.artwork },
        duration: 3500
      });
    },

    prevTrack: () => {
      const songs = [
        { title: 'Starboy', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80' },
        { title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80' },
        { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80' }
      ];
      const currentSongIdx = songs.findIndex(s => s.title === get().media.title);
      let prevIdx = currentSongIdx - 1;
      if (prevIdx < 0) prevIdx = songs.length - 1;
      
      const newSong = songs[prevIdx];
      set({
        media: {
          isPlaying: true,
          title: newSong.title,
          artist: newSong.artist,
          album: 'Single',
          artwork: newSong.artwork,
          duration: 215,
          progress: 0
        }
      });

      get().triggerNotification({
        type: 'music',
        title: 'Now Playing',
        subtitle: `${newSong.title} - ${newSong.artist}`,
        extra: { artwork: newSong.artwork },
        duration: 3500
      });
    },

    triggerNotification: (notif) => {
      const id = Math.random().toString(36).substring(7);
      const newNotif = { ...notif, id };
      set({ activeNotification: newNotif });

      const currentHistory = get().notificationHistory;
      const updatedHistory = [newNotif, ...currentHistory].slice(0, 50);
      set({ notificationHistory: updatedHistory });
      localStorage.setItem('pisland-notification-history', JSON.stringify(updatedHistory));

      if (notif.duration) {
        setTimeout(() => {
          const active = get().activeNotification;
          if (active && active.id === id) {
            set({ activeNotification: null });
          }
        }, notif.duration);
      }
    },

    clearNotification: () => {
      set({ activeNotification: null });
    },

    clearNotificationHistory: () => {
      set({ notificationHistory: [] });
      localStorage.removeItem('pisland-notification-history');
    },

    addToClipboard: (text) => {
      const newItem: ClipboardItem = {
        id: Math.random().toString(),
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      set((state) => ({
        clipboardHistory: [newItem, ...state.clipboardHistory.slice(0, 9)]
      }));
    },

    clearClipboard: () => {
      set({ clipboardHistory: [] });
    },

    takeScreenshotSimulated: () => {
      const mockThumbnails = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&q=80'
      ];
      const randomThumb = mockThumbnails[Math.floor(Math.random() * mockThumbnails.length)];

      const screenshotText = `Screenshot_${new Date().toISOString().slice(0,10)}_${Math.round(Math.random()*1000)}.png`;
      get().addToClipboard(screenshotText);

      get().triggerNotification({
        type: 'screenshot',
        title: 'Screenshot Saved',
        subtitle: 'Copied to clipboard',
        extra: { thumbnail: randomThumb },
        duration: 4000
      });
    },

    updateStats: (cpu: number, ram: number) => {
      set({ cpuUsage: cpu, ramUsage: ram });
    },

    updateBattery: (level: number, charging: boolean) => {
      set({ 
        batteryLevel: level, 
        isCharging: charging,
        batteryTimeRemaining: charging ? 'Charging' : '3h 15m remaining'
      });
    }
  };
});

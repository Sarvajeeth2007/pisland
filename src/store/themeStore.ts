import { create } from 'zustand';

export type ThemeType = 
  | 'default-dark' 
  | 'light' 
  | 'nothing-os' 
  | 'glass' 
  | 'cyberpunk' 
  | 'oled-black' 
  | 'fluent' 
  | 'minimal';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Load initial theme from localStorage if available
  const initialTheme = (localStorage.getItem('pisland-theme') as ThemeType) || 'default-dark';
  
  // Set HTML data-theme attribute on load
  document.documentElement.setAttribute('data-theme', initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('pisland-theme', theme);
      set({ theme });
    },
  };
});

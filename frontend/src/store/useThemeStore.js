// src/store/useThemeStore.js
import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'halloween', // Default theme
  setTheme: (newTheme) => {
    console.log('Setting theme to:', newTheme); // Debug
    set({ theme: newTheme });
  },
}));
import { create } from 'zustand';

interface NavState {
  isNavOpen: boolean;
  currentSection: 'home' | 'portfolio' | 'about';
  setNavOpen: (isOpen: boolean) => void;
  setCurrentSection: (section: 'home' | 'portfolio' | 'about') => void;
}

export const useNavStore = create<NavState>((set) => ({
  isNavOpen: false,
  currentSection: 'home',
  setNavOpen: (isOpen) => set({ isNavOpen: isOpen }),
  setCurrentSection: (section) => set({ currentSection: section }),
}));

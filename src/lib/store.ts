import { create } from "zustand";

interface AppState {
  scroll: number;
  setScroll: (scroll: number) => void;
}

export const useStore = create<AppState>((set) => ({
  scroll: 0,
  setScroll: (scroll) => set({ scroll }),
}));

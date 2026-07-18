import { create } from 'zustand';

interface UIState {
  searchOpen: boolean;
  quickAddOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  quickAddOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
}));

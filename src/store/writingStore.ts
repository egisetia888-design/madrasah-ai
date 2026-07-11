import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { Draft } from '../types';

localforage.config({
  name: 'madrasah_db',
  storeName: 'writing_store'
});

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

interface WritingState {
  drafts: Draft[];
  
  addDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateDraft: (id: string, draft: Partial<Draft>) => void;
  deleteDraft: (id: string) => void;
}

export const useWritingStore = create<WritingState>()(
  persist(
    (set, get) => ({
      drafts: [],
      
      addDraft: (draftData) => {
        const id = crypto.randomUUID();
        set((state) => ({
          drafts: [
            {
              ...draftData,
              id,
              status: 'draft',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.drafts
          ]
        }));
        return id;
      },
      
      updateDraft: (id, draftData) => set((state) => ({
        drafts: state.drafts.map(d => 
          d.id === id 
            ? { ...d, ...draftData, updatedAt: Date.now() } 
            : d
        )
      })),
      
      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter(d => d.id !== id)
      })),
    }),
    {
      name: 'madrasah-writing-storage-v2',
      storage: createJSONStorage(() => storage),
    }
  )
);

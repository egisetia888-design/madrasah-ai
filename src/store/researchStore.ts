import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { Paper } from '../types';

localforage.config({
  name: 'madrasah_db',
  storeName: 'research_store'
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

interface ResearchState {
  papers: Paper[];
  
  addPaper: (paper: Omit<Paper, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updatePaper: (id: string, paper: Partial<Paper>) => void;
  deletePaper: (id: string) => void;
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      papers: [],
      
      addPaper: (paperData) => set((state) => ({
        papers: [
          {
            ...paperData,
            id: crypto.randomUUID(),
            status: 'idea',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...state.papers
        ]
      })),
      
      updatePaper: (id, paperData) => set((state) => ({
        papers: state.papers.map(p => 
          p.id === id 
            ? { ...p, ...paperData, updatedAt: Date.now() } 
            : p
        )
      })),
      
      deletePaper: (id) => set((state) => ({
        papers: state.papers.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'madrasah-research-storage-v2',
      storage: createJSONStorage(() => storage),
    }
  )
);

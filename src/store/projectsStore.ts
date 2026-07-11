import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { Project, Task, TaskStatus } from '../types';

localforage.config({
  name: 'madrasah_db',
  storeName: 'projects_store'
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

interface ProjectsState {
  projects: Project[];
  tasks: Task[];
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskTitle: (id: string, title: string) => void;
  deleteTask: (id: string) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      tasks: [],
      
      addProject: (projectData) => {
        const id = crypto.randomUUID();
        set((state) => ({
          projects: [
            {
              ...projectData,
              id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.projects
          ]
        }));
        return id;
      },
      
      updateProject: (id, projectData) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === id 
            ? { ...p, ...projectData, updatedAt: Date.now() } 
            : p
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.filter(t => t.projectId !== id),
      })),

      addTask: (taskData) => set((state) => {
        return {
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
          ]
        }
      }),

      updateTaskStatus: (id, status) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id 
            ? { ...t, status, updatedAt: Date.now() } 
            : t
        )
      })),

      updateTaskTitle: (id, title) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id 
            ? { ...t, title, updatedAt: Date.now() } 
            : t
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
    }),
    {
      name: 'madrasah-projects-storage-v2',
      storage: createJSONStorage(() => storage),
    }
  )
);

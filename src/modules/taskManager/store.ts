import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title) => 
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: Date.now().toString(), title, completed: false, createdAt: Date.now() },
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      editTask: (id, title) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, title } : t
          ),
        })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

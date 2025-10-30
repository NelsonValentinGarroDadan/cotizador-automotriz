import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Store simple
export const useStore = create(
  devtools(
    persist(
      (set) => ({
        // Estado inicial vacío
        data: null,
        
        // Acciones básicas
        setData: (data: any) => set({ data }),
        clearData: () => set({ data: null }),
      }),
      {
        name: 'aauth-storage',
      }
    )
  )
);

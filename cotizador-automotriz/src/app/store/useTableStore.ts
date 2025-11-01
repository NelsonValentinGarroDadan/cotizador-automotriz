/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
  };
}

interface TableActions {
  setFilters: (filters: Record<string, any>) => void;
  setPagination: (page: number, limit: number) => void;
  resetFilters: () => void;
}

// Factory para crear stores independientes por tabla
export const createTableStore = (tableId: string, defaultLimit: number = 50) => {
  return create<TableState & TableActions>()(
    persist(
      (set) => ({
        filters: {},
        pagination: {
          page: 1,
          limit: defaultLimit,
        },

        setFilters: (filters) => set({ filters }),
        
        setPagination: (page, limit) =>
          set({ pagination: { page, limit } }),
        
        resetFilters: () => set({ filters: {} }),
      }),
      {
        name: `table-${tableId}`, // Storage único por tabla
      }
    )
  );
};

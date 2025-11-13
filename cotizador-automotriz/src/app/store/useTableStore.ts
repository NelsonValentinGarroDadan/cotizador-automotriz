/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  filters: Record<string, any>;
  pagination: {
    page: number;
    limit: number;
  };
  sort: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

interface TableActions {
  setFilters: (filters: Record<string, any>) => void;
  setPagination: (page: number, limit: number) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

// Factory para crear stores independientes por tabla
export const createTableStore = (tableId: string, defaultLimit: number = 50, defaultSortBy: string = 'id') => {
  return create<TableState & TableActions>()(
    persist(
      (set) => ({
        filters: {},
        pagination: {
          page: 1,
          limit: defaultLimit,
        },
        sort: {
          sortBy: defaultSortBy,
          sortOrder: 'asc',
        },

        setFilters: (filters) => set({ filters }),
        
        setPagination: (page, limit) =>
          set({ pagination: { page, limit } }),

        setSort: (sortBy, sortOrder) =>
          set({ sort: { sortBy, sortOrder } }),

        resetFilters: () => set({ filters: {} }),
        resetAll: () => set({
          filters: {},
          pagination: { page: 1, limit: 50 },
          sort: { sortBy: "createdAt", sortOrder: "desc" }
        }),

      }),
      {
        name: `table-${tableId}`, // Storage único por tabla
      }
    )
  );
};

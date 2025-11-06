import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated:boolean
}

interface AuthActions {
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,

      // Acciones
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error('Error rehydrating auth store:', error);
      } else {
        // ⚠️ Importante: usar set() dentro del callback
        setTimeout(() => {
          useAuthStore.setState({ hydrated: true });
        }, 0);
      }
    },
    }
  )
);
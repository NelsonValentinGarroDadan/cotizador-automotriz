'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  role?: 'ADMIN' | 'USER';
  [key: string]: unknown;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

export const useAuthRedirect = (allowedRoles?: Array<'ADMIN' | 'USER'>) => {
  const router = useRouter();
  const { isAuthenticated, token, logout, hydrated } = useAuthStore();

  const isPopup = typeof window !== 'undefined' && window.opener;

  useEffect(() => {
    if (!hydrated) return;

    // ================
    // 1️⃣ NO AUTENTICADO
    // ================
    if (!isAuthenticated || !token || isTokenExpired(token)) {
      logout();

      if (isPopup) {
        window.opener?.postMessage({ unauthorized: true }, window.location.origin);
        window.close();
        return;
      }

      router.replace('/');
      return;
    }

    // =======================
    // 2️⃣ VALIDACIÓN DE ROLES
    // =======================
    if (allowedRoles?.length && token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role;

      if (!allowedRoles.includes(role!)) {
        if (isPopup) {
          // 🔥 cerrar ventana y avisar al padre
          window.opener?.postMessage({ unauthorized: true }, window.location.origin);
          window.close();
          return;
        }

        router.replace('/dashboard');
        return;
      }
    }

  }, [hydrated, isAuthenticated, token, allowedRoles, router, logout, isPopup]);
};

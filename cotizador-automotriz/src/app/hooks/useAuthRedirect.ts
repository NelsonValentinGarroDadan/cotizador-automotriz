'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  expiresIn: number;
  role?: 'ADMIN' | 'USER';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.expiresIn < currentTime;
  } catch {
    return true;
  }
};

export const useAuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, logout, hydrated } = useAuthStore();

  useEffect(() => {
    // Esperar hasta que el store esté cargado
    if (!hydrated) return;

    // Token expirado → logout
    if (token && isTokenExpired(token)) {
      logout();
      router.replace('/');
      return;
    }

    // No autenticado → redirigir a login
    if (!isAuthenticated && pathname !== '/') {
      router.replace('/');
      return;
    }

    // Autenticado → verificar rol y rutas
    if (isAuthenticated && token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role;
      const baseDashboard =
        role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';

      // Si está en '/' → redirigir a su dashboard
      if (pathname === '/') {
        router.replace(baseDashboard);
        return;
      }

      // Si está en dashboard equivocado → redirigir al correcto
      if (
        (role === 'ADMIN' && !pathname.startsWith('/dashboard/admin')) ||
        (role === 'USER' && !pathname.startsWith('/dashboard/user'))
      ) {
        router.replace(baseDashboard);
        return;
      }
    }
  }, [hydrated, isAuthenticated, token, pathname, router, logout]);
};

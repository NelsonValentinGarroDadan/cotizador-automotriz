'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number; // en JWT estándar se usa "exp", no "expiresIn"
  role?: 'ADMIN' | 'USER';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const useAuthRedirect = (allowedRoles?: Array<'ADMIN' | 'USER'>) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, logout, hydrated } = useAuthStore();

  useEffect(() => { 
    if (!hydrated) return; 
    // Si hay token pero está expirado
    if (token && isTokenExpired(token)) {
      logout();
      router.replace('/');
      return;
    }

    // Si no está autenticado
    if (!isAuthenticated && pathname !== '/') {
      router.replace('/');
      return;
    }

    // Si está autenticado, decodificar rol
    if (isAuthenticated && token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role; 
      const baseDashboard =
        role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user';

      // Redirigir según rol
      if (pathname === '/') {
        router.replace(baseDashboard);
        return;
      }

      // Si intenta acceder al dashboard equivocado
      const allowedExternalPaths = [
        '/companies', // cualquier ruta que empiece con /companies
        '/users',     // por ejemplo, si en el futuro agregás /users/create, /users/edit...
      ];

      const isAllowedExternalPath = allowedExternalPaths.some((allowed) =>
        pathname.startsWith(allowed)
      );

      if (
        role === 'ADMIN' &&
        !pathname.startsWith('/dashboard/admin') &&
        !isAllowedExternalPath
      ) {
        router.replace(baseDashboard);
        return;
      }


      // 🚨 Nuevo: Verificar roles permitidos si el hook lo recibe
      if (allowedRoles && !allowedRoles.includes(role!)) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [hydrated, isAuthenticated, token, pathname, router, logout, allowedRoles]);
};

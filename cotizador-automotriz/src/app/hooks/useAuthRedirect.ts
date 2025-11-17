'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import { Role } from '../types';

interface JwtPayload {
  exp: number;
  role?: Role;
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

export const useAuthRedirect = (allowedRoles?: Role[]) => {
  const router = useRouter();
  const { isAuthenticated, token, hydrated } = useAuthStore();

  const isPopup = typeof window !== 'undefined' && window.opener;

  useEffect(() => {
    if (!hydrated) return;

    // 1) No autenticado, sin token o token expirado: solo redirigir
    if (!isAuthenticated || !token || isTokenExpired(token)) {
      if (isPopup) {
        window.opener?.postMessage({ unauthorized: true }, window.location.origin);
        window.close();
        return;
      }

      router.replace('/');
      return;
    }

    // 2) Validación de roles
    if (allowedRoles?.length && token) {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role;

      if (!role || !allowedRoles.includes(role)) {
        if (isPopup) {
          window.opener?.postMessage({ unauthorized: true }, window.location.origin);
          window.close();
          return;
        }

        router.replace('/dashboard');
        return;
      }
    }
  }, [hydrated, isAuthenticated, token, allowedRoles, router, isPopup]);
};


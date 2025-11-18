 'use client';

  import { useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuthStore } from '@/app/store/useAuthStore';
  import { Role } from '@/app/types';

  export default function DashboardHomePage() {
    const { user, hydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!hydrated) return;
      if (!user) return;
      setTimeout(()=>{
        if (user.role === Role.SUPER_ADMIN) {
          router.replace('/dashboard/companias'); // gestión de compañías
        } else if (user.role === Role.ADMIN) {
          router.replace('/dashboard/planes'); // planes para admins
        } else {
          router.replace('/dashboard/historial-cotizaciones'); // historial para usuarios
        }
      },500)
    }, [hydrated, user, router]);

    if (!hydrated) {
      return (
        <section className="w-full px-5 min-h-screen flex items-center justify-center">
          <p className="text-white">Cargando...</p>
        </section>
      );
    }

    // Mientras redirige, no mostramos nada más.
    return (
      <section className="w-full px-5 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-white text-sm">Cargando dashboard...</p>
        </div>
      </section>
    );
  }
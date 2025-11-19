"use client";

import Header from "@/app/components/header";
import NavDashboard from "../components/navDashboard";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
import { useAuthStore } from "../store/useAuthStore";
import { Role } from "@/app/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Solo validar que haya usuario (no rol)
  useAuthRedirect();

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const isAdmin = user?.role === Role.ADMIN;

  const navLinks = isSuperAdmin
    ? [
        { label: "Compañias", href: "/dashboard/companias" },
        { label: "Planes", href: "/dashboard/planes" },
        { label: "Vehiculos", href: "/dashboard/vehiculos" },
        { label: "Administradores", href: "/dashboard/administradores" },
        { label: "Superadmins", href: "/dashboard/superadmins" },
        { label: "Usuarios", href: "/dashboard/usuarios" },
        { label: "Historial de cotizaciones", href: "/dashboard/historial-cotizaciones" },
      ]
    : isAdmin
      ? [
          { label: "Planes", href: "/dashboard/planes" },
          { label: "Vehiculos", href: "/dashboard/vehiculos" },
          { label: "Usuarios", href: "/dashboard/usuarios" },
          { label: "Historial de cotizaciones", href: "/dashboard/historial-cotizaciones" },
        ]
      : [
          { label: "Planes", href: "/dashboard/planes" },
          { label: "Historial de cotizaciones", href: "/dashboard/historial-cotizaciones" },
          {
            label: "Crear cotizaciones",
            href: "/",
            action: "Crear cotizacion",
            urlAction: "/HC/create",
            widtgAction: 900,
          },
        ];

  return (
    <>
      <Header />

      <section className="w-full h-auto">
        <NavDashboard navsLinks={navLinks} />
        {children}
      </section>
    </>
  );
}


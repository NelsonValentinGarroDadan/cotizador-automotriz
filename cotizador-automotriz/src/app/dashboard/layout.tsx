"use client";

import Header from "@/app/components/header";
import NavDashboard from "../components/navDashboard"; 
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
import { useAuthStore } from "../store/useAuthStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  // Solo validar que haya usuario (no rol)
  useAuthRedirect();

  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const navLinks = isAdmin
    ? [
        { label:"Compañías", href:"/dashboard" },
        { label:"Planes", href:"/dashboard/planes" },
        { label:"Administradores", href:"/dashboard/administradores" },
        { label:"Usuarios", href:"/dashboard/usuarios" },
        { label:"Historial de cotizaciones", href:"/dashboard/historial-cotizaciones" },
      ]
    : [
        { label:"Compañías", href:"/dashboard" },
        { label:"Planes", href:"/dashboard/planes" },
        { label:"Historial de cotizaciones", href:"/dashboard/historial-cotizaciones" },
        {
          label:"Crear cotizaciones",
          href:"/",
          action:"Crear cotización",
          urlAction:"/HC/create",
          widtgAction:900
        }
      ];

  return (
    <>
      <Header />

      <section className="flex w-full h-auto">
        <NavDashboard navsLinks={navLinks} />
        {children}
      </section>
    </>
  );
}

"use client"
import Header from "@/app/components/header";
import NavDashboard from "../../components/navDashboard";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navsLinks = [
        {
            label:"Compañias",
            href:"/dashboard/admin"
        },
        {
            label:"Planes",
            href:"/dashboard/admin/planes"
        },
        {
            label:"Administradores",
            href:"/dashboard/admin/administradores"
        },
        {
            label:"Usuarios",
            href:"/dashboard/admin/usuarios"
        },
        {
            label:"Historial de cotizaciones",
            href:"/dashboard/admin/historial-cotizaciones"
        }, 
        
    ]; 
    useAuthRedirect(['ADMIN']);
  return ( 
    <>
      <Header />
      <section className="flex w-full h-auto items-start justify-start  ">
        <NavDashboard navsLinks={navsLinks} />
        {children}
      </section>

    </>
  );
}

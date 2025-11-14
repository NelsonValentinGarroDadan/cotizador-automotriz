"use client"
import Header from "@/app/components/header";
import NavDashboard, { NavItem } from "../../components/navDashboard";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navsLinks: NavItem[] = [
        {
            label:"Compañias",
            href:"/dashboard/user"
        },
        {
            label:"Planes",
            href:"/dashboard/user/planes"
        }, 
        {
            label:"Historial de cotizaciones",
            href:"/dashboard/user/historial-cotizaciones"
        }, 
        {
          label:"Crear cotizaciones",
          href: "/",
          action: "Crear cotizaciones",
          urlAction:"/HC/create",
          widtgAction: 900
        }
        
    ]; 
    useAuthRedirect(['USER']);
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

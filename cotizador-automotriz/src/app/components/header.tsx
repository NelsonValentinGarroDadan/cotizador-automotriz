"use client"
import { Calculator, FileText, Settings, TrendingUp, Users } from "lucide-react";
import Link from "next/link"; 
import { usePathname } from "next/navigation";

export default function Header(){
    const classLink = "flex gap-2 items-center justify-center py-1 px-3 hover:opacity-90 text-sm md:text-xl rounded-lg ";
    const classActive = "bg-black text-white";
    const classInactive = "text-black";
    const pathname = usePathname();  
    const firstSegment = pathname.split('/')[1]; 
    return (
        <header className="bg-white fixed top-0 py-3 md:py-5 gap-3 flex flex-col xl:flex-row items-center justify-between w-full shadow-[2px_0_5px_rgba(0,0,0,1)] ">
            <Link href="/" className="flex items-center justify-center w-full gap-2 text-black text-lg md:text-3xl font-sans font-bold">
                <FileText className="w-6 h-6 md:w-12 md:h-12 text-black"/>
                Simulador de Créditos ANZ
            </Link>
            <nav className="w-full grid grid-cols-2 md:grid-cols-4 px-5 gap-3">
                <Link href="/" className={`${classLink} ${firstSegment === ""  ? classActive : classInactive}`}>
                    <Calculator className="w-4 h-4 md:w-6 md:h-6"/> Simulador
                </Link>
                <Link href="/leasing" className={`${classLink} ${firstSegment === "leasing" ? classActive : classInactive}`}>
                    <TrendingUp className="w-4 h-4 md:w-6 md:h-6"/> Leasing
                </Link>
                <Link href="/planes" className={`${classLink} ${firstSegment === "planes" ? classActive : classInactive}`}>
                    <Settings className="w-4 h-4 md:w-6 md:h-6"/> Planes
                </Link>
                <Link href="/empleados" className={`${classLink} ${firstSegment === "empleados" ? classActive : classInactive}`}>
                    <Users className="w-4 h-4 md:w-6 md:h-6"/> Empleados
                </Link>
            </nav>
        </header>
    );
}
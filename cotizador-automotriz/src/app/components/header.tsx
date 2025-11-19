"use client" 
import Image from "next/image";
import Link from "next/link";  
import { useAuthStore } from "../store/useAuthStore"; 
import { useState } from "react";
import { capitalizeWords } from "../lib/capitalizeWords";
import { usePathname } from "next/navigation";

export default function Header(){ 
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuthStore();
    const home = isAuthenticated ? "/dashboard" : "/"; 
    const [date] = useState(new Date());  
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }; 

    const formattedDate = date.toLocaleDateString('es-AR', options);
    const formattedDateCapitalized = capitalizeWords(formattedDate);
    if(pathname === "/dashboard") return null;
    return (
        <header className="bg-white py-3 h-auto md:h-[10vh] md:py-3 gap-3 flex flex-col xl:flex-row items-center justify-between w-full shadow-[2px_0_5px_rgba(0,0,0,1)] px-5">
            
            <Link href={home} className="flex items-center justify-center gap-4">
                <Image
                    src="/imgs/logo_dms.jpeg"
                    alt="Logo CMDS"
                    width={1000}
                    height={1000}
                    className="w-30 h-10 object-contain"
                />
                <span className="text-2xl text-black font-bold">
                    Simulador de Créditos Automotrices
                </span>
            </Link>

            <div className="flex flex-col md:flex-row items-center justify-end gap-4">
                <span className="text-lg text-gray-600">{formattedDateCapitalized}</span> 
                {isAuthenticated && user && (
                    <span className="text-2xl font-semibold text-gray-800">{user.firstName}</span>
                )}
            </div>
        </header>
    );
}

"use client" 
import Image from "next/image";
import Link from "next/link";  
import { useAuthStore } from "../store/useAuthStore"; 
import { useState, useEffect } from "react";

export default function Header(){ 
    const { isAuthenticated, user } = useAuthStore();
    const home = isAuthenticated ? "/dashboard" : "/";

    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const formattedDate = date.toLocaleDateString('es-AR', options);

    // Hora en 24h, con dos dígitos en horas, minutos y segundos
    const formattedTime = date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return (
        <header className="bg-white fixed top-0 py-3 md:py-3 gap-3 flex flex-col xl:flex-row items-center justify-between w-full shadow-[2px_0_5px_rgba(0,0,0,1)] px-5">
            
            <Link href={home} className="flex items-center justify-center gap-4">
                <Image
                    src="/imgs/logo_dms.jpeg"
                    alt="Logo CMDS"
                    width={1000}
                    height={1000}
                    className="w-30 h-10 object-contain"
                />
                <span className="text-xl text-black font-bold">
                    Simulador de Créditos Automotrices
                </span>
            </Link>

            <div className="flex flex-col md:flex-row items-center justify-end gap-4">
                <span className="text-sm text-gray-600">{formattedDate}</span>
                <span className="text-sm text-gray-600 font-mono w-[100px] text-center">{formattedTime}</span>
                {isAuthenticated && user && (
                    <span className="text-lg font-semibold text-gray-800">{user.firstName}</span>
                )}
            </div>
        </header>
    );
}

"use client" 
import Image from "next/image";
import Link from "next/link";  

export default function Header(){ 
    return (
        <header className="bg-white fixed top-0 py-3 md:py-3 gap-3 flex flex-col xl:flex-row items-center justify-between w-full shadow-[2px_0_5px_rgba(0,0,0,1)] ">
            <Link href="/" className="flex items-center justify-center px-5">
                <Image
                    src="/imgs/logo_dms.jpeg"
                    alt="Logo CMDS"
                    width={1000}
                    height={1000}
                    className="w-30 h-10 object-contain "
                />
                <span className="text-xl text-black font-bold">Simulador de Créditos Automotrices</span>
            </Link> 
        </header>
    );
}
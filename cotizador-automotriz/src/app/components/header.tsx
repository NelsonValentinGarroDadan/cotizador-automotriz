import { Calculator, FileText, Settings, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function Header(){
    return (
        <header className="fixed top-0 py-3 md:py-5 gap-3 flex flex-col md:flex-row items-center justify-between w-full shadow-[2px_0_5px_rgba(0,0,0,1)] ">
            <Link href="/" className="flex items-center justify-center w-full gap-2 text-black text-lg md:text-3xl font-sans font-bold">
                <FileText className="w-6 h-6 md:w-12 md:h-12 text-black"/>
                Simulador de Créditos ANZ
            </Link>
            <nav className="w-full grid grid-cols-2 md:grid-cols-4 px-5 gap-3">
                <Link href="/" className="text-white flex gap-2 items-center justify-center py-1 px-3 bg-black hover:opacity-90 text-sm md:text-xl rounded-lg"><Calculator className="w-4 h-4 md:w-6 md:h-6"/> Simulador</Link>
                <Link href="/leasing" className="text-black flex gap-2 items-center justify-center py-1 px-3 hover:bg-black/40  text-sm md:text-xl rounded-lg"><TrendingUp className="w-4 h-4 md:w-6 md:h-6"/> Leasing</Link>
                <Link href="/" className="text-black flex gap-2 items-center justify-center py-1 px-3 hover:bg-black/40 text-sm md:text-xl rounded-lg"><Settings className="w-4 h-4 md:w-6 md:h-6"/> Planes</Link>
                <Link href="/" className="text-black flex gap-2 items-center justify-center py-1 px-3 hover:bg-black/40  text-sm md:text-xl rounded-lg"><Users className="w-4 h-4 md:w-6 md:h-6"/> Empleados</Link>
            </nav>
        </header>
    );
}
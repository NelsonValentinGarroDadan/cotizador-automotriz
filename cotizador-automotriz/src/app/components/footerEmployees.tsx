import { useEffect, useRef, useState } from "react"; 
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { User } from "../types/user";

export default function FooterEmployees({
    employes,
    activeSheet,
    setActiveSheet
}:{
    employes: User[];
    activeSheet: User;
    setActiveSheet: (employe: User) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredEmployes = employes.filter(emp => {
    const search = searchTerm.toLowerCase().trim();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const reverseName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
    const initialFormat = `${emp.firstName.charAt(0)}. ${emp.lastName}`.toLowerCase();
    
    return fullName.includes(search) || 
           reverseName.includes(search) || 
           initialFormat.includes(search) ||
           emp.firstName.toLowerCase().includes(search) ||
           emp.lastName.toLowerCase().includes(search);
  });

  const formatName = (employe: User) => {
    return `${employe.firstName.charAt(0)}. ${employe.lastName}`;
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (searchTerm && filteredEmployes.length > 0) {
      setActiveSheet(filteredEmployes[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <article className="bg-white fixed bottom-0 w-full shadow-[-2px_0_5px_rgba(0,0,0,1)]">
      {/* Buscador - arriba en mobile, inline en desktop */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-gray-300 md:hidden">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o apellido..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Contenedor principal con pestañas */}
      <div className="flex items-center justify-between">
        {/* Botón de búsqueda */}
        <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-300">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Buscar empleado"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador expandible - solo desktop */}
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 border-r border-gray-300 animate-in slide-in-from-left">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o apellido..."
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm w-48"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Botón scroll izquierda */}
        <button
          onClick={scrollLeft}
          className="p-2 hover:bg-gray-100 transition-colors shrink-0"
          title="Scroll izquierda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Contenedor de pestañas con scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-start justify-start overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredEmployes.length === 0 ? (
            <div className="py-2 px-4 text-gray-400 text-sm">
              No se encontraron empleados
            </div>
          ) : (
            filteredEmployes.map((employe) => (
              <div
                key={employe.id}
                onClick={() => setActiveSheet(employe)}
                className={`
                  shadow-[-1px_0px_1px_rgba(0,0,0,.5)]
                  py-2 px-4 cursor-pointer
                  whitespace-nowrap
                  transition-all duration-200
                  hover:bg-gray-50
                  shrink-0
                  ${
                    activeSheet.id !== employe.id
                      ? 'opacity-40'
                      : 'border-t-2 border-black font-semibold'
                  }
                `}
              >
                {formatName(employe)}
              </div>
            ))
          )}
        </div>

        {/* Botón scroll derecha */}
        <button
          onClick={scrollRight}
          className="p-2 hover:bg-gray-100 transition-colors shrink-0"
          title="Scroll derecha"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </article>
  );
}
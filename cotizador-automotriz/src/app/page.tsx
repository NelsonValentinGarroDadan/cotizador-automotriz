"use client";
import { useState } from "react";
import Employe from "./types/employe";
import FooterEmployees from "./components/footerEmployees";
import { formatMoney } from "./lib/formatMoney";
import { Check } from "lucide-react";

export default function Home() {
  const employes = [
    { id: 1, name: "Juan", lastName: "Perez" },
    { id: 2, name: "Maria", lastName: "Gomez" },
    { id: 3, name: "Carlo", lastName: "Sanchez" },
    { id: 4, name: "Azul", lastName: "Martinez" },
    { id: 5, name: "Leon", lastName: "Rodriguez" },
    { id: 6, name: "Sol", lastName: "Lopez" },
  ];
  
  const [activeSheet, setActiveSheet] = useState<Employe>(employes[0]);
  const [mont, setMont] = useState<number>(100000);
  const [inputValue, setInputValue] = useState<string>(formatMoney(100000));
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  
  if(!employes) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Solo permitir números, puntos y comas
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Evitar múltiples comas
    const commaCount = (cleanValue.match(/,/g) || []).length;
    if (commaCount > 1) return;
    
    if (cleanValue === '' || cleanValue === ',' || cleanValue === '.') {
      setInputValue('');
      setMont(0);
      setIsConfirmed(false);
      return;
    }
    
    // Remover puntos (separadores de miles) y convertir coma a punto decimal
    const numericString = cleanValue.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(numericString);
    
    if (!isNaN(numericValue)) {
      // Redondear correctamente: si el 3er decimal es >= 5, redondear arriba
      const rounded = Math.round(numericValue * 100) / 100;
      setMont(rounded);
      setInputValue(formatMoney(rounded));
      setIsConfirmed(false);
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true); 
  };

  return (
    <div className="min-h-screen container">  
      <div className="flex flex-col justify-start items-start w-[90%] shadow-[0_0_5px_rgba(0,0,0,.7)] rounded-xl p-8 gap-3">
        <h1 className="text-black text-2xl">Monto a Financiar</h1> 
        
        <div className="relative w-full">
          <input
            type="text"
            className={`bg-transparent border-none w-full font-jetbrains text-xl shadow-[0_0_15px_rgba(0,0,0,.4)] p-4 pr-20 rounded-lg transition-all focus:outline-none focus:shadow-[0_0_10px_rgba(0,0,0,.8)] ${isConfirmed ? 'opacity-70' : ''}`}
            placeholder="100.000,00"
            value={inputValue}
            onChange={handleInputChange}
            disabled={isConfirmed}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-black/90 text-xl pointer-events-none">
            ARS
          </span>
        </div>
        
        <div className="flex items-center justify-between w-full">
          <p className="text-black/90 text-lg">Monto: ${formatMoney(mont)}</p>
          
          <button
            onClick={handleConfirm}
            disabled={mont === 0 || isConfirmed}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg cursor-pointer  font-semibold transition-all ${
              isConfirmed 
                ? 'bg-green-500 text-white cursor-default'
                : mont === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-black/90 shadow-[0_0_10px_rgba(0,0,0,.3)]'
            }`}
          >
            {isConfirmed ? (
              <>
                <Check className="w-5 h-5" />
                Confirmado
              </>
            ) : (
              'Confirmar Monto'
            )}
          </button>
        </div>
         
      </div> 
      {
        isConfirmed ?
          null 
        : <p className="text-center text-red text-xl w-full my-5">Ingrese el monton para visualizar los planes</p>
      }
      <FooterEmployees 
        employes={employes} 
        activeSheet={activeSheet} 
        setActiveSheet={setActiveSheet} 
      />
    </div>
  );
}
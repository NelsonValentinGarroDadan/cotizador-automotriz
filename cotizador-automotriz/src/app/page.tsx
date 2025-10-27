"use client";
import { useState } from "react";
import Employe from "./types/employe";
import FooterEmployees from "./components/footerEmployees";

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
  if(!employes) return null;
  return (
    <div className="min-h-screen"> 

      <FooterEmployees employes={employes} activeSheet={activeSheet} setActiveSheet={setActiveSheet} />
    </div>
  );
}

import { FilterConfig } from "@/app/types/table";

export const companyFilters: FilterConfig[] = [
  {
    name: "search",
    label: "Buscar por nombre",
    type: "text",
    placeholder: "Ej: AutoPlus",
  },  
  {
    name: "fechaCreacion",
    label: "Fecha de creación desde",
    type: "date",
  },
];

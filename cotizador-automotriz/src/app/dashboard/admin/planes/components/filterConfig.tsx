// app/planes/components/filterConfig.ts
import { FilterConfig } from "@/app/types/table";

export const getPlanFilters = (companies: { id: string; name: string }[]): FilterConfig[] => [
  {
    name: "search",
    label: "Buscar por nombre",
    type: "text",
    placeholder: "Ej: Plan Premium",
  },
  {
    name: "companyIds", // ✅ Cambiar a array
    label: "Filtrar por compañías",
    type: "multiselect", // ✅ Usar multiselect
    placeholder: "Todas las compañías",
    options: companies.map(c => ({ value: c.id, label: c.name })),
  },
];
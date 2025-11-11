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
    name: "companyId",
    label: "Filtrar por compañía",
    type: "select",
    placeholder: "Todas las compañías",
    options: [
      { value: '', label: 'Todas las compañías' },
      ...companies.map(c => ({ value: c.id, label: c.name })),
    ],
  },
  {
    name: "fechaCreacion",
    label: "Fecha de creación desde",
    type: "date",
  },
];
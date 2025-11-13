import { Company } from "@/app/types/compay";
import { FilterConfig } from "@/app/types/table";

export const quotationFilters = ({ companies }: { companies: Company[] }): FilterConfig[] => [
  {
    name: "search",
    label: "Buscar por cliente o DNI",
    type: "text",
    placeholder: "Ej: Juan Pérez o 30123456",
  },
  {
    name: "companyIds",
    label: "Filtrar por compañía",
    type: "multiselect",
    placeholder: "Seleccionar compañía...",
    options: companies.map((c) => ({ value: c.id, label: c.name })),
    multiple: true,
  },
  {
    name: "fechaDesde",
    label: "Desde",
    type: "date",
  },
  {
    name: "fechaHasta",
    label: "Hasta",
    type: "date",
  },
];

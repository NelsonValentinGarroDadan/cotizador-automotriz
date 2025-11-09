import { Company } from "@/app/types/compay";
import { FilterConfig } from "@/app/types/table";

export const adminsFilters = ({companies}: {companies: Company[]}): FilterConfig[] => [
  {
    name: "search",
    label: "Buscar por nombre o email",
    type: "text",
    placeholder: "Ej: Juan Pérez o admin@example.com",
  },
  {
    name: "companyIds", // ✅ Este será el parámetro que se envíe al backend
    label: "Filtrar por compañías",
    type: "multiselect",
    placeholder: "Selecciona una o varias compañías",
    options: companies.map(company => ({
      value: company.id,
      label: company.name
    })),
    multiple: true,
  }, 
];
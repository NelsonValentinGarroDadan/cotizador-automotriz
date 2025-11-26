import { Company } from "@/app/types/compay";
import { FilterConfig } from "@/app/types/table";

export const adminsFilters = ({
  companies, 
}: {
  companies: Company[]; 
}): FilterConfig[] => {
  const array: FilterConfig[] = [
    {
      name: "search",
      label: "Buscar por nombre o email",
      type: "text",
      placeholder: "Ej: Juan Perez o admin@example.com",
    },
  ];
  if (companies.length > 1) {
    array.push({
      name: "companyIds",
      label: "Filtrar por compañnias",
      type: "multiselect",
      placeholder: "Selecciona una o varias compañias",
      options: companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
      multiple: true,
    });
  }

  return array;
};

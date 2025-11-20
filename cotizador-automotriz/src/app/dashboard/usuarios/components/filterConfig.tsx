import { Company } from "@/app/types/compay";
import { FilterConfig } from "@/app/types/table";

export const usersFilters = ({
  companies,
  showCompanyFilter,
}: {
  companies: Company[];
  showCompanyFilter: boolean;
}): FilterConfig[] => {
  const filters: FilterConfig[] = [
    {
      name: "search",
      label: "Buscar por nombre o email",
      type: "text",
      placeholder: "Ej: Juan Pérez o admin@example.com",
    },
  ];

  if (showCompanyFilter) {
    filters.push({
      name: "companyIds",
      label: "Filtrar por compañías",
      type: "multiselect",
      placeholder: "Selecciona una o varias compañías",
      options: companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
      multiple: true,
    });
  }

  return filters;
};


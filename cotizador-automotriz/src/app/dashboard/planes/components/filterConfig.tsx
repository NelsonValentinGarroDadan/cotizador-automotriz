// app/planes/components/filterConfig.ts
import { FilterConfig } from "@/app/types/table";

export const getPlanFilters = (
  companies: { id: string; name: string }[],
  showCompanyFilter: boolean
): FilterConfig[] => {
  const filters: FilterConfig[] = [
    {
      name: "search",
      label: "Buscar por nombre",
      type: "text",
      placeholder: "Ej: Plan Premium",
    },
  ];

  if (showCompanyFilter) {
    filters.push({
      name: "companyIds",
      label: "Filtrar por compañías",
      type: "multiselect",
      placeholder: "Todas las compañías",
      options: companies.map((c) => ({ value: c.id, label: c.name })),
    });
  }

  return filters;
};


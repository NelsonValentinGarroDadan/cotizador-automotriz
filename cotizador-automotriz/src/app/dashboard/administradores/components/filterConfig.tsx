import { Role } from "@/app/types";
import { Company } from "@/app/types/compay";
import { FilterConfig } from "@/app/types/table";

export const adminsFilters = ({
  companies,
  role = Role.ADMIN,
}: {
  companies: Company[];
  role?: Role;
}): FilterConfig[] => {
  const array: FilterConfig[] = [
    {
      name: "search",
      label: "Buscar por nombre o email",
      type: "text",
      placeholder: "Ej: Juan Perez o admin@example.com",
    },
  ];

  if (role === Role.ADMIN) {
    array.push({
      name: "companyIds",
      label: "Filtrar por companias",
      type: "multiselect",
      placeholder: "Selecciona una o varias companias",
      options: companies.map((company) => ({
        value: company.id,
        label: company.name,
      })),
      multiple: true,
    });
  }

  return array;
};

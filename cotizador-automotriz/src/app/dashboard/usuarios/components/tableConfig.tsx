/* eslint-disable @typescript-eslint/no-explicit-any */
// administradores/components/tableConfig.tsx
import TableActions from "@/app/components/ui/tableAction";
import { TableColumn } from "@/app/types/table";
import { UserWithCompanies } from "@/app/types/user";

export default function userColumns({
  onCreated
}: {
  onCreated: () => void
}): TableColumn[] {
  return [
    {
      key: "firstName",
      label: "Nombre",
      sortable: true,
      render: (value: string, row: UserWithCompanies) => 
        `${row.firstName} ${row.lastName}`,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "allowedPlans",
      label: "Planes Permitidos",
      sortable: false,
      render: (value: any) => value.length
    },
    {
      key: "companies",
      label: "Compañías",
      sortable: false,
      render: (value: UserWithCompanies['companies'], row: UserWithCompanies) => {
        const companies = row.companies || []; 
        if (companies.length === 0) {
          return (
            <span className="text-gray-400 italic">
              Sin compañías asignadas
            </span>
          );
        }
        
        if (companies.length === 1) {
          return (
            <span className="font-medium">
              {companies[0].company?.name}
            </span>
          );
        }
        
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{companies[0].company?.name}</span>
            <span className="text-sm text-gray-500">
              +{companies.length - 1} más
            </span>
          </div>
        );
      },
    }, 
    {
      key: "id",
      label: "Acciones",
      sortable: false,
      render: (value: string,row: UserWithCompanies) => (
        <TableActions 
          baseUrl="/users"
          id={value}
          showDelete={row.companies  ? row.companies.length == 0  : true}
          onActionComplete={onCreated}
        />
      ),
    },
  ];
}
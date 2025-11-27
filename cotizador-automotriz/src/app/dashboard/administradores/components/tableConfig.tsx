// administradores/components/tableConfig.tsx
import TableActions from "@/app/components/ui/tableAction";
import { TableColumn } from "@/app/types/table";
import { UserWithCompanies } from "@/app/types/user";
import { CheckCircle, XCircle } from "lucide-react";

export default function adminsColumns({
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
      className: "hidden md:table-cell",
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
      key: "status",
      label: "Estado",
      sortable: false,
      className: "hidden md:table-cell",
      render: (_: unknown, row: UserWithCompanies) =>
        row.active === false ? (
          <span className="flex items-center justify-start gap-2 text-red-600 font-semibold">
            <XCircle className="w-4 h-4" /> Inactivo
          </span>
        ) : (
          <span className="flex items-center justify-start gap-2 text-green-600 font-semibold">
            <CheckCircle className="w-4 h-4" /> Activo
          </span>
        ),
    },
    {
      key: "id",
      label: "Acciones",
      sortable: false,
      render: (value: string,row: UserWithCompanies) => (
        <TableActions 
          baseUrl="/administradores"
          id={value}
          showDelete={row.active !== false}
          onActionComplete={onCreated}
        />
      ),
    },
  ];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// app/planes/components/tableConfig.tsx
import TableActions from "@/app/components/ui/tableAction";
import { TableColumn } from "@/app/types/table";
import { Plan } from "@/app/types/plan";
import { CheckCircle, XCircle } from "lucide-react";
import { Role } from "@/app/types";
 

export default function planColumns({
  onCreated,
  role,
  showCompaniesColumn,
}: {
  onCreated: () => void;
  role: Role;
  showCompaniesColumn: boolean;
}): TableColumn[] {
  const columns: TableColumn[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
    },
  {
    key: "logo",
    label: "Logo",
    className: "hidden md:table-cell",
    sortable: false,
      render: (value: string) =>
        value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Logo"
            className="w-auto h-20 mx-auto rounded"
          />
        ) : (
          <span className="h-20 block text-lg text-center w-full font-bold">
            -
          </span>
        ),
    },
  ];

  if (showCompaniesColumn) {
    columns.push({
      key: "companies",
      label: "Compañías",
      sortable: false,
      render: (_value: any, row: Plan) => {
        const companies = row.companies || [];
        if (companies.length === 0) return "-";
        if (companies.length === 1) return companies[0].name;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{companies[0].name}</span>
            {companies.length > 1 && (
              <span className="text-xs text-gray">
                +{companies.length - 1} más
              </span>
            )}
          </div>
        );
      },
    });
  }

  columns.push(
    {
      key: "active",
      label: "Estado",
      sortable: false,
      render: (value: boolean) =>
        value ? (
          <span className="flex items-center justify-center gap-2 text-green-600 font-semibold">
            <CheckCircle className="w-4 h-4" /> Activo
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 text-red-600 font-semibold">
            <XCircle className="w-4 h-4" /> Inactivo
          </span>
        ),
    },
    {
    key: "createdAt",
    label: "Fecha de creación",
    sortable: true,
    className: "hidden md:table-cell",
    render: (value: string) =>
        new Date(value).toLocaleDateString("es-AR"),
    },
    {
      key: "id",
      label: "Acciones",
      sortable: false,
      render: (value: string, row: Plan) => (
        <TableActions
          showView={true}
          showDelete={role == Role.ADMIN && row.active}
          showEdit={role == Role.ADMIN || role == Role.SUPER_ADMIN}
          baseUrl="/planes"
          id={value}
          onActionComplete={onCreated}
          width={900}
        />
      ),
    }
  );

  return columns;
}

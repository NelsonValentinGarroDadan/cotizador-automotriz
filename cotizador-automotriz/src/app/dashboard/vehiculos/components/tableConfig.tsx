import TableActions from "@/app/components/ui/tableAction";
import { TableColumn } from "@/app/types/table";
import { Role } from "@/app/types";
import { VehiculeVersion } from "@/app/types/vehiculos";

export default function vehiculeColumns({
  onCreated,
  role,
  showCompanyColumn = true,
}: {
  onCreated: () => void;
  role: Role;
  showCompanyColumn?: boolean;
}): TableColumn[] {
  const columns: TableColumn[] = [
    {
      key: "descrip",
      label: "Version",
      sortable: true,
      render: (value: string, row: VehiculeVersion) =>
        row.nueva_descrip || row.descrip,
    },
    {
      key: "idmarca",
      label: "Marca",
      sortable: true,
      render: (_, row: VehiculeVersion) => row.marca?.descrip ?? "-",
    },
    {
      key: "idmodelo",
      label: "Modelo",
      sortable: true,
      render: (_, row: VehiculeVersion) => row.modelo?.descrip ?? "-",
    },
    {
      key: "idlinea",
      label: "Linea",
      sortable: true,
      render: (_, row: VehiculeVersion) => row.modelo?.linea?.descrip ?? "-",
    },
  ];

  if (showCompanyColumn) {
    columns.push({
      key: "company",
      label: "Compañias",
      sortable: false,
      render: (_, row: VehiculeVersion) => {
        const companies = row.company || [];
        if (companies.length === 0) {
          return (
            <span className="text-gray-400 italic">
              Sin compañias asignadas
            </span>
          );
        }
        if (companies.length === 1) {
          return <span className="font-medium">{companies[0].name}</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{companies[0].name}</span>
            <span className="text-sm text-gray-500">
              +{companies.length - 1} mas
            </span>
          </div>
        );
      },
    });
  }

  columns.push({
    key: "idversion",
    label: "Acciones",
    sortable: false,
    render: (value: number) => (
      <TableActions
        baseUrl="/vehicules"
        id={value}
        showDelete={role === Role.ADMIN || role === Role.SUPER_ADMIN}
        showEdit={role === Role.ADMIN || role === Role.SUPER_ADMIN}
        showView={true}
        onActionComplete={onCreated}
      />
    ),
  });

  return columns;
}


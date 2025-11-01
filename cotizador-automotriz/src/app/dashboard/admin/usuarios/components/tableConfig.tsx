import { TableColumn } from "@/app/types/table";

export const empleadosColumns: TableColumn[] = [
  {
    key: "name",
    label: "Nombre completo",
    render: (_value, row) => `${row.firstName} ${row.lastName}`,
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "company",
    label: "Compañía",
    render: (_value, row) => row?.companies?.[0]?.company?.name ?? "—",
  },
  {
    key: "quotationsCount",
    label: "Cotizaciones realizadas",
  },
  {
    key: "lastQuotation",
    label: "Última cotización",
    render: (value) =>
      value ? new Date(value).toLocaleDateString("es-AR") : "—",
  },
  {
    key: "createdAt",
    label: "Fecha de registro",
    render: (value) => new Date(value).toLocaleDateString("es-AR"),
  },
  {
    key: "actions",
    label: "Acciones",
    render: (_value, row) => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:underline">Ver</button>
        <button className="text-red-600 hover:underline">Eliminar</button>
      </div>
    ),
  },
];

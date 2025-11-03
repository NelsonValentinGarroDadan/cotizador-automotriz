import { TableColumn } from "@/app/types/table";

export const empleadosColumns: TableColumn[] = [
  {
    key: "name",
    label: "Nombre completo",
    sortable:true,
    render: (_value, row) => `${row.firstName} ${row.lastName}`,
  },
  {
    key: "email",
    label: "Email",
    sortable:true,
  },
  {
    key: "company",
    label: "Compañía",
    sortable:true,
    render: (_value, row) => row?.companies?.[0]?.company?.name ?? "—",
  },
  {
    key: "quotationsCount",
    label: "Cotizaciones realizadas",
    sortable:false,
  },
  {
    key: "lastQuotation",
    label: "Última cotización",
    sortable:true,
    render: (value) =>
      value ? new Date(value).toLocaleDateString("es-AR") : "—",
  },
  {
    key: "createdAt",
    label: "Fecha de registro",
    sortable:true,
    render: (value) => new Date(value).toLocaleDateString("es-AR"),
  },
  {
    key: "actions",
    label: "Acciones",
    sortable:false,
    render: (_value, row) => (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:underline">Ver</button>
        <button className="text-red-600 hover:underline">Eliminar</button>
      </div>
    ),
  },
];

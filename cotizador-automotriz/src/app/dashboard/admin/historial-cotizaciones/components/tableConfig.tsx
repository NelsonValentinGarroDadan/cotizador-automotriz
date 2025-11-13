import { TableColumn } from "@/app/types/table";
import TableActions from "@/app/components/ui/tableAction";
import { Quotation } from "@/app/types/quotition";

export default function quotationColumns({
  onCreated,
}: {
  onCreated: () => void;
}): TableColumn[] {
  return [
    {
      key: "clientName",
      label: "Cliente",
      sortable: true,
      render: (_, row: Quotation) => `${row.clientName} (${row.clientDni})`,
    },
    {
      key: "company",
      label: "Compañía",
      sortable: false,
      render: (_, row: Quotation) => row.company?.name ?? "—",
    },
    {
      key: "planVersion",
      label: "Plan / Versión",
      sortable: false,
      render: (_, row ) =>
        `${row.planVersion?.plan.name ?? "—"} (v${row.planVersion?.version})`,
    },
    {
      key: "totalValue",
      label: "Valor total",
      sortable: true,
      render: (value: number) =>
        value ? `$${value.toLocaleString("es-AR")}` : "—",
    },
    {
      key: "createdAt",
      label: "Fecha de creación",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      sortable:false,
      key: "id",
      label: "Acciones",
      render: (value: string) => (
        <TableActions
          baseUrl="/HC"
          id={value}
          onActionComplete={onCreated}
          showDelete
          width={1100}
        />
      ),
    },
  ];
}

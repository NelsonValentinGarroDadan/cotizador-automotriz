import { TableColumn } from "@/app/types/table";
import TableActions from "@/app/components/ui/tableAction";
import { Quotation } from "@/app/types/quotition";
import { Role } from "@/app/types";

export default function quotationColumns({
  onCreated,
  role,
}: {
  onCreated: () => void;
  role: Role;
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
      label: "Compañia / Usuario",
      sortable: false,
      className: "hidden md:table-cell",
      render: (_, row: Quotation) => {
        const company = row.company.name ?? "-";
        const user =
          row.user.firstName && row.user.lastName
            ? row.user.firstName + " " + row.user.lastName
            : "-";

        return company + " / " + user;
      },
    },
    {
      key: "planVersion",
      label: "Plan / Version",
      sortable: false,
      className: "hidden md:table-cell",
      render: (_, row) =>
        `${row.planVersion?.plan.name ?? "??"} (v${row.planVersion?.version})`,
    },
    {
      key: "totalValue",
      label: "Valor total",
      sortable: true,
      render: (value: number) =>
        value ? `$${value.toLocaleString("es-AR")}` : "??",
    },
    {
      key: "createdAt",
      label: "Fecha de creacion",
      sortable: true,
      className: "hidden md:table-cell",
      render: (value: string) =>
        new Date(value).toLocaleDateString("es-AR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      sortable: false,
      key: "id",
      label: "Acciones",
      render: (value: string) => (
        <TableActions
          baseUrl="/HC"
          id={value}
          onActionComplete={onCreated}
          showDelete={role === Role.ADMIN}
          width={1100}
          showPdf={true}
        />
      ),
    },
  ];
}

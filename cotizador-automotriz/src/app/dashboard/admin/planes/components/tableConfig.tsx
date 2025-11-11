/* eslint-disable @typescript-eslint/no-explicit-any */
// app/planes/components/tableConfig.tsx
import TableActions from "@/app/components/ui/tableAction"; 
import { TableColumn } from "@/app/types/table"; 
import { Plan } from "@/app/types/plan";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG;  

export default function planColumns({ onCreated }: { onCreated: () => void }): TableColumn[] {
  return [
    {
      key: "name",
      label: "Nombre del Plan",
      sortable: true,
    },
    {
      key: "logo",
      label: "Logo",
      sortable: false,
      render: (value: string) =>
        value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={baseUrl + value}
            alt="Logo"
            className="w-auto h-20 mx-auto rounded"
          />
        ) : (
          <span className="h-20 block text-lg text-center w-full font-bold">-</span>
        ),
    },
    {
      key: "company",
      label: "Compañía",
      sortable: false,
      render: (value: any, row: Plan) => row.company?.name || '-',
    },
    {
      key: "_count",
      label: "Versiones",
      sortable: false,
      render: (value: any, row: Plan) => row._count?.versions || 0,
    },
    {
      key: "createdAt",
      label: "Fecha de creación",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("es-AR"),
    },
    {
      key: "id",
      label: "Acciones",
      sortable: false,
      render: (value: string) => (
        <TableActions
          showView={true}
          baseUrl="/planes"
          id={value}
          onActionComplete={onCreated}
        />
      ),
    },
  ];
}
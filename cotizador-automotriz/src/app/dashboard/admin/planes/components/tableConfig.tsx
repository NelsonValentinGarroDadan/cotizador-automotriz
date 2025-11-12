/* eslint-disable @typescript-eslint/no-explicit-any */
// app/planes/components/tableConfig.tsx
import TableActions from "@/app/components/ui/tableAction"; 
import { TableColumn } from "@/app/types/table"; 
import { Plan } from "@/app/types/plan";
import { CheckCircle, XCircle } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG;  

export default function planColumns({ onCreated }: { onCreated: () => void }): TableColumn[] {
  return [
    {
      key: "name",
      label: "Nombre",
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
      key: "companies", // ✅ Cambiar key
      label: "Compañías",
      sortable: false,
      render: (value: any, row: Plan) => {
        const companies = row.companies || [];
        if (companies.length === 0) return '-';
        if (companies.length === 1) return companies[0].name;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{companies[0].name}</span>
            {companies.length > 1 && (
              <span className="text-xs text-gray">+{companies.length - 1} más</span>
            )}
          </div>
        );
      },
    },
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
      render: (value: string, row: Plan) => (
        <TableActions
          showView={true}
          showDelete={row.active}
          baseUrl="/planes"
          id={value}
          onActionComplete={onCreated}
          width={900}
        />
      ),
    },
  ];
}
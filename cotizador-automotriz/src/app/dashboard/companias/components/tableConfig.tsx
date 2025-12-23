/* eslint-disable @typescript-eslint/no-explicit-any */

import TableActions from "@/app/components/ui/tableAction"; 
import { Role } from "@/app/types";
import { TableColumn } from "@/app/types/table"; 
import { CheckCircle, XCircle } from "lucide-react";
 
export  default function  companyColumns(
  { 
    onCreated,
    role
  }:
  {
    onCreated:()=>void,
    role:Role
  }) : TableColumn[] {
  return [
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
      // eslint-disable-next-line @next/next/no-img-element
      value ? <img
      src={value}
      alt="Logo"
      className="w-auto h-20 mx-auto rounded"
    /> : <span className="h-20 flex items-center justify-center text-lg  w-full h-full font-bold">-</span>,
  },  
  {
    key: "createdAt",
    label: "Fecha de creación",
    sortable: true,
    className: "hidden md:table-cell",
    render: (value: string) => new Date(value).toLocaleDateString("es-AR"),
  },
  {
    key: "active",
    label: "Estado",
    sortable: false,
    render: (_: any, row: any) =>
      row.active ? (
        <span className="flex items-center justify-start gap-2 text-green-600 font-semibold">
          <CheckCircle className="w-4 h-4" /> Activa
        </span>
      ) : (
        <span className="flex items-center justify-start gap-2 text-red-600 font-semibold">
          <XCircle className="w-4 h-4" /> Inactiva
        </span>
      ),
  },
  {
    key: "id",
    label: "Acciones",
    sortable: false,
    render: (value, row: any) => (
      <TableActions
        showView={false}
        baseUrl="/companies"
        id={value}
        showDelete={role === Role.SUPER_ADMIN && row.active}
        showEdit={role === Role.SUPER_ADMIN}
        onActionComplete={onCreated}
      />
    ),
  },
]; 

}  

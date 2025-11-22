
import TableActions from "@/app/components/ui/tableAction"; 
import { Role } from "@/app/types";
import { TableColumn } from "@/app/types/table"; 

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG;  
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
      src={baseUrl + value}
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
    key: "id",
    label: "Acciones",
    sortable: false,
    render: (value ) =>{ 
      return(<TableActions
        showView={false}
        baseUrl="/companies"
        id={value}
        showDelete={role == Role.ADMIN|| role == Role.SUPER_ADMIN}
        showEdit={role == Role.ADMIN|| role == Role.SUPER_ADMIN}
        onActionComplete={onCreated}
      /> )
    }  
      
  },
]; 

}  

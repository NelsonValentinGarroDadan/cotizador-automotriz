
import TableActions from "@/app/components/ui/tableAction";
import { TableColumn } from "@/app/types/table"; 

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG;  
export  default function  companyColumns({onCreated}:{onCreated:()=>void}) : TableColumn[] {
  return [
  {
    key: "name",
    label: "Nombre de la Compañía",
    sortable: true,
  },
  {
    key: "logo",
    label: "Logo",
    sortable: false,
    render: (value: string) =>
      // eslint-disable-next-line @next/next/no-img-element
      value ? <img
      src={baseUrl + value}
      alt="Logo"
      className="w-auto h-20 mx-auto rounded"
    /> : <span className="h-20 block text-lg text-center w-full font-bold">-</span>,
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
    render: (value) => (
      <TableActions
        showView={false}
        baseUrl="/companies"
        id={value}
        onActionComplete={onCreated}
      />

    ),
  },
]; 

}  
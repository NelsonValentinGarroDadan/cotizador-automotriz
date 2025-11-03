import { FilterConfig } from "@/app/types/table";

export const empleadosFilters: FilterConfig[] = [
  {
    name: "search",
    label: "Buscar por nombre o email",
    type: "text",
    placeholder: "Ej: Juan Pérez o juan@email.com",
  },
  {
    name: "companyId",
    label: "Compañía",
    type: "select",
    options: [
      { label: "Todas", value: "" },
      { label: "Seguros San Luis", value: "1" },
      { label: "AutoPlus", value: "2" },
      // estas las podrías cargar dinámicamente
    ],
  },
  {
    name: "fechaRegistro",
    label: "Fecha de registro desde",
    type: "date",
  },
];

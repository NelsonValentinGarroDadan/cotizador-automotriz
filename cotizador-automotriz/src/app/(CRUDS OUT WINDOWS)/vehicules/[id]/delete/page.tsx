'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory';
import { Role } from '@/app/types';
import { 
  useGetVehiculeVersionByIdQuery,
  useDeleteVehiculeVersionMutation,
} from '@/app/api/vehiculeApi';
import { useParams } from 'next/navigation';
import { VehiculeVersion } from '@/app/types/vehiculos';

export default function DeleteVehiculePage() {
  const params = useParams<{ id: string }>();
  const idversion = Number(params.id);

  const { data, isLoading, error } = useGetVehiculeVersionByIdQuery(
    { idversion },
    { skip: Number.isNaN(idversion) }
  );

  const [deleteVehicule] = useDeleteVehiculeVersionMutation();

  const deleteMutation = async () => {
    await deleteVehicule({ idversion }).unwrap();
  };

  const columns =
    data
      ? [
          { key: "descrip" as keyof VehiculeVersion, label: "Descripción", value: data.descrip },
          { key: "codigo" as keyof VehiculeVersion, label: "Código", value: data.codigo },
          { key: "marca" as keyof VehiculeVersion, label: "Marca", value: data.marca?.descrip ?? "-" },
          { key: "linea" as keyof VehiculeVersion, label: "Línea", value: data.linea?.descrip ?? "-" },
          {
            key: "company" as keyof VehiculeVersion,
            label: "Compañías",
            value: Array.isArray(data.company) && data.company.length > 0 ? data.company.map((c) => c.name).join(", ") : "-",
          },
        ]
      : undefined;

  return (
    <CrudPageFactory<VehiculeVersion>
      action="delete"
      entity={data}
      isLoading={isLoading}
      error={error}
      deleteMutation={deleteMutation}
      entityName="Vehículo"
      columns={columns}
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

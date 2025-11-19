'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory';
import { Role } from '@/app/types';
import {
  VehiculeVersion,
  useGetVehiculeVersionByIdQuery,
  useDeleteVehiculeVersionMutation,
} from '@/app/api/vehiculeApi';
import { useParams } from 'next/navigation';

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

  return (
    <CrudPageFactory<VehiculeVersion>
      action="delete"
      entity={data}
      isLoading={isLoading}
      error={error}
      deleteMutation={deleteMutation}
      entityName="Vehículo"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

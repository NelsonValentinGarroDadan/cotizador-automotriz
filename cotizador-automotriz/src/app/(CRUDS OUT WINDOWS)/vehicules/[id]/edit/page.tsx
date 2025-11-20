'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory';
import VehiculeForm from '../../components/vehiculeForm';
import { Role } from '@/app/types';
import { useGetVehiculeVersionByIdQuery } from '@/app/api/vehiculeApi';
import { useParams } from 'next/navigation';
import { VehiculeVersion } from '@/app/types/vehiculos';

export default function EditVehiculePage() {
  const params = useParams<{ id: string }>();
  const idversion = Number(params.id);

  const { data, isLoading, error } = useGetVehiculeVersionByIdQuery(
    { idversion },
    { skip: Number.isNaN(idversion) }
  );

  return (
    <CrudPageFactory<VehiculeVersion>
      action="edit"
      formComponent={VehiculeForm}
      entity={data}
      isLoading={isLoading}
      error={error}
      entityName="Vehículo"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

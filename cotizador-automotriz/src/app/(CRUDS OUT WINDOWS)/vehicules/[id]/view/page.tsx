'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory';
import VehiculeForm from '../../components/vehiculeForm';
import { Role } from '@/app/types';
import { VehiculeVersion, useGetVehiculeVersionByIdQuery } from '@/app/api/vehiculeApi';
import { useParams } from 'next/navigation';

export default function ViewVehiculePage() {
  const params = useParams<{ id: string }>();
  const idversion = Number(params.id);

  const { data, isLoading, error } = useGetVehiculeVersionByIdQuery(
    { idversion },
    { skip: Number.isNaN(idversion) }
  );

  return (
    <CrudPageFactory<VehiculeVersion>
      action="view"
      formComponent={VehiculeForm}
      entity={data}
      isLoading={isLoading}
      error={error}
      entityName="Vehículo"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

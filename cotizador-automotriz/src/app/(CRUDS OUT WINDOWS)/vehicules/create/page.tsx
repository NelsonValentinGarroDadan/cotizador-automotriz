'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory';
import VehiculeForm from '../components/vehiculeForm';
import { Role } from '@/app/types'; 
import { VehiculeVersion } from '@/app/types/vehiculos';

export default function CreateVehiculePage() {
  return (
    <CrudPageFactory<VehiculeVersion>
      action="create"
      formComponent={VehiculeForm}
      entityName="Vehículo"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}


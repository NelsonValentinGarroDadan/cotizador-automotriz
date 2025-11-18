// app/planes/create/page.tsx
'use client';
import { CrudPageFactory } from '@/app/components/crudPageFactory';  
import PlanForm from '../components/plansForm';
import { Role } from '@/app/types';

export default function CreatePlanPage() {
  return (
    <CrudPageFactory
      action="create"
      formComponent={PlanForm}
      entityName="Plan"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}
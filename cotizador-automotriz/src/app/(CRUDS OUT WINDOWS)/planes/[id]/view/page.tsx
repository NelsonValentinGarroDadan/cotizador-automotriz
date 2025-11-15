// app/planes/view/[id]/page.tsx
'use client';
import { use } from 'react';
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { PlanWithDetails } from '@/app/types/plan';
import { useGetPlanByIdQuery } from '@/app/api/planApi'; 
import PlanForm from '../../components/plansForm';
import { Role } from '@/app/types';

export default function ViewPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plan, isLoading, error } = useGetPlanByIdQuery({ id });

  return (
    <CrudPageFactory<PlanWithDetails>
      action="view"
      formComponent={PlanForm}
      entity={plan}
      isLoading={isLoading}
      error={error}
      entityName="Plan"
      allowedRoles={[Role.ADMIN, Role.USER]}
    />
  );
}
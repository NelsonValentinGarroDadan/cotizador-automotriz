// app/planes/delete/[id]/page.tsx
'use client';
import { use } from 'react';
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { PlanWithDetails } from '@/app/types/plan';
import { useGetPlanByIdQuery, useDeletePlanMutation } from '@/app/api/planApi';

export default function DeletePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plan, isLoading, error } = useGetPlanByIdQuery({ id });
  const [deletePlan] = useDeletePlanMutation();
  console.log(plan)
  return (
    <CrudPageFactory<PlanWithDetails>
      action="delete"
      entity={plan}
      isLoading={isLoading}
      error={error}
      deleteMutation={async () => {
        if (!plan?.id) return;
        await deletePlan({ id: plan.id }).unwrap();
      }}
      columns={[
        { key: 'name', label: 'Nombre' },
        { key: 'description', label: 'Descripción' },
        { 
          key: `company`, 
          label: 'Compañía',
        },
      ]}
      entityName="Plan"
    />
  );
}
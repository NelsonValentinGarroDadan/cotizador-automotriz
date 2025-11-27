// app/planes/delete/[id]/page.tsx
'use client';
import { use } from 'react';
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { PlanWithDetails } from '@/app/types/plan';
import { useGetPlanByIdQuery, useDeletePlanMutation } from '@/app/api/planApi';
import { Role } from '@/app/types';

export default function DeletePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: plan, isLoading, error } = useGetPlanByIdQuery({ id });
  const [deletePlan] = useDeletePlanMutation();

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
        { key: 'name', label: 'Nombre', value: plan?.name },
        { 
          key: 'companies', 
          label: 'Compañías',
          value: plan?.companies?.map((c) => c.name).join(', ') || '-',
        },
        { 
          key: 'active', 
          label: 'Estado',
          value: plan?.active ? 'Activo' : 'Inactivo',
        },
      ]}
      entityName="Plan"
      title="¿Seguro que querés desactivar este plan?"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

// app/planes/create/page.tsx
'use client';
import { CrudPageFactory } from '@/app/components/crudPageFactory';  
import PlanForm from '../components/plansForm';

export default function CreatePlanPage() {
  return (
    <CrudPageFactory
      action="create"
      formComponent={PlanForm}
      entityName="Plan"
    />
  );
}
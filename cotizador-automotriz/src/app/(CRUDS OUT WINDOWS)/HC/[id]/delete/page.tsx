'use client';

import { useParams } from 'next/navigation';
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import { useDeleteQuotationMutation, useGetQuotationByIdQuery } from '@/app/api/quotationApi'; 
import { Role } from '@/app/types';

export default function DeleteQuotationPage() {
  const { id } = useParams();
  const entityId = id as string;
  const { data, isLoading, error } = useGetQuotationByIdQuery({ id: entityId });
  const [deleteQuotation] = useDeleteQuotationMutation(); 
  return (
    <CrudPageFactory
      action="delete"
      entity={data}
      isLoading={isLoading}
      error={error}
      deleteMutation={async () => {
        if (!entityId) return;
        await deleteQuotation({ id: entityId }).unwrap();
      }}
      columns={[
        { key: 'clientName', label: 'Cliente' },
        { key: 'clientDni', label: 'DNI' },
        { key: 'company', label: 'Compañía', value: data?.company.name },
      ]}
      entityName="Cotización"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

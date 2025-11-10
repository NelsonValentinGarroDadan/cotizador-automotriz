'use client';

import { useParams } from 'next/navigation';
import { useGetCompanyByIdQuery, useDeleteCompanyMutation } from '@/app/api/companyApi';
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import { Company } from '@/app/types/compay';

export default function DeleteCompanyPage() {
  const { id } = useParams();
  const { data: company, isLoading, error } = useGetCompanyByIdQuery({ id: id as string });
  const [deleteCompany] = useDeleteCompanyMutation();

  return (
    <CrudPageFactory<Company>
      action="delete"
      entity={company}
      isLoading={isLoading}
      error={error}
      deleteMutation={async () => {
        if (!company?.id) return;
        await deleteCompany({ id: company.id }).unwrap();
      }}
      columns={[
        { key: 'name', label: 'Nombre' },
        { key: 'logo', label: 'Logo' },
      ]}
      entityName="Compañía"
    />
  );
}

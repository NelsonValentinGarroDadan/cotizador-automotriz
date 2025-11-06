'use client';

import { useParams } from 'next/navigation';
import { useGetCompanyByIdQuery } from '@/app/api/companyApi';
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import CompanyForm from '@/app/dashboard/admin/components/companyForm';
import { Company } from '@/app/types/compay';

export default function EditCompanyPage() {
  const { id } = useParams();
  const { data: company, isLoading, error } = useGetCompanyByIdQuery({ id: id as string });

  return (
    <CrudPageFactory<Company>
      action="edit"
      formComponent={CompanyForm}
      entity={company}
      isLoading={isLoading}
      error={error}
      entityName="Compañía"
    />
  );
}

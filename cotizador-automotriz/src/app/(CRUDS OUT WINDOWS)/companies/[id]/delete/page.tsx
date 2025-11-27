'use client';

import { useParams } from 'next/navigation';
import { useGetCompanyByIdQuery, useDeleteCompanyMutation } from '@/app/api/companyApi';
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import { Company } from '@/app/types/compay';

export default function DeleteCompanyPage() {
  const { id } = useParams();
  const { data: company, isLoading, error } = useGetCompanyByIdQuery({ id: id as string });
  const [deleteCompany] = useDeleteCompanyMutation();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG || '';

  const columns =
    company
      ? [
          { key: 'name' as keyof Company, label: 'Nombre', value: company.name },
          {
            key: 'logo' as keyof Company,
            label: 'Logo',
            value: company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${baseUrl}${company.logo}`} alt="Logo" className="h-12 object-contain" />
            ) : (
              '-'
            ),
          },
          { key: 'active' as keyof Company, label: 'Estado', value: company.active ? 'Activa' : 'Inactiva' },
        ]
      : undefined;

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
      columns={columns}
      entityName="Compañía"
      title="¿Seguro que querés desactivar esta compañía?"
    />
  );
}

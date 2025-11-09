'use client';

import { useParams } from 'next/navigation';  
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { User } from '@/app/types/user';
import { useDeleteUserMutation, useGetUserByIdQuery } from '@/app/api/userApi';

export default function DeleteCompanyPage() {
  const { id } = useParams();
  const { data: user, isLoading, error } = useGetUserByIdQuery({ id: id as string });
  const [deleteCompany] = useDeleteUserMutation();

  return (
    <CrudPageFactory<User>
      action="delete"
      entity={user}
      isLoading={isLoading}
      error={error}
      deleteMutation={async () => {
        if (!user?.id) return;
        await deleteCompany({ id: user.id }).unwrap();
      }}
      columns={[
        { key: 'firstName', label: 'Nombre' },
        { key: 'lastName', label: 'Apellido' },
        { key: 'email', label: 'Email' },
      ]}
      entityName="Administrador"
    />
  );
}

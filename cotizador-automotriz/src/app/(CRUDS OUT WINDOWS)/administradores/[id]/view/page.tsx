'use client';

import { useParams } from 'next/navigation'; 
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { User } from '@/app/types/user';
import { useGetUserByIdQuery } from '@/app/api/userApi'; 
import AdminForm from '../../components/adminForm';

export default function EditCompanyPage() {
  const { id } = useParams();
  const { data: user, isLoading, error } = useGetUserByIdQuery({ id: id as string });

  return (
    <CrudPageFactory<User>
      action="view"
      formComponent={AdminForm}
      entity={user}
      isLoading={isLoading}
      error={error}
      entityName="Administrador" 
    />
  );
}

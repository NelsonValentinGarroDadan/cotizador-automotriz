'use client';

import { useParams } from 'next/navigation'; 
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { User } from '@/app/types/user';
import { useGetUserByIdQuery } from '@/app/api/userApi'; 
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import AdminForm from '../../components/adminForm';
import { Company } from '@/app/types/compay';

export default function EditCompanyPage() {
  const { id } = useParams();
  const { data: user, isLoading, error } = useGetUserByIdQuery({ id: id as string });
  const { data  } = useGetAllCompaniesQuery({ limit:50});
  
const FormWrapper = (props: { entity?: User; readOnly?: boolean; companies?: Company[] }) => {
    return <AdminForm {...props} companies={data?.data ?? []} />;
  };

  return (
    <CrudPageFactory<User>
      action="view"
      formComponent={FormWrapper}
      entity={user}
      isLoading={isLoading}
      error={error}
      entityName="Compañía" 
    />
  );
}

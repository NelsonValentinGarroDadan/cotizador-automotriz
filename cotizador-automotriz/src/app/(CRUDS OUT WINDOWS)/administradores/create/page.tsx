'use client';
  
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import UserForm from '../components/adminForm'; 
import { User } from '@/app/types/user';

export default function CreateCompanyPage() {
  return (
    <CrudPageFactory<User>
      action="create"
      formComponent={UserForm}
      entityName="Administrador"
    />
  );
}

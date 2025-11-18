'use client';
  
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import UserForm from '../components/userForm'; 
import { User } from '@/app/types/user';
import { Role } from '@/app/types';

export default function CreateCompanyPage() {
  return (
    <CrudPageFactory<User>
      action="create"
      formComponent={UserForm}
      entityName="Usuario"
      allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
    />
  );
}

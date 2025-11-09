'use client';
 
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import UserForm from '../components/adminForm';

export default function CreateCompanyPage() {
  return (
    <CrudPageFactory
      action="create"
      formComponent={UserForm}
      entityName="Administrador"
    />
  );
}

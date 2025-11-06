'use client';
 
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import CompanyForm from '@/app/dashboard/admin/components/companyForm';

export default function CreateCompanyPage() {
  return (
    <CrudPageFactory
      action="create"
      formComponent={CompanyForm}
      entityName="Compañía"
    />
  );
}

'use client';
 
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import CompanyForm from '@/app/(CRUDS OUT WINDOWS)/companies/components/companyForm';

export default function CreateCompanyPage() {
  return (
    <CrudPageFactory
      action="create"
      formComponent={CompanyForm}
      entityName="Compañía"
    />
  );
}

'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import QuotationForm from '../components/HCForm'; 
import { Role } from '@/app/types';

export default function CreateQuotationPage() { 

  return (
    <CrudPageFactory 
      action="create"
      formComponent={QuotationForm}
      entityName="Cotización"
      allowedRoles={[Role.ADMIN, Role.USER, Role.SUPER_ADMIN]}
    />
  );
}

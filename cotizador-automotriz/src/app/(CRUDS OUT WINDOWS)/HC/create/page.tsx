'use client';

import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import QuotationForm from '../components/HCForm'; 

export default function CreateQuotationPage() { 

  return (
    <CrudPageFactory 
      action="create"
      formComponent={QuotationForm}
      entityName="Cotización"
    />
  );
}

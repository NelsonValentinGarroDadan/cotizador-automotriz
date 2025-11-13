'use client';

import { useParams } from 'next/navigation';
import { CrudPageFactory } from '@/app/components/crudPageFactory'; 
import { useGetQuotationByIdQuery } from '@/app/api/quotationApi';
import QuotationForm from '../../components/HCForm';

export default function ViewQuotationPage() {
  const { id } = useParams();
  const entityId = id as string;
  const { data, isLoading, error } = useGetQuotationByIdQuery({ id: entityId });
 

  return (
    <CrudPageFactory
      action="view"
      formComponent={QuotationForm}
      entity={data}
      isLoading={isLoading}
      error={error}
      entityName="Cotización"
    />
  );
}

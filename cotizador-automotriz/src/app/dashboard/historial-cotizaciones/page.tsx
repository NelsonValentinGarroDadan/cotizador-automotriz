'use client';
import { useMemo, useEffect } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import { useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import WindowFormButton from '@/app/components/windowFormButton';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { quotationApi, useGetAllQuotationsQuery } from '@/app/api/quotationApi';
import quotationColumns from './components/tableConfig';
import { quotationFilters } from './components/filterConfig';
import { useAuthStore } from '@/app/store/useAuthStore';

export default function Page() {
  const {user,hydrated} = useAuthStore();
  const dispatch = useDispatch();
  const useQuotationStore = useMemo(() => createTableStore('quotations'), []);
  const { filters, pagination, sort, resetFilters, setSort } = useQuotationStore();

  const { data: companies } = useGetAllCompaniesQuery({ limit: 100 });
  const { data, refetch, isLoading, isFetching } = useGetAllQuotationsQuery({
    ...pagination,
    ...sort,
    ...filters,
  });

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data) {
        if (event.data.created || event.data.updated || event.data.deleted) {
          resetFilters()
          dispatch(quotationApi.util.invalidateTags([{ type: 'HC', id: 'LIST' }]));
          setSort("createdAt", "desc" )
        }
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [dispatch, resetFilters, setSort]);

  if (!hydrated) {
    return (
      <section className="w-full px-5 min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </section>
    );
  }
 
  if (!user) { 
    return null;
  }
  const columns = quotationColumns({ onCreated: refetch , role: user.role});
  const companiesList = companies?.data || [];
  const showCompanyFilter = companiesList.length > 1;
  const filtersConfig = quotationFilters({
    companies: companiesList,
    showCompanyFilter,
  });
  return (
    <section className="w-full border-l border-gray px-5 min-h-screen">
      <CustomTable
        store={useQuotationStore}
        columns={columns}
        data={data?.data || []}
        filters={filtersConfig}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }}
        loading={isLoading || isFetching}
        onFilter={refetch}
        onPageChange={refetch}
        title="Historial de Cotizaciones"
        description="Gestioná y consultá tus cotizaciones realizadas."
        buttons={
          <WindowFormButton
            formUrl="/HC/create"
            buttonText={
              <p className="flex gap-3">
                <Plus className="text-white h-6 w-6" /> Crear Cotización
              </p>
            }
            onCreated={refetch}
            width={1600}
          />
        }
      />
    </section>
  );
}

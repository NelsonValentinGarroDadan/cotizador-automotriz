'use client';
import { useEffect, useMemo } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import companyColumns from './components/tableConfig'; 
import { useGetAllCompaniesQuery } from '@/app/api/companyApi'; 
import { companyFilters } from './components/filterConfig';
import WindowFormButton from '@/app/components/windowFormButton';
import { Plus } from 'lucide-react'; 
import { useDispatch } from 'react-redux'; 
import { companyApi } from '@/app/api/companyApi';
import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';

export default function Page() {
  const {user, hydrated} = useAuthStore();
  const dispatch = useDispatch();
  const useCompaniesTableStore = useMemo(() => createTableStore('companies'), []);
  const { filters, pagination, sort  } = useCompaniesTableStore();

  const { data, refetch, isLoading, isFetching } = useGetAllCompaniesQuery({
    ...pagination,
    ...sort, 
    ...filters, 
    },{
      refetchOnMountOrArgChange: true,  
    }
  );

 useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        if (event.data?.created || event.data?.updated || event.data?.deleted) { 
          dispatch(
            companyApi.util.invalidateTags([
              { type: 'Company', id: 'LIST' }
            ])
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch]);

 const handleFilter = () => {
    refetch();
  };

 
  const handlePageChange = () => {
    refetch();
  };
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
  const columns = companyColumns({
    onCreated: refetch,
    role: user.role,
  })
  return (
    <section className='w-full border-l border-gray  px-5 min-h-screen'> 
      <CustomTable
        store={useCompaniesTableStore}
        columns={columns}
        data={data?.data || []}
        filters={companyFilters}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }} 
        loading={isLoading || isFetching}
        onFilter={handleFilter} 
        onPageChange={handlePageChange} 
        title='Gestion de compañias'
        description='Podras ver y editar las diferentes compañoas a tu cargo.'
        buttons={
          user.role == Role.SUPER_ADMIN && <WindowFormButton
            formUrl="/companies/create"
            buttonText={<p className='flex gap-3'><Plus className='text-white h-6 w-6' />Crear Compañía</p>}
            onCreated={refetch} 
          />
        }
      />
    </section>
  );
}

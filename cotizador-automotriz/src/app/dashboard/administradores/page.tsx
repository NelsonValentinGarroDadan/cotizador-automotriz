'use client';
import { useEffect, useMemo } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import admisColumns from './components/tableConfig';  
import { adminsFilters } from './components/filterConfig';
import WindowFormButton from '@/app/components/windowFormButton';
import { Plus } from 'lucide-react'; 
import { useDispatch } from 'react-redux';  
import { Role } from '@/app/types';
import { useGetAllUsersQuery, userApi } from '@/app/api/userApi';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useAuthRedirect } from '@/app/hooks/useAuthRedirect';

export default function Page() {
  useAuthRedirect([Role.SUPER_ADMIN]);
  const dispatch = useDispatch();
  const useAdminsTableStore = useMemo(() => createTableStore('admins'), []);
  const { data:companies } = useGetAllCompaniesQuery({ limit: 50 })
  const { filters, pagination, sort  } = useAdminsTableStore();

  const { data, refetch, isLoading, isFetching } = useGetAllUsersQuery({
    ...pagination,
    ...sort, 
    ...filters, 
    role: Role.ADMIN
    },{
      refetchOnMountOrArgChange: true,  
    }
  );

 useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        if (event.data?.created || event.data?.updated || event.data?.deleted) { 
          dispatch(
            userApi.util.invalidateTags([
              { type: 'User', id: 'LIST' }
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
  const columns = admisColumns({
    onCreated: refetch
  })
  const filtersConfig = adminsFilters({
    companies: companies?.data || []
  });
  return (
    <section className='w-full border-l border-gray px-1 md:px-5 min-h-[70vh]'> 
      <CustomTable
        store={useAdminsTableStore}
        columns={columns}
        data={data?.data || []}
        filters={filtersConfig}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }} 
        loading={isLoading || isFetching}
        onFilter={handleFilter} 
        onPageChange={handlePageChange} 
        title='Gestion de administradores'
        description='Podras ver y editar los diferentes administradores.'
        buttons={
          <WindowFormButton
            formUrl="/administradores/create"
            buttonText={<p className='flex gap-3'><Plus className='text-white h-6 w-6' />Crear administrador</p>}
            onCreated={refetch} 
          />
        }
      />
    </section>
  );
}

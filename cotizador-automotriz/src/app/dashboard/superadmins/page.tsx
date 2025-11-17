'use client';

import { useEffect, useMemo } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import adminsColumns from '../administradores/components/tableConfig';
import { adminsFilters } from '../administradores/components/filterConfig';
import WindowFormButton from '@/app/components/windowFormButton';
import { Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Role } from '@/app/types';
import { useGetAllUsersQuery, userApi } from '@/app/api/userApi';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useAuthRedirect } from '@/app/hooks/useAuthRedirect';

export default function Page() {
  // Solo SUPER_ADMIN puede acceder a esta vista
  useAuthRedirect([Role.SUPER_ADMIN]);

  const dispatch = useDispatch();
  const useSuperAdminsTableStore = useMemo(() => createTableStore('superadmins'), []);
  const { data: companies } = useGetAllCompaniesQuery({ limit: 50 });
  const { filters, pagination, sort } = useSuperAdminsTableStore();

  const { data, refetch, isLoading, isFetching } = useGetAllUsersQuery(
    {
      ...pagination,
      ...sort,
      ...filters,
      role: Role.SUPER_ADMIN,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        if (event.data?.created || event.data?.updated || event.data?.deleted) {
          dispatch(
            userApi.util.invalidateTags([
              { type: 'User', id: 'LIST' },
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

  const columns = adminsColumns({
    onCreated: refetch,
  });

  const filtersConfig = adminsFilters({
    companies: companies?.data || [],
  });

  return (
    <section className="w-full border-l border-gray px-5 min-h-screen">
      <CustomTable
        store={useSuperAdminsTableStore}
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
        title="Gestión de superadmins"
        description="Solo los superadmins pueden ver y gestionar otros superadmins."
        buttons={
          <WindowFormButton
            formUrl="/administradores/create?superadmin=true"
            buttonText={
              <p className="flex gap-3">
                <Plus className="text-white h-6 w-6" />
                Crear superadmin
              </p>
            }
            onCreated={refetch}
          />
        }
      />
    </section>
  );
}

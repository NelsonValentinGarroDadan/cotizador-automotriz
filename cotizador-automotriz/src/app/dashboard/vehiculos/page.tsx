'use client';

import { useEffect, useMemo } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import vehiculeColumns from './components/tableConfig';
import { useGetAllVehiculeVersionsQuery } from '@/app/api/vehiculeApi';
import { useDispatch } from 'react-redux';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Role } from '@/app/types';
import { vehiculeApi } from '@/app/api/vehiculeApi';
import WindowFormButton from '@/app/components/windowFormButton';
import { Plus } from 'lucide-react';

export default function VehiculesPage() {
  const { user, hydrated } = useAuthStore();
  const dispatch = useDispatch();
  const useVehiculesTableStore = useMemo(
    () => createTableStore('vehicules'),
    []
  );
  const { filters, pagination, sort } = useVehiculesTableStore();

  const { data, refetch, isLoading, isFetching } =
    useGetAllVehiculeVersionsQuery(
      {
        ...pagination,
        ...sort,
        ...filters,
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
            vehiculeApi.util.invalidateTags([
              { type: 'Vehicule', id: 'LIST' },
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

  const columns = vehiculeColumns({
    onCreated: refetch,
    role: user.role,
  });

  return (
    <section className="w-full border-l border-gray px-5 min-h-screen">
      <CustomTable
        store={useVehiculesTableStore}
        columns={columns}
        data={data?.data || []}
        filters={[]}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }}
        loading={isLoading || isFetching}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        title="Gestión de Vehículos"
        description="Podrás ver y administrar las versiones de vehículos disponibles para tus compañías."
        buttons={
          (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) && (
            <WindowFormButton
              formUrl="/vehicules/create"
              buttonText={
                <p className="flex gap-3">
                  <Plus className="text-white h-6 w-6" />
                  Crear Vehículo
                </p>
              }
              onCreated={refetch}
              width={900}
            />
          )
        }
      />
    </section>
  );
}


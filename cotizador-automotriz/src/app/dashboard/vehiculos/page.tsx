/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo } from 'react';
import { CustomTable } from '@/app/components/ui/customTable';
import { createTableStore } from '@/app/store/useTableStore';
import vehiculeColumns from './components/tableConfig';
import { useGetAllVehiculeVersionsQuery, vehiculeApi } from '@/app/api/vehiculeApi';
import { useDispatch } from 'react-redux';
import { useAuthStore } from '@/app/store/useAuthStore';
import { Role } from '@/app/types';
import WindowFormButton from '@/app/components/windowFormButton';
import { Plus } from 'lucide-react';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { getVehiculeFilters } from './components/filterConfig';

export default function VehiculesPage() {
  const { user, hydrated } = useAuthStore();
  const dispatch = useDispatch();
  const useVehiculesTableStore = useMemo(
    () => createTableStore('vehicules'),
    []
  );
  const { filters, pagination, sort } = useVehiculesTableStore();

  const { data: companiesData } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });

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

  const loadBrandOptions = async (search: string) => {
    const result = await (dispatch as any)(
      vehiculeApi.endpoints.getVehiculeBrands.initiate({
        limit: 50,
        search: search || undefined,
      })
    ).unwrap();

    return (result.data || []).map((b: any) => ({
      value: String(b.idmarca),
      label: b.descrip,
    }));
  };

  const loadLineOptions = async (search: string) => {
    const result = await (dispatch as any)(
      vehiculeApi.endpoints.getVehiculeLines.initiate({
        limit: 50,
        search: search || undefined,
      })
    ).unwrap();

    return (result.data || []).map((l: any) => ({
      value: String(l.idlinea),
      label: l.descrip,
    }));
  };

  const loadModelOptions = async (search: string) => {
    const result = await (dispatch as any)(
      vehiculeApi.endpoints.getVehiculeModels.initiate({
        limit: 50,
        search: search || undefined,
      })
    ).unwrap();

    return (result.data || []).map((m: any) => ({
      value: String(m.idmodelo),
      label: m.descrip,
    }));
  };

  const companyOptions =
    companiesData?.data.map((c) => ({
      value: c.id,
      label: c.name,
    })) || [];

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

  const showCompanyColumn = companyOptions.length > 1;

  const columns = vehiculeColumns({
    onCreated: refetch,
    role: user.role,
    showCompanyColumn,
  });

  const showCompanyFilter =companyOptions.length > 1;

  const vehiculeFilters = getVehiculeFilters({
    companyOptions,
    showCompanyFilter,
    loadBrandOptions,
    loadLineOptions,
    loadModelOptions,
  });

  return (
    <section className="w-full border-l border-gray px-5 min-h-screen">
      <CustomTable
        store={useVehiculesTableStore}
        columns={columns}
        data={data?.data || []}
        filters={vehiculeFilters}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }}
        loading={isLoading || isFetching}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        title="Gestion de Vehiculos"
        description="Podris ver y administrar las versiones de vehiculos disponibles para tus compañias."
        buttons={
          (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) && (
            <WindowFormButton
              formUrl="/vehicules/create"
              buttonText={
                <p className="flex gap-3">
                  <Plus className="text-white h-6 w-6" />
                  Crear Vehiculo
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

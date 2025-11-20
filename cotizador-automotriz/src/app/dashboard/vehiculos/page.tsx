/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { FilterConfig } from '@/app/types/table'; 

export default function VehiculesPage() {
  const { user, hydrated, token } = useAuthStore();
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

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL_API || 'http://localhost:3003/api';

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
    const params = new URLSearchParams();
    params.append('limit', '50');
    if (search) params.append('search', search);

    const res = await fetch(
      `${apiBaseUrl}/vehicules/brands?${params.toString()}`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      }
    );

    const json = await res.json();
    return (json.data || []).map((b: any) => ({
      value: String(b.idmarca),
      label: b.descrip,
    }));
  };

  const loadLineOptions = async (search: string) => {
    const params = new URLSearchParams();
    params.append('limit', '50');
    if (search) params.append('search', search);

    const res = await fetch(
      `${apiBaseUrl}/vehicules/lines?${params.toString()}`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      }
    );

    const json = await res.json();
    return (json.data || []).map((l: any) => ({
      value: String(l.idlinea),
      label: l.descrip,
    }));
  };

  const loadModelOptions = async (search: string) => {
    const params = new URLSearchParams();
    params.append('limit', '50');
    if (search) params.append('search', search);

    const res = await fetch(
      `${apiBaseUrl}/vehicules/models?${params.toString()}`,
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      }
    );

    const json = await res.json();
    return (json.data || []).map((m: any) => ({
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

  const columns = vehiculeColumns({
    onCreated: refetch,
    role: user.role,
  });

  const vehiculeFilters: FilterConfig[] = [
    {
      name: 'search',
      label: 'Buscar por version',
      type: 'text',
      placeholder: 'Ej: Corolla XEi',
    },
    {
      name: 'brandId',
      label: 'Marca',
      type: 'selectSearch',
      placeholder: 'Todas las marcas',
      loadOptions: loadBrandOptions,
    },
    {
      name: 'lineId',
      label: 'Linea',
      type: 'selectSearch',
      placeholder: 'Todas las lineas',
      loadOptions: loadLineOptions,
    },
    {
      name: 'modelId',
      label: 'Modelo',
      type: 'selectSearch',
      placeholder: 'Todos los modelos',
      loadOptions: loadModelOptions,
    },
  ];

  const showCompanyFilter =
    user.role === Role.SUPER_ADMIN ||
    (user.role === Role.ADMIN && companyOptions.length > 1);

  if (showCompanyFilter) {
    vehiculeFilters.push({
      name: 'companyId',
      label: 'Compañia',
      type: 'select',
      options: [
        { value: '', label: 'Todas las compañias' },
        ...companyOptions,
      ],
    });
  }

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

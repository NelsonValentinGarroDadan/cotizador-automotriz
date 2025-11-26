import { FilterConfig } from '@/app/types/table';

interface VehiculeFilterOptions {
  companyOptions: { value: string; label: string }[];
  showCompanyFilter: boolean;
  loadBrandOptions: (search: string) => Promise<{ value: string; label: string }[]>;
  loadLineOptions: (search: string) => Promise<{ value: string; label: string }[]>;
  loadModelOptions: (search: string) => Promise<{ value: string; label: string }[]>;
}

export const getVehiculeFilters = ({
  companyOptions,
  showCompanyFilter,
  loadBrandOptions,
  loadLineOptions,
  loadModelOptions,
}: VehiculeFilterOptions): FilterConfig[] => {
  const filters: FilterConfig[] = [
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

  if (showCompanyFilter) {
    filters.push({
      name: 'companyId',
      label: 'Compañia',
      type: 'select',
      options: [
        { value: '', label: 'Todas las compañias' },
        ...companyOptions,
      ],
    });
  }

  return filters;
};



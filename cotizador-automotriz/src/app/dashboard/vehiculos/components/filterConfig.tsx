import { FilterConfig } from '@/app/types/table';

interface VehiculeFilterOptions {
  companyOptions: { value: string; label: string }[];
  showCompanyFilter: boolean;
  loadBrandOptions: (search: string) => Promise<{ value: string; label: string }[]>;
  loadLineOptions: (search: string) => Promise<{ value: string; label: string }[]>; 
}

export const getVehiculeFilters = ({
  companyOptions,
  showCompanyFilter,
  loadBrandOptions,
  loadLineOptions, 
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



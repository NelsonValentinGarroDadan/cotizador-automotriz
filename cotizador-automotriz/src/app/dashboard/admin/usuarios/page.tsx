'use client';

import { CustomTable } from '@/app/components/ui/customTable';
import { empleadosColumns } from './components/tableConfig';
import { empleadosFilters } from './components/filterConfig';

export default function Page() { 

  // Handler de filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilter = (filters: Record<string, any>) => {
    console.log('Filtros:', filters);
    // Acá harías tu petición al backend con los filtros
  };

  // Handler de paginación
  const handlePageChange = (page: number, limit: number) => {
    console.log('Página:', page, 'Límite:', limit);
    // Acá harías tu petición al backend con page y limit
  };
  const empleadosMock = [
  {
    id: "1",
    firstName: "Lucía",
    lastName: "Pérez",
    email: "lucia@seguros.com",
    companies: [{ company: { name: "Seguros San Luis" } }],
    quotationsCount: 12,
    lastQuotation: "2025-10-29T18:20:00Z",
    createdAt: "2025-06-01T15:00:00Z",
  },
  {
    id: "2",
    firstName: "Diego",
    lastName: "Gómez",
    email: "diego@autoplus.com",
    companies: [{ company: { name: "AutoPlus" } }],
    quotationsCount: 3,
    lastQuotation: null,
    createdAt: "2025-08-14T10:30:00Z",
  },
];

  return (
    <div className="p-6 w-full"> 
      <CustomTable
        tableId="empleados"
        columns={empleadosColumns}
        data={empleadosMock}
        filters={empleadosFilters}
        pagination={{
          currentPage: 1, 
          totalItems: 2,
          totalPages: 1,
        }}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        loading={false}
      />
    </div>
  );
}
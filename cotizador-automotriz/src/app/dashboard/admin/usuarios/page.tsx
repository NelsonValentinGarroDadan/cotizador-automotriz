'use client';

import { CustomTable } from '@/app/components/ui/customTable';
import { empleadosColumns } from './components/tableConfig';
import { empleadosFilters } from './components/filterConfig';
import { useGetAllUsersQuery } from '@/app/api/userApi';
import { useEffect, useMemo } from 'react';
import { createTableStore } from '@/app/store/useTableStore';
import { Role } from '@/app/types';

export default function Page() {
  const useTableStore = useMemo(() => createTableStore('empleados'), []);

  const { filters, pagination, sort } = useTableStore();

  const { data, isLoading } = useGetAllUsersQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    role:Role.USER,
    ...filters,
  });
  useEffect(()=>{console.log(data)},[data])
  return (
    <CustomTable
      store={useTableStore} // pasamos la instancia al componente
      columns={empleadosColumns}
      data={data?.data || []}
      filters={empleadosFilters}
      pagination={{
        currentPage: data?.page || 1,
        totalItems: data?.total || 0,
        totalPages: data?.totalPages || 1,
      }}
      onFilter={(filters) => console.log(filters)}
      onPageChange={(page, limit) => console.log(page, limit)}
      loading={isLoading}
    />
  );
}

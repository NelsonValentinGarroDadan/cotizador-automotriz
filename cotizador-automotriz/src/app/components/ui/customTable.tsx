/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { FilterConfig, PaginationData, TableColumn } from '@/app/types/table';
import PageHeader from '@/app/components/ui/pageHeader';
import CustomButton from './customButton';

interface CustomTableProps {
  store: ReturnType<typeof import('@/app/store/useTableStore').createTableStore>;
  columns: TableColumn[];
  data: any[];
  title?: string;
  description?: string;
  buttons?: React.ReactNode;
  filters?: FilterConfig[];
  pagination?: PaginationData;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number, limit: number) => void;
  loading?: boolean;
}

export function CustomTable({
  store,
  columns,
  data,
  title,
  description,
  buttons,
  filters = [],
  pagination,
  onFilter,
  onPageChange,
  loading = false,
}: CustomTableProps) {
  const { register, handleSubmit, reset } = useForm();
  const {
    filters: savedFilters,
    pagination: savedPagination,
    sort: savedSort,
    setFilters,
    setPagination,
    setSort,
    resetFilters,
  } = store();

  const isManualReset = useRef(false);

  useEffect(() => {
    if (!isManualReset.current) reset(savedFilters);
    else isManualReset.current = false;
  }, [savedFilters, reset]);

  const handleFilterSubmit = (data: Record<string, any>) => {
    setFilters(data);
    onFilter?.(data);
  };

  const handleResetFilters = () => {
    const emptyValues = Object.fromEntries(filters.map(f => [f.name, '']));
    reset(emptyValues);
    resetFilters();
    onFilter?.({});
  };

  const handlePageChange = (newPage: number) => {
    setPagination(newPage, savedPagination.limit);
    onPageChange?.(newPage, savedPagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(1, newLimit);
    onPageChange?.(1, newLimit);
  };

  const handleSort = (colKey: string) => {
    let newOrder: 'asc' | 'desc' = 'asc';
    if (savedSort.sortBy === colKey) {
      newOrder = savedSort.sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSort(colKey, newOrder);
    onPageChange?.(savedPagination.page, savedPagination.limit);
  };

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'text':
        return (
          <input
            {...register(filter.name)}
            placeholder={filter.placeholder}
            className="border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
          />
        );
      case 'select':
        return (
          <select
            {...register(filter.name)}
            className="bg-yellow-light border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
          >
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            {...register(filter.name)}
            className="bg-yellow-light border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...register(filter.name)}
            placeholder={filter.placeholder}
            className="bg-yellow-light  border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
          />
        );
      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(savedFilters).some(v => v !== '' && v !== undefined);

  return (
    <div className="w-full flex flex-col h-full py-1"> 
      <div className="sticky top-0 z-50 bg-white shadow-sm">
          {/* HEADER */}
          {title && (
            <PageHeader
              title={title}
              description={description}
              buttons={buttons}
            />
          )}

          {/* FILTROS */}
          {filters.length > 0 && (
            <form
              onSubmit={handleSubmit(handleFilterSubmit)}
              className="py-4 flex items-center justify-between gap-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filters.map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray mb-1">
                      {f.label}
                    </label>
                    {renderFilter(f)}
                  </div>
                ))}
              </div>
              <div  className='flex gap-3'>
                <CustomButton
                  type="submit" 
                >
                  Filtrar
                </CustomButton>
                <CustomButton
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters} 
                >
                  Limpiar
                </CustomButton>
              </div>
            </form>
          )}

          {/* PAGINADO */}
          {pagination && (
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray">Mostrar:</span>
                <select
                  value={savedPagination.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray/50 px-3 py-1.5 rounded text-sm outline-none focus:ring-2 focus:ring-blue/60"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray">
                  registros ({pagination.totalItems} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CustomButton
                  onClick={() => handlePageChange(savedPagination.page - 1)}
                  disabled={savedPagination.page === 1} 
                >
                  Anterior
                </CustomButton>
                <span className="text-sm text-gray">
                  Página {savedPagination.page} de {pagination.totalPages}
                </span>
                <CustomButton
                  onClick={() => handlePageChange(savedPagination.page + 1)}
                  disabled={savedPagination.page === pagination.totalPages} 
                >
                  Siguiente
                </CustomButton>
              </div>
            </div>
          )}

          {/* HEADER DE TABLA */}
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-blue text-white">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-sm font-medium border border-blue-light-ligth ${
                      col.sortable ? 'cursor-pointer select-none' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable && savedSort.sortBy === col.key
                      ? savedSort.sortOrder === 'asc'
                        ? ' ↑'
                        : ' ↓'
                      : null}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
      </div>

  
      <table className="w-full table-fixed border-collapse">
        <tbody>
           {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray"
              >
                Cargando datos...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray"
              >
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 !== 0 ? 'bg-gray/10' : 'bg-white'}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm border-l border-gray/20"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
}

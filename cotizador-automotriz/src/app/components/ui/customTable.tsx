/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { FilterConfig, PaginationData, TableColumn } from '@/app/types/table';

interface CustomTableProps {
  store: ReturnType<typeof import('@/app/store/useTableStore').createTableStore>;
  columns: TableColumn[];
  data: any[];
  filters?: FilterConfig[];
  pagination?: PaginationData;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number, limit: number) => void;
  loading?: boolean;
}

export function CustomTable({ store, columns, data, filters = [], pagination, onFilter, onPageChange, loading = false }: CustomTableProps) {
  const { register, handleSubmit, reset } = useForm();
  const { filters: savedFilters, pagination: savedPagination, sort: savedSort, setFilters, setPagination, setSort, resetFilters } = store();

  useEffect(() => {
    reset(savedFilters);
  }, [savedFilters, reset]);

  const handleFilterSubmit = (data: Record<string, any>) => {
    setFilters(data);
    onFilter?.(data);
  };

  const handleResetFilters = () => {
    resetFilters();
    reset({});
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
        return <input {...register(filter.name)} placeholder={filter.placeholder} className="border px-3 py-2 rounded w-full" />;
      case 'select':
        return (
          <select {...register(filter.name)} className="border px-3 py-2 rounded w-full">
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date':
        return <input type="date" {...register(filter.name)} className="border px-3 py-2 rounded w-full" />;
      case 'number':
        return <input type="number" {...register(filter.name)} placeholder={filter.placeholder} className="border px-3 py-2 rounded w-full" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-3">
      {filters.length > 0 && (
        <form onSubmit={handleSubmit(handleFilterSubmit)} className="mb-4 p-4   rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {filters.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                {renderFilter(f)}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Filtrar</button>
            <button type="button" onClick={handleResetFilters} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Limpiar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="w-full">
          <thead className="bg-blue  text-white">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-left text-sm font-medium ${col.sortable ? 'cursor-pointer' : ''}`} onClick={() => col.sortable && handleSort(col.key)}>
                  {col.label} {col.sortable && savedSort.sortBy === col.key ? (savedSort.sortOrder === 'asc' ? ' ↑' : ' ↓') : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center py-8">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-8">No hay datos</td></tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select value={savedPagination.limit} onChange={(e) => handleLimitChange(Number(e.target.value))} className="border px-3 py-2 rounded text-sm">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">registros ({pagination.totalItems} total)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(savedPagination.page - 1)} disabled={savedPagination.page === 1} className="px-3 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-100">Anterior</button>
            <span className="text-sm text-gray-600">Página {savedPagination.page} de {pagination.totalPages}</span>
            <button onClick={() => handlePageChange(savedPagination.page + 1)} disabled={savedPagination.page === pagination.totalPages} className="px-3 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-100">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}

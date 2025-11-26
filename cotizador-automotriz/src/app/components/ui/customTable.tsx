/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Controller, useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { FilterConfig, PaginationData, TableColumn } from '@/app/types/table';
import { SelectSearch } from '@/app/components/ui/selectSearch';
import PageHeader from '@/app/components/ui/pageHeader';
import CustomButton from './customButton';
import MultiSelectFilter from './multiSelectFilter';
import { X } from 'lucide-react';

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
  const { register, handleSubmit, reset, control } = useForm();
  const {
    filters: savedFilters,
    pagination: savedPagination,
    sort: savedSort,
    setFilters,
    setPagination,
    setSort,
    resetFilters,
    setShowFilters:setShowDesktopFilters,
    showFilters:showDesktopFilters
  } = store();

  const isManualReset = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

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

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false); 

  const mobileHandleSubmit = handleSubmit((data: Record<string, any>) => {
    handleFilterSubmit(data);
    setIsFiltersModalOpen(false);
  });

  const handleOpenFilters = () => setIsFiltersModalOpen(true);
  const handleCloseFilters = () => setIsFiltersModalOpen(false);

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
            className="bg-yellow-light border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
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
      case 'multiselect':
        return (
          <Controller
            name={filter.name}
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <MultiSelectFilter
                options={filter.options || []}
                value={field.value || []}
                onChange={field.onChange}
                placeholder={filter.placeholder || 'Seleccionar...'}
              />
            )}
          />
        );
      case 'selectSearch':
        return (
          <Controller
            name={filter.name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <SelectSearch
                value={field.value || undefined}
                onChange={(val) => field.onChange(val ?? '')}
                loadOptions={filter.loadOptions || (() => Promise.resolve([]))}
                placeholder={filter.placeholder || 'Seleccionar...'}
              />
            )}
          />
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

  // Auto-scroll al inicio de la tabla cuando cambian página/datos
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (containerRef.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [data, savedPagination.page]);

  return (
    <div ref={containerRef} className="w-full flex flex-col h-full py-1"> 
      <div className="sticky top-20 md:top-15 z-50 bg-white shadow-sm border-b">
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
            <>
              
              {showDesktopFilters && (
                <form
                  onSubmit={handleSubmit(handleFilterSubmit)}
                  className="py-4 items-center justify-between gap-3 hidden md:flex"
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
                  <div className="flex gap-3">
                    <CustomButton type="submit">
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
              <div className="md:hidden flex flex-col gap-3 px-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {hasActiveFilters
                      ? 'Estás filtrando los resultados'
                      : 'Filtra la lista para encontrar lo que buscás'}
                  </p>
                  <CustomButton
                    type="button"
                    onClick={handleOpenFilters}
                    className="text-sm px-4 py-2"
                  >
                    Filtrar
                  </CustomButton>
                </div>
                <CustomButton
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm px-4 py-2"
                >
                  Limpiar
                </CustomButton>
              </div>
            </>
          )}
          {isFiltersModalOpen && (
            <div className="mt-18 fixed inset-0 z-1100 flex items-center justify-center bg-black/40 px-4 py-6 md:hidden">
              <div className="bg-white w-full max-w-lg h-full rounded-3xl shadow-xl overflow-auto flex flex-col">
                <div className="flex items-start justify-between border-b px-5 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      Filtrando
                    </p>
                    <p className="text-sm text-gray-900">
                      {hasActiveFilters
                        ? 'Hay filtros activos'
                        : 'Seleccioná filtros para refinar la tabla'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseFilters}
                    className="text-gray-500"
                    aria-label="Cerrar filtros"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={mobileHandleSubmit} className="p-5 flex flex-col gap-4 flex-1">
                  <div className="grid grid-cols-1 gap-4">
                    {filters.map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray mb-1">
                          {f.label}
                        </label>
                        {renderFilter(f)}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <CustomButton type="submit" className="flex-1">
                      Aplicar filtros
                    </CustomButton>
                    <CustomButton
                      type="button"
                      className="flex-1"
                      onClick={handleResetFilters}
                      disabled={!hasActiveFilters}
                    >
                      Limpiar
                    </CustomButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PAGINADO */}
          {pagination && (
            <div className="flex flex-col gap-3 pb-4">
              {/* Desktop inline layout */}
              <div className="hidden md:flex md:justify-between items-center gap-3 flex-wrap">
                <div className="flex items-center gap-4">
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
                <div className='flex items-center gap-4'>
                  <CustomButton
                    onClick={() => handlePageChange(savedPagination.page - 1)}
                    disabled={savedPagination.page === 1}
                    className="text-sm"
                  >
                    Anterior
                  </CustomButton>
                  <span className="text-sm text-gray text-center">
                    Página {savedPagination.page} de {pagination.totalPages}
                  </span>
                  <CustomButton
                    onClick={() => handlePageChange(savedPagination.page + 1)}
                    disabled={savedPagination.page === pagination.totalPages}
                    className="text-sm"
                  >
                    Siguiente
                  </CustomButton> 
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-yellow-500">{hasActiveFilters &&  "Filtros activos" }</p> 
                  <CustomButton
                    type="button"
                    className="text-sm px-4 py-2 bg-transparent! text-black/80! hover:text-black! underline "
                    onClick={() =>
                      setShowDesktopFilters?.(showDesktopFilters === undefined ? false : !showDesktopFilters)
                    }
                  >
                    {showDesktopFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                  </CustomButton>
                </div>
              </div>

              {/* Mobile layout unchanged */}
              <div className="flex flex-col gap-2 md:hidden">
                <div className="flex flex-wrap items-center gap-2 text-sm">
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
                <div className="flex items-center justify-between gap-2">
                  <CustomButton
                    onClick={() => handlePageChange(savedPagination.page - 1)}
                    disabled={savedPagination.page === 1}
                    className="flex-1 text-sm"
                  >
                    Anterior
                  </CustomButton>
                  <span className="text-sm text-gray text-center">
                    Página {savedPagination.page} de {pagination.totalPages}
                  </span>
                  <CustomButton
                    onClick={() => handlePageChange(savedPagination.page + 1)}
                    disabled={savedPagination.page === pagination.totalPages}
                    className="flex-1 text-sm"
                  >
                    Siguiente
                  </CustomButton>
                </div>
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
                    className={`md:px-4 py-3 text-center md:text-left text-sm font-medium border border-blue-light-ligth ${
                      col.sortable ? 'cursor-pointer select-none' : ''
                    } ${col.className ?? ''}`}
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

 
      <table className="w-full table-fixed border-collapse mt-4">
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
                    className={`px-4 py-3 text-sm border-l border-gray/20 ${col.className ?? ''}`}
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

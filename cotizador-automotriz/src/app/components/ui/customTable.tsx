/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form'; 
import { useEffect, useMemo } from 'react';
import { FilterConfig, PaginationData, TableColumn } from '@/app/types/table';
import { createTableStore } from '@/app/store/useTableStore';

interface ReusableTableProps {
    tableId: string;
    columns: TableColumn[];
    data: any[];
    filters?: FilterConfig[];
    pagination?: PaginationData;
    onFilter?: (filters: Record<string, any>) => void;
    onPageChange?: (page: number, limit: number) => void;
    defaultLimit?: number;
    loading?: boolean;
}

export function CustomTable({
    tableId,
    columns,
    data,
    filters = [],
    pagination,
    onFilter,
    onPageChange,
    defaultLimit = 50,
    loading = false,
}: ReusableTableProps) {
    const { register, handleSubmit, reset } = useForm();
    
    // Crear store único para esta tabla
    const useStore = useMemo(() => createTableStore(tableId, defaultLimit), [tableId, defaultLimit]);
    const { 
        filters: savedFilters, 
        pagination: savedPagination,
        setFilters,
        setPagination,
        resetFilters 
    } = useStore();

    // Inicializar con valores guardados
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

    const renderFilter = (filter: FilterConfig) => {
        switch (filter.type) {
        case 'text':
            return (
            <input
                type="text"
                {...register(filter.name)}
                placeholder={filter.placeholder}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            />
            );
        
        case 'select':
            return (
            <select
                {...register(filter.name)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            >
                <option value="">Seleccionar...</option>
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
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            />
            );
        
        case 'number':
            return (
            <input
                type="number"
                {...register(filter.name)}
                placeholder={filter.placeholder}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            />
            );
        
        default:
            return null;
        }
    };

    return (
        <div className="w-full">
        {/* Filtros */}
        {filters.length > 0 && (
            <form onSubmit={handleSubmit(handleFilterSubmit)} className="mb-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {filters.map((filter) => (
                <div key={filter.name}>
                    <label className="block text-sm font-medium mb-1">
                    {filter.label}
                    </label>
                    {renderFilter(filter)}
                </div>
                ))}
            </div>
            <div className="flex gap-2">
                <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                Filtrar
                </button>
                <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                >
                Limpiar
                </button>
            </div>
            </form>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-300 rounded">
            <table className="w-full">
            <thead className="bg-blue-900 text-white">
                <tr>
                {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-sm font-medium">
                    {col.label}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {loading ? (
                <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    Cargando...
                    </td>
                </tr>
                ) : data.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    No hay datos para mostrar
                    </td>
                </tr>
                ) : (
                data.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                    {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                    ))}
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* Paginación */}
        {pagination && (
            <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mostrar:</span>
                <select
                value={savedPagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">
                registros ({pagination.totalItems} total)
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                onClick={() => handlePageChange(savedPagination.page - 1)}
                disabled={savedPagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                Anterior
                </button>
                
                <span className="text-sm text-gray-600">
                Página {savedPagination.page} de {pagination.totalPages}
                </span>
                
                <button
                onClick={() => handlePageChange(savedPagination.page + 1)}
                disabled={savedPagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                Siguiente
                </button>
            </div>
            </div>
        )}
        </div>
    );
}
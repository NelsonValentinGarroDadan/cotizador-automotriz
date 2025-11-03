export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPaginationParams = (
  query: any,
  allowedSortFields: string[] = [],
  defaultSortBy?: string
): Required<PaginationParams> => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 50));
  
  let sortBy = query.sortBy || defaultSortBy || allowedSortFields[0] || 'createdAt';
  const sortOrder = (query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  
  // Validar que sortBy esté en los campos permitidos
  if (allowedSortFields.length > 0 && !allowedSortFields.includes(sortBy)) {
    sortBy = defaultSortBy || allowedSortFields[0];
  }
  
  return { page, limit, sortBy, sortOrder };
};

export const calculatePagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
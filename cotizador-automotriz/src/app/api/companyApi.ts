import { api } from './api';  
import { PaginatedResponse } from '../types';
import { Company  } from '../types/compay';

interface GetCompanyParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  fechaCreacion?: string;
}

export const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllCompanies: builder.query<PaginatedResponse<Company>, GetCompanyParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.fechaCreacion) searchParams.append('fechaCreacion', params.fechaCreacion);
        return { url: `/companies?${searchParams.toString()}`, method: 'GET' };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Company' as const, id })),
              { type: 'Company', id: 'LIST' },
            ]
          : [{ type: 'Company', id: 'LIST' }],
    }),

    getCompanyById: builder.query<Company,{id:string}>({
      query: ({id})=>({
        url:`/companies/${id}`,
        method: 'GET'
      }), 
    }),
    createCompany: builder.mutation<Company, FormData>({
      query: (formData) => ({ url: '/companies', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),
    updateCompany: builder.mutation<Company, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/companies/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),
    deleteCompany: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/companies/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }, { type: 'Company', id: 'LIST' }],
    }),

  }),
});

export const { 
  useGetAllCompaniesQuery, 
  useCreateCompanyMutation, 
  useUpdateCompanyMutation, 
  useDeleteCompanyMutation,
  useGetCompanyByIdQuery
} = companyApi;

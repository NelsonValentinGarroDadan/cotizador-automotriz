import { api } from './api';
import { PaginatedResponse } from '../types';
import { Quotation } from '../types/quotition';


interface GetQuotationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  companyIds?: string[];
  planVersionId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const quotationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllQuotations: builder.query<PaginatedResponse<Quotation>, GetQuotationParams>({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params.page) sp.append('page', params.page.toString());
        if (params.limit) sp.append('limit', params.limit.toString());
        if (params.sortBy) sp.append('sortBy', params.sortBy);
        if (params.sortOrder) sp.append('sortOrder', params.sortOrder);
        if (params.search) sp.append('search', params.search);
        if (params.companyIds) sp.append('companyIds', params.companyIds.join(','));
        if (params.planVersionId) sp.append('planVersionId', params.planVersionId);
        if (params.fechaDesde) sp.append('fechaDesde', params.fechaDesde);
        if (params.fechaHasta) sp.append('fechaHasta', params.fechaHasta);
        return { url: `/quotations?${sp.toString()}`, method: 'GET' };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'HC' as const, id })),
              { type: 'HC', id: 'LIST' },
            ]
          : [{ type: 'HC', id: 'LIST' }],
    }),

    getQuotationById: builder.query<Quotation, { id: string }>({
      query: ({ id }) => ({ url: `/quotations/${id}`, method: 'GET' }),
    }),

    createQuotation: builder.mutation<Quotation, Partial<Quotation>>({
      query: (body) => ({ url: '/quotations', method: 'POST', body }),
      invalidatesTags: [{ type: 'HC', id: 'LIST' }],
    }),

    updateQuotation: builder.mutation<Quotation, { id: string; data: Partial<Quotation> }>({
      query: ({ id, data }) => ({ url: `/quotations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HC', id }],
    }),

    deleteQuotation: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/quotations/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'HC', id },
        { type: 'HC', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationApi;

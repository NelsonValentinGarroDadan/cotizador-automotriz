// app/api/planApi.ts
import { api } from './api';  
import { PaginatedResponse } from '../types';
import { Plan, PlanWithDetails } from '../types/plan';

interface GetPlanParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  companyId?: string;
  fechaCreacion?: string;
}

export const planApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllPlans: builder.query<PaginatedResponse<Plan>, GetPlanParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.companyId) searchParams.append('companyId', params.companyId);
        if (params?.fechaCreacion) searchParams.append('fechaCreacion', params.fechaCreacion);
        return { url: `/plans?${searchParams.toString()}`, method: 'GET' };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Plan' as const, id })),
              { type: 'Plan', id: 'LIST' },
            ]
          : [{ type: 'Plan', id: 'LIST' }],
    }),

    getPlanById: builder.query<PlanWithDetails, { id: string }>({
      query: ({ id }) => ({
        url: `/plans/${id}`,
        method: 'GET'
      }),
      providesTags: (result, error, { id }) => [{ type: 'Plan', id }],
    }),

    createPlan: builder.mutation<Plan, FormData>({
      query: (formData) => ({ url: '/plans', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'Plan', id: 'LIST' }],
    }),

    updatePlan: builder.mutation<Plan, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/plans/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Plan', id }, { type: 'Plan', id: 'LIST' }],
    }),

    deletePlan: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/plans/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Plan', id }, { type: 'Plan', id: 'LIST' }],
    }),
  }),
});

export const { 
  useGetAllPlansQuery, 
  useCreatePlanMutation, 
  useUpdatePlanMutation, 
  useDeletePlanMutation,
  useGetPlanByIdQuery
} = planApi;
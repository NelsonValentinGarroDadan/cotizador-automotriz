import { api } from './api';  
import { PaginatedResponse, Role } from '../types';
import { CreateAdminInput, UpdateAdminInput, UserWithCompanies  } from '../types/user';

interface GetUserParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string; 
  companyIds?:string[];
  role:Role;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<UserWithCompanies>, GetUserParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        if (params?.search) searchParams.append('search', params.search); 
        if (params?.companyIds) searchParams.append('companyIds', params.companyIds.join(',')); 
        searchParams.append('role',params.role);
        return { url: `/users?${searchParams.toString()}`, method: 'GET' };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<UserWithCompanies,{id:string}>({
      query: ({id})=>({
        url:`/users/${id}`,
        method: 'GET'
      }), 
    }),
    createUser: builder.mutation<UserWithCompanies, CreateAdminInput>({
      query: (formData) => ({ url: '/users', method: 'POST', body: formData }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<UserWithCompanies, { id: string; data: UpdateAdminInput }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

  }),
});

export const { 
  useGetAllUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useGetUserByIdQuery
} = userApi;

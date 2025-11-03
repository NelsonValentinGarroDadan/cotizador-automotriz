  
import { PaginatedResponse, Role } from '../types';
import { User } from '../types/user';
import { api } from './api';

interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role: Role
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<User> ,  GetUsersParams | void>({ 
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/users?${searchParams.toString()}`,
          method: 'GET',
        };
      },
    }), 
    
  }),
});

export const {
  useGetAllUsersQuery,  
} = userApi;
  
import { PaginatedResponse, Role } from '../types';
import { Company } from '../types/compay'; 
import { api } from './api';

interface GetCompanyParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role: Role
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<Company> ,  GetCompanyParams | void>({ 
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `/companies?${searchParams.toString()}`,
          method: 'GET',
        };
      },
    }), 
    
  }),
});

export const {
  useGetAllUsersQuery,  
} = userApi;
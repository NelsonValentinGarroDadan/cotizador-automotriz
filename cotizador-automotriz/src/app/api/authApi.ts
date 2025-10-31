  
import { AuthResponse, LoginDto, User } from '../types/user';
import { api } from './api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginDto>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const {
  useLoginMutation, 
  useGetCurrentUserQuery,
} = authApi;
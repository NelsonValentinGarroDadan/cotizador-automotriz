import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useAuthStore } from '../store/useAuthStore';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL_API || 'http://localhost:3003/api',
    prepareHeaders: (headers) => {
      // Obtener token de Zustand
      const token = useAuthStore.getState().token;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Company', 'Plan', 'HC'],
  endpoints: () => ({}), // Vacío, se agregan por archivo
});
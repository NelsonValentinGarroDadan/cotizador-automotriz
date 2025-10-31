import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useAuthStore } from '../store/useAuthStore';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.BASE_API_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      // Obtener token de Zustand
      const token = useAuthStore.getState().token;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Cart'],
  endpoints: () => ({}), // Vacío, se agregan por archivo
});
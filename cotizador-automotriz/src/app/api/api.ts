import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.BASE_API_URL || 'http://localhost:3000/api' }),
  tagTypes: ['User', 'Product', 'Cart'],
  endpoints: () => ({}), // Vacío, se agregan por archivo
});
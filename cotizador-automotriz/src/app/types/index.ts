export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}   

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages:number;
}
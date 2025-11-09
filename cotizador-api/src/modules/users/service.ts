import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import * as repository from "./repository";
import { CreateUser, UpdateUser } from "./schema";
import bcrypt from "bcrypt";

interface UserFilters {
  search?: string;
  role?: string;
  companyIds?: string[];
  fechaCreacion?: string;
}

export const getAllUsers = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filters?: UserFilters
): Promise<PaginatedResponse<any>> => {
  const { users, total } = await repository.getAllUsers(
    page, 
    limit, 
    sortBy, 
    sortOrder,
    filters
  );
  return createPaginatedResponse(users, total, page, limit);
};
export const getUserById = async (id: string) => {
    const user = await repository.getUserById(id);
    if(!user) throw new AppError("Usuario no encontrado", 404);
    return user;
}

export const createUser = async (data: CreateUser) => {
    const existingUser =  await repository.getUserByEmail(data.email);
    if(existingUser) throw new AppError("Este email ya esta en uso", 400);
    const hashedPassword = await bcrypt.hash(data.password, 10);  
    data.password = hashedPassword; 

    return await repository.createUser(data); 
}

export const updateUser = async (id: string, data:UpdateUser) => {
    const existingUser =  await repository.getUserById(id);
    if(!existingUser) throw new AppError("Usuario no encontrado", 404); 
    if(data.password) data.password = await bcrypt.hash(data.password, 10); 
    await repository.updateUser(id, data);
}

export const deleteUser = async (id: string) => {
    const existingUser =  await repository.getUserById(id);
    if(!existingUser) throw new AppError("Usuario no encontrado", 404); 
    await repository.deleteUser(id);
}
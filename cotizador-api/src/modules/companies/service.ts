import { User } from "@prisma/client";
import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import * as repository from "./repository";
import { CreateCompany, UpdateCompany } from "./schema";
import { UserToken } from "../../core/types/userToken";

export const getAllCompanies = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string; active?: boolean }
): Promise<PaginatedResponse<any> & { roleStats: { ADMIN: number; USER: number } }> => {
  const { companies, total, roleStats } = await repository.getAllCompanies(
    userId,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );
  return { ...createPaginatedResponse(companies, total, page, limit), roleStats };
};
export const getCompanyById = async (id: string,user: UserToken ) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404); 
 
  if (company.ownerId !== user?.id)  throw new AppError("Compañía no encontrada", 404);    
  return company;
};

export const createCompany = async (data: CreateCompany & { logo?: string }) => {
  return await repository.createCompany(data);
};

export const updateCompany = async (id: string, data: Omit<UpdateCompany, "id"> & { logo?: string },user: UserToken) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404);
  if (company.ownerId !== user?.id)  throw new AppError("Compañía no encontrada", 404);
  return await repository.updateCompany(id, data);
};

export const deleteCompany = async (id: string,user: UserToken) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404);
  if (company.ownerId !== user?.id)  throw new AppError("Compañía no encontrada", 404);
  await repository.deleteCompany(id);
};

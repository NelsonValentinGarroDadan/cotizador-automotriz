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
  filters?: { name?: string; createdAtFrom?: Date }
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

export const getCompanyById = async (id: string, user: UserToken | undefined) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);

  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404);

  const isMember = company.userCompanies.some((uc) => uc.userId === user.id);
  if (!isMember) throw new AppError("No tienes acceso a esta compañía", 403);

  return company;
};


export const createCompany = async (data: CreateCompany & { logo?: string }, user: UserToken) => {
  return await repository.createCompany({ ...data, userId: user.id });
};

export const updateCompany = async (id: string, data: Omit<UpdateCompany, "id"> & { logo?: string }, user: UserToken) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404);

  const isAdmin = company.userCompanies.some((uc) => uc.userId === user.id && uc.user.role === "ADMIN");
  if (!isAdmin) throw new AppError("No tienes permisos para editar esta compañía", 403);

  return await repository.updateCompany(id, data);
};

export const deleteCompany = async (id: string, user: UserToken) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañía no encontrada", 404);

  const isAdmin = company.userCompanies.some((uc) => uc.userId === user.id && uc.user.role === "ADMIN");
  if (!isAdmin) throw new AppError("No tienes permisos para eliminar esta compañía", 403);

  await repository.deleteCompany(id);
};

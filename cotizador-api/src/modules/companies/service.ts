import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import * as repository from "./repository";
import { CreateCompany, UpdateCompany } from "./schema";
import { UserToken } from "../../core/types/userToken";
import { Role } from "../../core/types/role";

export const getAllCompanies = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string; createdAtFrom?: Date; includeInactive?: boolean }
): Promise<PaginatedResponse<any> & { roleStats: Record<string, number> }> => {
  const { companies, total, roleStats } = await repository.getAllCompanies(
    user.id,
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    user.role === Role.SUPER_ADMIN,
    user.role === Role.SUPER_ADMIN ? filters?.includeInactive : false
  );
  return { ...createPaginatedResponse(companies, total, page, limit), roleStats };
};

export const getCompanyById = async (id: string, user: UserToken | undefined) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);

  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compaña no encontrada", 404);
  if (company.active === false && user.role !== Role.SUPER_ADMIN) throw new AppError("Compaña no encontrada", 404);

  return company;
};

export const createCompany = async (
  data: CreateCompany & { logo?: string },
  user: UserToken
) => {
  return await repository.createCompany({ ...data, userId: user.id });
};

export const updateCompany = async (
  id: string,
  data: Omit<UpdateCompany, "id"> & { logo?: string },
  user: UserToken
) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañia no encontrada", 404);

  return await repository.updateCompany(id, data);
};

export const deleteCompany = async (id: string, user: UserToken) => {
  const company = await repository.getCompanyById(id);
  if (!company) throw new AppError("Compañia no encontrada", 404);

  await repository.deleteCompany(id);
  return;
};

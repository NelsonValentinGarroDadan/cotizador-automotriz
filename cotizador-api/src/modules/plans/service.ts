import { AppError } from "../../core/errors/appError";
import * as repository from "./repository";
import * as companyService from "../companies/service";
import { UserToken } from "../../core/types/userToken";
import { CreatePlan, UpdatePlan } from "./schema";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";

export const getAllPlans = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string }
): Promise<PaginatedResponse<any>> => {
  const { plans, total } = await repository.getAllPlans(
    userId,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );
  return createPaginatedResponse(plans, total, page, limit);
};

export const getPlanById = async (id: string, user: UserToken | undefined) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);
  return repository.getPlanById(id, user.id);
};

export const createPlan = async (
  data: CreatePlan & { logo?: string; companyIds: string[] },
  user: UserToken
) => {
  if (!data.companyIds?.length)
    throw new AppError("Debe asignar al menos una compañía", 400);

  // Verificar acceso del usuario a todas las compañías
  for (const companyId of data.companyIds) {
    await companyService.getCompanyById(companyId, user);
  }

  const plan = await repository.createPlan({
    ...data,
    userId: user.id,
  });

  await repository.createPlanVersion({
    planId: plan.id,
    createdById: user.id,
    version: 1,
    coefficients: [],
  });

  return plan;
};

export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & { logo?: string; companyIds?: string[] },
  user: UserToken
) => {
  const plan = await repository.getPlanById(id, user.id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  return repository.updatePlan(id, data);
};

export const deletePlan = async (id: string, user: UserToken) => {
  const plan = await repository.getPlanById(id, user.id);
  if (!plan) throw new AppError("Plan no encontrado", 404);
  await repository.deletePlan(id);
};

// backend/src/modules/plan/service.ts
import { AppError } from "../../core/errors/appError";
import * as repository from "./repository";
import * as companyService from "../companies/service";
import { UserToken } from "../../core/types/userToken";
import { CreatePlan, UpdatePlan } from "./schema";
import {
  createPaginatedResponse,
  PaginatedResponse,
} from "../../utils/pagination";

interface PlanFilters {
  name?: string;
  includeInactive?: boolean;
  companyIds?: string[];
}


export const getAllPlans = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: PlanFilters
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
  
  const plan = await repository.getPlanById(id, user.id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Verificar que el usuario tiene acceso a alguna compañía del plan
  const hasAccess = plan.companies.some((company) =>
    company.userCompanies.some((uc) => uc.userId === user.id)
  );

  if (!hasAccess) {
    throw new AppError("No tienes acceso a este plan", 403);
  }

  return plan;
};

export const createPlan = async (
  data: CreatePlan & { logo?: string; companyIds: string[] },
  user: UserToken
) => {
  if (!data.companyIds?.length) {
    throw new AppError("Debe asignar al menos una compañía", 400);
  }

  // Verificar acceso a todas las compañías
  for (const companyId of data.companyIds) {
    await companyService.getCompanyById(companyId, user);
  }

  // Crear el plan
  const plan = await repository.createPlan({
    ...data,
    userId: user.id,
  });

  // Crear primera versión con coeficientes
  await repository.createPlanVersion({
    planId: plan.id,
    createdById: user.id,
    version: 1,
    desdeMonto: data.desdeMonto,
    hastaMonto: data.hastaMonto,
    desdeCuota: data.desdeCuota,
    hastaCuota: data.hastaCuota,
    coefficients: data.coefficients,
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

  // Verificar acceso
  const hasAccess = plan.companies.some((company) =>
    company.userCompanies.some((uc) => uc.userId === user.id)
  );
  if (!hasAccess) {
    throw new AppError("No tienes acceso a este plan", 403);
  }

  // Si se cambian las compañías, verificar acceso a las nuevas
  if (data.companyIds) {
    for (const companyId of data.companyIds) {
      await companyService.getCompanyById(companyId, user);
    }
  }

  const updatedPlan = await repository.updatePlan(id, data);

// Si vienen nuevos coeficientes → crear nueva versión
if (data.coefficients && data.coefficients.length > 0) {
  const lastVersion = await repository.getLastVersionNumber(id);
  await repository.createPlanVersion({
    planId: id,
    createdById: user.id,
    version: (lastVersion ?? 0) + 1,
    desdeMonto: data.desdeMonto,
    hastaMonto: data.hastaMonto,
    desdeCuota: data.desdeCuota,
    hastaCuota: data.hastaCuota,
    coefficients: data.coefficients,
  });
}

return updatedPlan;

};

export const deletePlan = async (id: string, user: UserToken) => {
  const plan = await repository.getPlanById(id, user.id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Verificar acceso
  const hasAccess = plan.companies.some((company) =>
    company.userCompanies.some((uc) => uc.userId === user.id)
  );
  if (!hasAccess) {
    throw new AppError("No tienes acceso a este plan", 403);
  }

  await repository.deletePlan(id);
};
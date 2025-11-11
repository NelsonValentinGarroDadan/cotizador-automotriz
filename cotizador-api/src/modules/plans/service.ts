import { AppError } from "../../core/errors/appError";
import {
  createPaginatedResponse,
  PaginatedResponse,
} from "../../utils/pagination";
import * as repository from "./repository";
import * as companyService from "../companies/service";
import { CreatePlan, UpdatePlan } from "./schema";
import { UserToken } from "../../core/types/userToken";
import prisma from "../../config/prisma";

interface PlanFilters {
  name?: string;
  companyId?: string;
  createdAtFrom?: Date;
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

  const plan = await repository.getPlanById(id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  const isMember = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id
  );
  if (!isMember) throw new AppError("No tienes acceso a este plan", 403);

  return plan;
};

export const createPlan = async (
  data: CreatePlan & { logo?: string },
  user: UserToken
) => {
  await companyService.getCompanyById(data.companyId, user);

  const plan = await repository.createPlan({ ...data, userId: user.id });

  // ✅ Crear versión inicial automáticamente (v1)
  await repository.createPlanVersion({
    planId: plan.id,
    createdById: user.id,
    version: 1,
    coefficients: [], // vacío por defecto
  });

  return plan;
};

export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & { logo?: string },
  user: UserToken
) => {
  const plan = await repository.getPlanById(id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  const isAdmin = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id && uc.user.role === "ADMIN"
  );
  if (!isAdmin)
    throw new AppError("No tienes permisos para editar este plan", 403);

  if (data.companyId && data.companyId !== plan.companyId) {
    await companyService.getCompanyById(data.companyId, user);
  }

  // ✅ Si el update incluye una bandera `newVersion`, crear una nueva versión
  if ((data as any).newVersion && (data as any).coefficients) {
    const nextVersion = (plan._count.versions || 0) + 1;
    await repository.createPlanVersion({
      planId: id,
      createdById: user.id,
      version: nextVersion,
      coefficients: (data as any).coefficients,
    });
    
  }

  return await repository.updatePlan(id, data);
};

export const deletePlan = async (id: string, user: UserToken) => {
  const plan = await repository.getPlanById(id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  const isAdmin = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id && uc.user.role === "ADMIN"
  );
  if (!isAdmin)
    throw new AppError("No tienes permisos para eliminar este plan", 403);

  await repository.deletePlan(id);
};

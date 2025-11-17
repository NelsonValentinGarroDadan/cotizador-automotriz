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
import { Role } from "../../core/types/role";

interface PlanFilters {
  name?: string;
  includeInactive?: boolean;
  companyIds?: string[];
}

export const getAllPlans = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: PlanFilters
): Promise<PaginatedResponse<any>> => {
  const { plans, total } = await repository.getAllPlans(
    user.id,
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    user.role === Role.ADMIN,
    user.role === Role.SUPER_ADMIN
  );
  return createPaginatedResponse(plans, total, page, limit);
};

export const getPlanById = async (id: string, user: UserToken | undefined) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);

  const plan = await repository.getPlanById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );
  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Los USER solo pueden ver planes a los que estan permitidos
  if (user.role === Role.USER) {
    const isAllowed = plan?.allowedUsers?.some(
      (allowedUser) => allowedUser.id === user.id
    );

    if (!isAllowed) {
      throw new AppError("No tienes acceso a este plan", 403);
    }
  }
  return plan;
};

export const createPlan = async (
  data: CreatePlan & { logo?: string; companyIds: string[] },
  user: UserToken
) => {
  if (!data.companyIds?.length) {
    throw new AppError("Debe asignar al menos una compañia", 400);
  }

  // Verificar acceso a todas las compañias para ADMIN/USER.
  // SUPER_ADMIN puede usar cualquier compañia sin validacion extra.
  if (user.role !== Role.SUPER_ADMIN) {
    for (const companyId of data.companyIds) {
      await companyService.getCompanyById(companyId, user);
    }
  }

  const plan = await repository.createPlan({
    ...data,
    userId: user.id,
    allowedUserIds: data.allowedUserIds ?? [],
  });

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
  data: Omit<UpdatePlan, "id"> & {
    logo?: string;
    companyIds?: string[];
    allowedUserIds?: string[];
  },
  user: UserToken
) => {
  const plan = await repository.getPlanById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );

  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Usuarios de tipo USER solo pueden modificar planes permitidos
  if (user.role === Role.USER) {
    const isAllowed = plan.allowedUsers?.some(
      (allowedUser) => allowedUser.id === user.id
    );
    if (!isAllowed) {
      throw new AppError("No tienes acceso a este plan", 403);
    }
  }

  // ADMIN/USER deben tener acceso a las compañias si se cambian
  if (data.companyIds && user.role !== Role.SUPER_ADMIN) {
    for (const companyId of data.companyIds) {
      await companyService.getCompanyById(companyId, user);
    }
  }

  const updatedPlan = await repository.updatePlan(id, {
    ...data,
    allowedUserIds: data.allowedUserIds,
  });

  // Si vienen nuevos coeficientes → crear nueva version
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
  const plan = await repository.getPlanById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );

  if (!plan) throw new AppError("Plan no encontrado", 404);

  if (user.role === Role.USER) {
    const isAllowed = plan.allowedUsers?.some(
      (allowedUser) => allowedUser.id === user.id
    );

    if (!isAllowed) {
      throw new AppError("No tienes acceso a este plan", 403);
    }
  }

  await repository.deletePlan(id);
};


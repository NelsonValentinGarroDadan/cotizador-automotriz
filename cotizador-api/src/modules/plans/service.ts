// backend/src/modules/plan/service.ts
import { AppError } from "../../core/errors/appError";
import {
  createPaginatedResponse,
  PaginatedResponse,
} from "../../utils/pagination";
import * as repository from "./repository";
import * as companyService from "../companies/service"; 
import { CreatePlan, UpdatePlan } from "./schema";
import { UserToken } from "../../core/types/userToken";

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

  // Verificar que el usuario pertenece a la compañía del plan
  const isMember = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id
  );
  if (!isMember) throw new AppError("No tienes acceso a este plan", 403);

  return plan;
};

// ✅ Versión mejorada usando el servicio de company
export const createPlan = async (
  data: CreatePlan & { logo?: string },
  user: UserToken
) => {
  // Verificar que el usuario pertenece a la compañía
  // getCompanyById ya valida permisos y lanza error si no tiene acceso
  await companyService.getCompanyById(data.companyId, user);

  return await repository.createPlan({ ...data, userId: user.id });
};

// ✅ También actualizar updatePlan para usar el mismo patrón
export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & { logo?: string },
  user: UserToken
) => {
  const plan = await repository.getPlanById(id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Verificar que el usuario es admin de la compañía
  const isAdmin = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id && uc.user.role === "ADMIN"
  );
  if (!isAdmin) {
    throw new AppError("No tienes permisos para editar este plan", 403);
  }

  // ✅ Si se está cambiando de compañía, verificar permisos en la nueva compañía
  if (data.companyId && data.companyId !== plan.companyId) {
    await companyService.getCompanyById(data.companyId, user);
  }

  return await repository.updatePlan(id, data);
};

export const deletePlan = async (id: string, user: UserToken) => {
  const plan = await repository.getPlanById(id);
  if (!plan) throw new AppError("Plan no encontrado", 404);

  // Verificar que el usuario es admin de la compañía
  const isAdmin = plan.company.userCompanies.some(
    (uc) => uc.userId === user.id && uc.user.role === "ADMIN"
  );
  if (!isAdmin) {
    throw new AppError("No tienes permisos para eliminar este plan", 403);
  }

  await repository.deletePlan(id);
};
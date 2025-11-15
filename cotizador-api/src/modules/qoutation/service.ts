// backend/src/modules/quotation/service.ts
import { AppError } from "../../core/errors/appError";
import {
  createPaginatedResponse,
  PaginatedResponse,
} from "../../utils/pagination";
import * as repository from "./repository";
import * as companyService from "../companies/service";
import { UserToken } from "../../core/types/userToken";
import { CreateQuotation, UpdateQuotation } from "./schema";
import prisma from "../../config/prisma";

interface QuotationFilters {
  search?: string;
  companyIds?: string[];
  planVersionId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  isAdmin:boolean;
}

export const getAllQuotations = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: QuotationFilters, 
): Promise<PaginatedResponse<any>> => {
  const { quotations, total } = await repository.getAllQuotations(
    userId,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );
  return createPaginatedResponse(quotations, total, page, limit);
};

export const getQuotationById = async (
  id: string,
  user: UserToken | undefined
) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);

  const quotation = await repository.getQuotationById(id, user.id);
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  // Verificar que el usuario pertenece a la compañía de la cotización
  const isMember = quotation.company.userCompanies.some(
    (uc) => uc.userId === user.id
  );
  if (!isMember) {
    throw new AppError("No tienes acceso a esta cotización", 403);
  }

  return quotation;
};

export const createQuotation = async (
  data: CreateQuotation,
  user: UserToken
) => {
  // Verificar que el usuario pertenece a la compañía
  await companyService.getCompanyById(data.companyId, user);

  // Verificar que la versión del plan existe y pertenece a una de las compañías del usuario
  const planVersion = await prisma.planVersion.findUnique({
    where: { id: data.planVersionId },
    include: {
      plan: {
        include: {
          companies: {
            include: {
              userCompanies: {
                where: { userId: user.id },
              },
            },
          },
        },
      },
    },
  });

  if (!planVersion) {
    throw new AppError("Versión del plan no encontrada", 404);
  }

  const hasAccessToPlan = planVersion.plan.companies.some(
    (company) => company.userCompanies.length > 0
  );

  if (!hasAccessToPlan) {
    throw new AppError("No tienes acceso a este plan", 403);
  }

  return await repository.createQuotation({
    ...data,
    userId: user.id,
  });
};

export const updateQuotation = async (
  id: string,
  data: UpdateQuotation,
  user: UserToken
) => {
  const quotation = await repository.getQuotationById(id, user.id);
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  // Verificar que el usuario pertenece a la compañía
  const isMember = quotation.company.userCompanies.some(
    (uc) => uc.userId === user.id
  );
  if (!isMember) {
    throw new AppError("No tienes acceso a esta cotización", 403);
  }

  return await repository.updateQuotation(id, data);
};

export const deleteQuotation = async (id: string, user: UserToken) => {
  const quotation = await repository.getQuotationById(id, user.id);
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  // Verificar que el usuario pertenece a la compañía
  const isMember = quotation.company.userCompanies.some(
    (uc) => uc.userId === user.id
  );
  if (!isMember) {
    throw new AppError("No tienes acceso a esta cotización", 403);
  }

  await repository.deleteQuotation(id);
};
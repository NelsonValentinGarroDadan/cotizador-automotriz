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
import { Role } from "../../core/types/role";

interface QuotationFilters {
  search?: string;
  companyIds?: string[];
  planVersionId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  isAdmin: boolean;
}

export const getAllQuotations = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: QuotationFilters
): Promise<PaginatedResponse<any>> => {
  const { quotations, total } = await repository.getAllQuotations(
    user.id,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
      ? { ...filters, isSuperAdmin: user.role === Role.SUPER_ADMIN }
      : {
          isAdmin: false,
          isSuperAdmin: user.role === Role.SUPER_ADMIN,
        }
  );
  return createPaginatedResponse(quotations, total, page, limit);
};

export const getQuotationById = async (
  id: string,
  user: UserToken | undefined
) => {
  if (!user) throw new AppError("Usuario no autenticado", 403);

  const quotation = await repository.getQuotationById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );
  if (!quotation) throw new AppError("Cotizacion no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotizacion", 403);
    }
  }

  return quotation;
};

export const createQuotation = async (
  data: CreateQuotation,
  user: UserToken
) => {
  if (user.role !== Role.SUPER_ADMIN) {
    await companyService.getCompanyById(data.companyId, user);
  }

  const planVersion = await prisma.planVersion.findUnique({
    where: { id: data.planVersionId },
    include: {
      plan: {
        include: {
          companies: {
            include: {
              userCompanies:
                user.role === Role.SUPER_ADMIN
                  ? true
                  : {
                      where: { userId: user.id },
                    },
            },
          },
        },
      },
    },
  });

  if (!planVersion) {
    throw new AppError("Version del plan no encontrada", 404);
  }

  if (user.role !== Role.SUPER_ADMIN) {
    const hasAccessToPlan = planVersion.plan.companies.some(
      (company) => company.userCompanies.length > 0
    );

    if (!hasAccessToPlan) {
      throw new AppError("No tienes acceso a este plan", 403);
    }
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
  const quotation = await repository.getQuotationById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );
  if (!quotation) throw new AppError("Cotizacion no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotizacion", 403);
    }
  }

  return await repository.updateQuotation(id, data);
};

export const deleteQuotation = async (id: string, user: UserToken) => {
  const quotation = await repository.getQuotationById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );
  if (!quotation) throw new AppError("Cotizacion no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotizacion", 403);
    }
  }

  await repository.deleteQuotation(id);
};

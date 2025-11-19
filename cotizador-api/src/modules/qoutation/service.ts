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
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotización", 403);
    }
  }

  return quotation;
};

const validateVehicleVersionAccess = async (
  companyId: string,
  vehicleVersionId: number | undefined,
  user: UserToken
) => {
  if (!vehicleVersionId || user.role === Role.SUPER_ADMIN) {
    return;
  }

  // Verificar que la versión de vehículo está asignada a la compañía
  const vehicle = await prisma.autosVersion.findFirst({
    where: {
      idversion: vehicleVersionId,
      companyId,
    },
  });

  if (!vehicle) {
    throw new AppError(
      "El vehículo seleccionado no pertenece a una compañía a tu cargo",
      403
    );
  }
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
    throw new AppError("Versión del plan no encontrada", 404);
  }

  if (user.role !== Role.SUPER_ADMIN) {
    const hasAccessToPlan = planVersion.plan.companies.some(
      (company) => company.userCompanies.length > 0
    );

    if (!hasAccessToPlan) {
      throw new AppError("No tienes acceso a este plan", 403);
    }
  }

  await validateVehicleVersionAccess(
    data.companyId,
    data.vehicleVersionId,
    user
  );

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
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotización", 403);
    }
  }

  const nextCompanyId = data.companyId ?? quotation.companyId;
  const nextVehicleVersionId =
    data.vehicleVersionId ?? quotation.vehicleVersionId ?? undefined;

  await validateVehicleVersionAccess(
    nextCompanyId,
    nextVehicleVersionId,
    user
  );

  return await repository.updateQuotation(id, data);
};

export const deleteQuotation = async (id: string, user: UserToken) => {
  const quotation = await repository.getQuotationById(
    id,
    user.id,
    user.role === Role.SUPER_ADMIN
  );
  if (!quotation) throw new AppError("Cotización no encontrada", 404);

  if (user.role !== Role.SUPER_ADMIN) {
    const isMember = quotation.company.userCompanies.some(
      (uc) => uc.userId === user.id
    );
    if (!isMember) {
      throw new AppError("No tienes acceso a esta cotización", 403);
    }
  }

  await repository.deleteQuotation(id);
};


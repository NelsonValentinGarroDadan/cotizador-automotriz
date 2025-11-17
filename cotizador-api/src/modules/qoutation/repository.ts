// backend/src/modules/quotation/repository.ts
import prisma from "../../config/prisma";
import { CreateQuotation, UpdateQuotation } from "./schema";
import { Prisma } from "@prisma/client";

interface QuotationFilters {
  search?: string;
  companyIds?: string[];
  planVersionId?: string;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

export const getAllQuotations = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: QuotationFilters
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.QuotationWhereInput = {};

  if (!filters?.isSuperAdmin) {
    if (filters?.isAdmin) {
      where.company = {
        userCompanies: {
          some: { userId },
        },
      };
    } else {
      where.userId = userId;
    }
  }

  if (filters?.search) {
    where.OR = [
      { clientName: { contains: filters.search } },
      { clientDni: { contains: filters.search } },
    ];
  }

  if (filters?.companyIds && filters.companyIds.length > 0) {
    where.companyId = { in: filters.companyIds };
  }

  if (filters?.planVersionId) {
    where.planVersionId = filters.planVersionId;
  }

  if (filters?.createdAtFrom || filters?.createdAtTo) {
    where.createdAt = {};
    if (filters.createdAtFrom) {
      where.createdAt.gte = new Date(filters.createdAtFrom);
    }
    if (filters.createdAtTo) {
      where.createdAt.lte = new Date(filters.createdAtTo);
    }
  }

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        planVersion: {
          select: {
            id: true,
            version: true,
            isLatest: true,
            plan: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    }),
    prisma.quotation.count({ where }),
  ]);

  return { quotations, total };
};

export const getQuotationById = async (
  id: string,
  userId: string,
  isSuperAdmin?: boolean
) => {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          userCompanies: isSuperAdmin
            ? true
            : {
                where: { userId },
              },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      planVersion: {
        select: {
          id: true,
          version: true,
          isLatest: true,
          desdeMonto: true,
          hastaMonto: true,
          desdeCuota: true,
          hastaCuota: true,
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
            },
          },
          coefficients: {
            orderBy: { plazo: "asc" },
            include: {
              cuotaBalonMonths: {
                orderBy: { month: "asc" },
              },
            },
          },
        },
      },
    },
  });
};

export const createQuotation = async (
  data: CreateQuotation & { userId: string }
) => {
  return prisma.quotation.create({
    data: {
      planVersionId: data.planVersionId,
      companyId: data.companyId,
      userId: data.userId,
      clientName: data.clientName,
      clientDni: data.clientDni,
      vehicleData: data.vehicleData,
      totalValue: data.totalValue,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      planVersion: {
        select: {
          id: true,
          version: true,
          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const updateQuotation = async (
  id: string,
  data: UpdateQuotation
) => {
  return prisma.quotation.update({
    where: { id },
    data: {
      ...(data.clientName !== undefined && { clientName: data.clientName }),
      ...(data.clientDni !== undefined && { clientDni: data.clientDni }),
      ...(data.vehicleData !== undefined && { vehicleData: data.vehicleData }),
      ...(data.totalValue !== undefined && { totalValue: data.totalValue }),
      ...(data.companyId !== undefined && { companyId: data.companyId }),
      ...(data.planVersionId !== undefined && { planVersionId: data.planVersionId }),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      planVersion: {
        select: {
          id: true,
          version: true,
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

export const deleteQuotation = async (id: string) => {
  return prisma.quotation.delete({
    where: { id },
  });
};


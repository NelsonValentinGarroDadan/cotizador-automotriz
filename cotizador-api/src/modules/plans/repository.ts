// backend/src/modules/plan/repository.ts
import prisma from "../../config/prisma";
import { CreatePlan, UpdatePlan } from "./schema";
import { Prisma } from "@prisma/client";

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
  filters?: PlanFilters,
  isAdmin?: boolean,
  isSuperAdmin?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.PlanWhereInput = {};

  if (!isSuperAdmin) {
    where.companies = {
      some: {
        active: true,
        ...(isAdmin
          ? { userCompanies: { some: { userId } } }
          : {}),
      },
    };
    if (!isAdmin) {
      // USER: solo planes permitidos explicitamente
      where.allowedUsers = { some: { id: userId } };
    }
  }

  if (!filters?.includeInactive) where.active = true;

  if (filters?.name) {
    where.name = { contains: filters.name };
  }

  if (filters?.companyIds && filters.companyIds.length > 0) {
    where.companies = isSuperAdmin
      ? { some: { id: { in: filters.companyIds } } }
      : { some: { id: { in: filters.companyIds }, active: true } };
  }

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        companies: { select: { id: true, name: true, logo: true } },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        versions: {
          where: { isLatest: true },
          include: {
            coefficients: {
              include: {
                cuotaBalonMonths: { orderBy: { month: "asc" } },
              },
              orderBy: { plazo: "asc" },
            },
          },
        },
        allowedUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.plan.count({ where }),
  ]);

  return { plans, total };
};

export const getPlanById = async (
  id: string,
  userId: string,
  isSuperAdmin?: boolean
) => {
  const where: Prisma.PlanWhereUniqueInput = { id };

  // El filtro por compañias se aplica despues via companies.userCompanies,
  // por lo que aqui solo controlamos la carga de relaciones.
  return prisma.plan.findUnique({
    where,
    include: {
      companies: {
        include: isSuperAdmin
          ? {
              userCompanies: true,
            }
          : {
              userCompanies: { where: { userId } },
            },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      versions: {
        orderBy: { version: "desc" },
        take: 5,
        include: {
          coefficients: {
            include: {
              cuotaBalonMonths: {
                orderBy: { month: "asc" },
              },
            },
            orderBy: { plazo: "asc" },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      allowedUsers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: { select: { versions: true } },
    },
  });
};

export const createPlan = async (
  data: CreatePlan & {
    logo?: string;
    userId: string;
    companyIds: string[];
    allowedUserIds?: string[];
  }
) => {
  const allowedUserIdsWithCreator = [
    ...(data.allowedUserIds || []),
    data.userId,
  ].filter((value, index, self) => self.indexOf(value) === index);

  return prisma.plan.create({
    data: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      createdById: data.userId,
      companies: { connect: data.companyIds.map((id) => ({ id })) },
      allowedUsers: {
        connect: allowedUserIdsWithCreator.map((id) => ({ id })),
      },
    },
    include: {
      companies: { select: { id: true, name: true } },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      allowedUsers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & {
    logo?: string;
    companyIds?: string[];
    allowedUserIds?: string[];
  }
) => {
  return prisma.plan.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.logo && { logo: data.logo }),
      ...(data.companyIds && {
        companies: {
          set: data.companyIds.map((cid) => ({ id: cid })),
        },
      }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.allowedUserIds && {
        allowedUsers: {
          set: data.allowedUserIds.map((uid) => ({ id: uid })),
        },
      }),
    },
    include: {
      companies: { select: { id: true, name: true } },
    },
  });
};

export const deletePlan = async (id: string) => {
  return prisma.plan.update({
    where: { id },
    data: { active: false },
  });
};

export const createPlanVersion = async (data: {
  planId: string;
  createdById: string;
  version: number;
  desdeMonto?: number;
  hastaMonto?: number;
  desdeCuota?: number;
  hastaCuota?: number;
  coefficients: any[];
}) => {
  await prisma.planVersion.updateMany({
    where: { planId: data.planId },
    data: { isLatest: false },
  });

  return prisma.planVersion.create({
    data: {
      planId: data.planId,
      createdById: data.createdById,
      version: data.version,
      isLatest: true,
      desdeMonto: data.desdeMonto,
      hastaMonto: data.hastaMonto,
      desdeCuota: data.desdeCuota,
      hastaCuota: data.hastaCuota,
      coefficients: {
        create: data.coefficients.map((c) => ({
          plazo: c.plazo,
          tna: c.tna,
          coeficiente: c.coeficiente,
          quebrantoFinanciero: c.quebrantoFinanciero ?? 0,
          cuotaBalon: c.cuotaBalon ?? null,
          cuotaPromedio: c.cuotaPromedio ?? null,
          cuotaBalonMonths: {
            create: (c.cuotaBalonMonths ?? []).map((m: number) => ({
              month: m,
            })),
          },
        })),
      },
    },
    include: {
      coefficients: {
        include: {
          cuotaBalonMonths: true,
        },
      },
    },
  });
};

export const getLastVersionNumber = async (planId: string) => {
  const last = await prisma.planVersion.findFirst({
    where: { planId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  return last?.version || 0;
};

import prisma from "../../config/prisma";
import { CreatePlan, UpdatePlan } from "./schema";

export const getAllPlans = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string }
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    companies: {
      some: {
        userCompanies: { some: { userId } },
      },
    },
  };

  if (filters?.name) where.name = { contains: filters.name };

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        companies: { select: { id: true, name: true, logo: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { versions: true } },
      },
    }),
    prisma.plan.count({ where }),
  ]);

  return { plans, total };
};

export const getPlanById = async (id: string, userId: string) => {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      companies: {
        include: {
          userCompanies: { where: { userId } },
        },
      },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 5,
        select: {
          id: true,
          version: true,
          isLatest: true,
          createdAt: true,
          createdBy: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { versions: true } },
    },
  });
};

export const createPlan = async (
  data: CreatePlan & { logo?: string; userId: string; companyIds: string[] }
) => {
  return prisma.plan.create({
    data: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      createdById: data.userId,
      companies: { connect: data.companyIds.map((id) => ({ id })) },
    },
    include: {
      companies: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & { logo?: string; companyIds?: string[] }
) => {
  return prisma.plan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      ...(data.companyIds && {
        companies: {
          set: data.companyIds.map((id) => ({ id })),
        },
      }),
    },
    include: {
      companies: { select: { id: true, name: true } },
    },
  });
};

export const deletePlan = async (id: string) => {
  return prisma.plan.delete({ where: { id } });
};

export const createPlanVersion = async (data: {
  planId: string;
  createdById: string;
  version: number;
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
      coefficients: {
        create: data.coefficients.map((c) => ({
          plazo: c.plazo,
          tna: c.tna,
          coeficiente: c.coeficiente,
          quebrantoFinanciero: c.quebrantoFinanciero ?? 0,
          cuotaBalon6M: c.cuotaBalon6M,
          cuotaBalon12M: c.cuotaBalon12M,
          cuotaBalon18M: c.cuotaBalon18M,
          cuotaBalon24M: c.cuotaBalon24M,
          cuotaBalon30M: c.cuotaBalon30M,
          cuotaBalon36M: c.cuotaBalon36M,
          cuotaBalon42M: c.cuotaBalon42M,
          cuotaBalon48M: c.cuotaBalon48M,
          cuotaPromedio: c.cuotaPromedio,
        })),
      },
    },
  });
};

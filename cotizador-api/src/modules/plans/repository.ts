// backend/src/modules/plan/repository.ts
import prisma from "../../config/prisma";
import { CreatePlan, UpdatePlan } from "./schema";
import { Prisma } from "@prisma/client";

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
) => {
  const skip = (page - 1) * limit;

  // Usuario solo ve planes de sus compañías
  const where: Prisma.PlanWhereInput = {
    company: {
      userCompanies: {
        some: { userId },
      },
    },
  };

  if (filters?.name) {
    where.name = { contains: filters.name  };
  }
  
  if (filters?.companyId) {
    where.companyId = filters.companyId;
  }
  
  if (filters?.createdAtFrom) {
    where.createdAt = { gte: new Date(filters.createdAtFrom) };
  }

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
    }),
    prisma.plan.count({ where }),
  ]);

  return { plans, total };
};

export const getPlanById = async (id: string) => {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          userCompanies: {
            include: {
              user: { select: { id: true, role: true } },
            },
          },
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
        orderBy: { version: 'desc' },
        take: 5, // Últimas 5 versiones
        select: {
          id: true,
          version: true,
          isLatest: true,
          createdAt: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          versions: true,
        },
      },
    },
  });
};

export const createPlan = async (
  data: CreatePlan & { logo?: string; userId: string }
) => {
  return prisma.plan.create({
    data: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      companyId: data.companyId,
      createdById: data.userId,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

export const updatePlan = async (
  id: string,
  data: Omit<UpdatePlan, "id"> & { logo?: string }
) => {
  return prisma.plan.update({
    where: { id },
    data,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deletePlan = async (id: string) => {
  return prisma.plan.delete({ where: { id } });
};
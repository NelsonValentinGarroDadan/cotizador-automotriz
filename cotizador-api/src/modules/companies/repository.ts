import prisma from "../../config/prisma";
import { CreateCompany, UpdateCompany } from "./schema";

export const getAllCompanies = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string; createdAtFrom?: Date },
  isSuperAdmin?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  if (!isSuperAdmin) {
    where.userCompanies = { some: { userId } };
  }

  if (filters?.name) where.name = { contains: filters.name };
  if (filters?.createdAtFrom) {
    where.createdAt = { gte: new Date(filters.createdAtFrom) };
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        userCompanies: {
          select: { user: { select: { role: true } } },
        },
        vehicles: {
          select: {
            idversion: true,
            descrip: true,
            nueva_descrip: true,
            codigo: true,
            marca: {
              select: {
                idmarca: true,
                descrip: true,
              },
            },
            modelo: {
              select: {
                idmodelo: true,
                descrip: true,
              },
            },
          },
        }
      },
    }),
    prisma.company.count({ where }),
  ]);

  const roleStats: Record<string, number> = { ADMIN: 0, USER: 0 };
  companies.forEach((c) => {
    c.userCompanies.forEach((uc) => {
      const role = uc.user.role;
      if (role === "ADMIN" || role === "USER") {
        roleStats[role] = (roleStats[role] || 0) + 1;
      }
    });
  });

  return { companies, total, roleStats };
};

export const getCompanyById = async (id: string) => {
  return prisma.company.findUnique({
    where: { id },
    include: {
      userCompanies: {
        include: {
          user: { select: { id: true, role: true } },
        },
      },
      vehicles: {
        select: {
          idversion: true,
          descrip: true,
          nueva_descrip: true,
          codigo: true,
          marca: {
            select: {
              idmarca: true,
              descrip: true,
            },
          },
          modelo: {
            select: {
              idmodelo: true,
              descrip: true,
            },
          },
        },
      },
    },
  });
};

// Crear la empresa + relacion con el creador
export const createCompany = async (
  data: CreateCompany & { logo?: string; userId: string }
) => {
  return prisma.company.create({
    data: {
      name: data.name,
      logo: data.logo,
      userCompanies: {
        create: {
          userId: data.userId,
        },
      },
    },
  });
};

export const updateCompany = async (
  id: string,
  data: Omit<UpdateCompany, "id"> & { logo?: string }
) => {
  return prisma.company.update({
    where: { id },
    data,
  });
};

export const deleteCompany = async (id: string) => {
  return prisma.company.delete({ where: { id } });
};

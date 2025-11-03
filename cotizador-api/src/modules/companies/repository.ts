import { Company } from "@prisma/client";
import prisma from "../../config/prisma";
import { calculatePagination } from "../../utils/pagination";
import { CreateCompany, UpdateCompany } from "./schema";

export const getAllCompanies = async (
  userId: string,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: { name?: string; active?: boolean }
) => {
  const skip = (page - 1) * limit;

  const where: any = { ownerId: userId };
  if (filters?.name) where.name = { contains: filters.name, mode: "insensitive" };
  if (filters?.active !== undefined) where.active = filters.active;

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        userCompanies: { select: { user: { select: { role: true } } } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  // Estadísticas de roles
  const roleStats = { ADMIN: 0, USER: 0 };
  companies.forEach((c) => {
    c.userCompanies.forEach((uc) => {
      roleStats[uc.user.role] = (roleStats[uc.user.role] || 0) + 1;
    });
  });

  return { companies, total, roleStats };
};

export const getCompanyById = async (id: string) => {
  return prisma.company.findUnique({ where: { id } });
};

export const createCompany = async (data: CreateCompany & { logo?: string }) => {
  return prisma.company.create({ data });
};

export const updateCompany = async (id: string, data: Omit<UpdateCompany, "id"> & { logo?: string }) => {
  return prisma.company.update({ where: { id }, data });
};

export const deleteCompany = async (id: string) => {
  return prisma.company.delete({ where: { id } });
};

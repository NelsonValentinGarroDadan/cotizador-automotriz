import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { calculatePagination } from "../../utils/pagination";
import { CreateUser, UpdateUser } from "./schema";

interface UserFilters {
  search?: string;
  role?: string;
  companyIds?: string[];
  fechaCreacion?: string;
}

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  companies: {
    select: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  },
} as const;

export const getAllUsers = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: UserFilters
) => {
  const { skip, take } = calculatePagination(page, limit);

  const where: Prisma.UserWhereInput = {};

  // 🔍 Filtro por búsqueda
  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  // 🎭 Filtro por rol
  if (filters?.role) {
    where.role = filters.role as any;
  }

  // 📅 Filtro por fecha de creación
  if (filters?.fechaCreacion) {
    where.createdAt = {
      gte: new Date(filters.fechaCreacion),
    };
  }

  // 🏢 Filtro por compañías asociadas
  if (filters?.companyIds && filters.companyIds.length > 0) {
    where.companies = {
      some: {
        companyId: { in: filters.companyIds },
      },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: userSelect,
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

export const getUserById = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

export const getUserByEmail = async (email: string) =>
  prisma.user.findUnique({ where: { email } });

export const createUser = async (data: CreateUser & { companyIds?: string[] }) => {
  const { companyIds, ...rest } = data;

  return prisma.user.create({
    data: {
      ...rest,
      companies: companyIds?.length
        ? {
            create: companyIds.map((id) => ({
              company: { connect: { id } },
            })),
          }
        : undefined,
    },
    select: userSelect,
  });
};

export const updateUser = async (id: string, data: UpdateUser & { companyIds?: string[] }) => {
  const { companyIds, ...rest } = data;

  return prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(companyIds
        ? {
            companies: {
              deleteMany: {}, // borra las relaciones previas
              create: companyIds.map((cid) => ({
                company: { connect: { id: cid } },
              })),
            },
          }
        : {}),
    },
    select: userSelect,
  });
};

export const deleteUser = async (id: string) => prisma.user.delete({ where: { id } });

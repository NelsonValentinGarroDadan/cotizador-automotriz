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
  password: false,  
  ownedCompanies: {
    select: {
      id: true,
      name: true,
      logo: true,
    },
  },
  companies: {
    select: {
      id: true,
      companyId: true,
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
  sortOrder: 'asc' | 'desc',
  filters?: UserFilters
) => {
  const { skip, take } = calculatePagination(page, limit);
  
  // Construir el where dinámicamente
  const where: Prisma.UserWhereInput = {};
  
  // Filtro por búsqueda (nombre, apellido o email)
  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }
  
  // Filtro por rol
  if (filters?.role) {
    where.role = filters.role as any;
  }
  
  // Filtro por fecha de creación
  if (filters?.fechaCreacion) {
    where.createdAt = {
      gte: new Date(filters.fechaCreacion),
    };
  }
  
  // Filtro por compañías asignadas
  if (filters?.companyIds && filters.companyIds.length > 0) {
    where.ownedCompanies = {
      some: {
        id: { in: filters.companyIds },
      },
    };
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: userSelect, // ✅ Solo select
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

export const getUserById = async (id: string) => (
    await prisma.user.findUnique({ 
        where: { id },
        select: userSelect
    })
);

export const getUserByEmail = async (email: string) => await prisma.user.findUnique({ where: { email }});

export const createUser = async (data: CreateUser) => (
    await prisma.user.create({ 
        data ,
        select: userSelect
    })
); 

export const updateUser = async (id: string, data: UpdateUser) => (
    await prisma.user.update({ 
        where: { id }, 
        data,
        select: userSelect  
    })
);

export const deleteUser = async (id:string) => await prisma.user.delete({ where: { id } });
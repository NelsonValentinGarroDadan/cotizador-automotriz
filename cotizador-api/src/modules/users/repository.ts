import prisma from "../../config/prisma";
import { calculatePagination } from "../../utils/pagination";
import { CreateUser, UpdateUser } from "./schema";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const getAllUsers = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) => {
  const { skip, take, } = calculatePagination(page, limit);
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: userSelect,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count(),
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
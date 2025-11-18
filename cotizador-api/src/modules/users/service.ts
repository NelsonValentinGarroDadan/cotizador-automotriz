import prisma from "../../config/prisma";
import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import * as repository from "./repository";
import { CreateUser, UpdateUser } from "./schema";
import bcrypt from "bcrypt";
import { UserToken } from "../../core/types/userToken";
import { Role } from "../../core/types/role";

interface UserFilters {
  search?: string;
  role?: string;
  companyIds?: string[];
  fechaCreacion?: string;
}

export const getAllUsers = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  filters?: UserFilters
): Promise<PaginatedResponse<any>> => {
  // SUPER_ADMIN: sin restricción por compañías
  if (user.role === Role.SUPER_ADMIN) {
    const { users, total } = await repository.getAllUsers(
      page,
      limit,
      sortBy,
      sortOrder,
      filters
    );
    return createPaginatedResponse(users, total, page, limit);
  }

  // ADMIN (u otros roles): limitar a sus compañías
  if (user.role === Role.ADMIN) {
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: user.id },
      select: { companyId: true },
    });

    const adminCompanyIds = userCompanies.map((uc) => uc.companyId);

    // Si no tiene compañías asociadas, no puede ver usuarios
    if (adminCompanyIds.length === 0) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const requestedCompanyIds = filters?.companyIds;
    const effectiveCompanyIds = requestedCompanyIds
      ? requestedCompanyIds.filter((id) => adminCompanyIds.includes(id))
      : adminCompanyIds;

    if (effectiveCompanyIds.length === 0) {
      return createPaginatedResponse([], 0, page, limit);
    }

    const { users, total } = await repository.getAllUsers(page, limit, sortBy, sortOrder, {
      ...filters,
      // Un ADMIN solo ve usuarios de rol USER
      role: "USER",
      companyIds: effectiveCompanyIds,
    });

    return createPaginatedResponse(users, total, page, limit);
  }

  // Usuarios finales no deberían listar otros usuarios
  throw new AppError("No tienes permisos para listar usuarios", 403);
};
export const getUserById = async (id: string, currentUser: UserToken) => {
  const user = await repository.getUserById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);

  // Un ADMIN no puede ver datos de otros ADMIN o SUPER_ADMIN
  if (
    currentUser.role === Role.ADMIN &&
    (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN)
  ) {
    throw new AppError("No tienes permisos para ver este usuario", 403);
  }

  return user;
};

export const createUser = async (
  data: CreateUser & { companyIds?: string[] },
  currentUser: UserToken
) => {
  const existingUser = await repository.getUserByEmail(data.email);
  if (existingUser) throw new AppError("Este email ya está en uso", 400);
  
  // Solo SUPER_ADMIN puede crear SUPER_ADMIN o ADMIN
  if (
    (data.role === Role.SUPER_ADMIN || data.role === Role.ADMIN) &&
    currentUser.role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(
      "Solo un SUPER_ADMIN puede crear usuarios ADMIN o SUPER_ADMIN",
      403
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  data.password = hashedPassword;

  return await repository.createUser(data);
};

export const updateUser = async (
  id: string,
  data: UpdateUser & { companyIds?: string[] },
  currentUser: UserToken
) => {
  const existingUser = await repository.getUserById(id);
  if (!existingUser) throw new AppError("Usuario no encontrado", 404);

  // ADMIN solo puede modificar usuarios de rol USER
  if (
    currentUser.role === Role.ADMIN &&
    (existingUser.role === Role.ADMIN || existingUser.role === Role.SUPER_ADMIN)
  ) {
    throw new AppError(
      "Solo un SUPER_ADMIN puede modificar usuarios ADMIN o SUPER_ADMIN",
      403
    );
  }

  // ADMIN no puede cambiar el rol a ADMIN o SUPER_ADMIN
  if (
    currentUser.role === Role.ADMIN &&
    (data.role === Role.ADMIN || data.role === Role.SUPER_ADMIN)
  ) {
    throw new AppError(
      "Solo un SUPER_ADMIN puede asignar rol ADMIN o SUPER_ADMIN",
      403
    );
  }
  
  if (data.allowedPlanIds) {
    const invalidPlans = await prisma.plan.findMany({
      where: {
        id: { in: data.allowedPlanIds },
        companies: {
          none: {
            userCompanies: {
              some: { userId: id }
            }
          }
        }
      }
    });

    if (invalidPlans.length > 0) {
      throw new AppError("Intentas asignar planes de compañías no asociadas al usuario", 403);
    }
  }

  if (data.password) data.password = await bcrypt.hash(data.password, 10);

  return await repository.updateUser(id, data);
};

export const deleteUser = async (id: string, currentUser: UserToken) => {
  const existingUser = await repository.getUserById(id);
  if (!existingUser) throw new AppError("Usuario no encontrado", 404);

  // ADMIN solo puede eliminar usuarios de rol USER
  if (
    currentUser.role === Role.ADMIN &&
    (existingUser.role === Role.ADMIN || existingUser.role === Role.SUPER_ADMIN)
  ) {
    throw new AppError(
      "Solo un SUPER_ADMIN puede eliminar usuarios ADMIN o SUPER_ADMIN",
      403
    );
  }

  await repository.deleteUser(id);
};

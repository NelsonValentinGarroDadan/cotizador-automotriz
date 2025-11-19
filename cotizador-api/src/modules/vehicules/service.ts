import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import { UserToken } from "../../core/types/userToken";
import { Role } from "../../core/types/role";
import * as repository from "./repository";
import {
  CreateBrandInput,
  CreateLineInput,
  CreateModelInput,
  CreateVehicleVersionInput,
  GetVehiclesQuery,
  UpdateBrandInput,
  UpdateLineInput,
  UpdateModelInput,
  UpdateVehicleVersionInput,
} from "./schema";
import prisma from "../../config/prisma";

const getAdminCompanyIds = async (userId: string): Promise<string[]> => {
  const userCompanies = await prisma.userCompany.findMany({
    where: { userId },
    select: { companyId: true },
  });
  return userCompanies.map((uc) => uc.companyId);
};

export const getVersionById = async (
  user: UserToken,
  idversion: number
) => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  const version = await repository.getVersionById(
    idversion,
    companyIds,
    isSuperAdmin
  );

  if (!version) {
    throw new AppError("Version de vehiculo no encontrada", 404);
  }

  return version;
};

export const getBrands = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: GetVehiclesQuery
): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) {
    return createPaginatedResponse([], 0, page, limit);
  }

  const { items, total } = await repository.getBrands(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    isSuperAdmin,
    companyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
};

// Brands CRUD
export const createBrand = async (
  user: UserToken,
  data: CreateBrandInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para crear marcas", 403);
  }

  return repository.createBrand({
    descrip: data.descrip,
    logo: data.logo,
    codigo: data.codigo,
  });
};

export const updateBrand = async (
  user: UserToken,
  idmarca: number,
  data: UpdateBrandInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para editar marcas", 403);
  }

  const existing = await prisma.autosMarca.findUnique({
    where: { idmarca },
    include: {
      versiones: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!existing) {
    throw new AppError("Marca no encontrada", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.versiones.flatMap((v) => v.company.map((c) => c.id))
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para editar esta marca",
        403
      );
    }
  }

  return repository.updateBrand(idmarca, data);
};

export const deleteBrand = async (user: UserToken, idmarca: number) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para eliminar marcas", 403);
  }

  const existing = await prisma.autosMarca.findUnique({
    where: { idmarca },
    include: {
      versiones: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!existing) {
    throw new AppError("Marca no encontrada", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.versiones.flatMap((v) => v.company.map((c) => c.id))
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para eliminar esta marca",
        403
      );
    }
  }

  await repository.deleteBrand(idmarca);
};

export const getLines = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: GetVehiclesQuery
): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) {
    return createPaginatedResponse([], 0, page, limit);
  }

  const { items, total } = await repository.getLines(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    isSuperAdmin,
    companyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
};

// Lines CRUD
export const createLine = async (
  user: UserToken,
  data: CreateLineInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para crear líneas", 403);
  }

  return repository.createLine({
    brandId: data.brandId,
    descrip: data.descrip,
  });
};

export const updateLine = async (
  user: UserToken,
  idlinea: number,
  data: UpdateLineInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para editar líneas", 403);
  }

  const existing = await prisma.autosLinea.findUnique({
    where: { idlinea },
    include: {
      modelos: {
        include: {
          versiones: {
            include: { company: true },
          },
        },
      },
    },
  });

  if (!existing) {
    throw new AppError("Línea no encontrada", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.modelos.flatMap((m) =>
        m.versiones.flatMap((v) => v.company.map((c) => c.id))
      )
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para editar esta línea",
        403
      );
    }
  }

  return repository.updateLine(idlinea, {
    descrip: data.descrip,
    brandId: data.brandId,
  });
};

export const deleteLine = async (user: UserToken, idlinea: number) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para eliminar líneas", 403);
  }

  const existing = await prisma.autosLinea.findUnique({
    where: { idlinea },
    include: {
      modelos: {
        include: {
          versiones: {
            include: { company: true },
          },
        },
      },
    },
  });

  if (!existing) {
    throw new AppError("Línea no encontrada", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.modelos.flatMap((m) =>
        m.versiones.flatMap((v) => v.company.map((c) => c.id))
      )
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para eliminar esta línea",
        403
      );
    }
  }

  await repository.deleteLine(idlinea);
};

export const getModels = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: GetVehiclesQuery
): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) {
    return createPaginatedResponse([], 0, page, limit);
  }

  const { items, total } = await repository.getModels(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    lineId: filters?.lineId,
    isSuperAdmin,
    companyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
};

// Models CRUD
export const createModel = async (
  user: UserToken,
  data: CreateModelInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para crear modelos", 403);
  }

  return repository.createModel({
    brandId: data.brandId,
    lineId: data.lineId,
    descrip: data.descrip,
  });
};

export const updateModel = async (
  user: UserToken,
  idmodelo: number,
  data: UpdateModelInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para editar modelos", 403);
  }

  const existing = await prisma.autosModelo.findUnique({
    where: { idmodelo },
    include: {
      versiones: {
        include: { company: true },
      },
    },
  });

  if (!existing) {
    throw new AppError("Modelo no encontrado", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.versiones.flatMap((v) => v.company.map((c) => c.id))
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para editar este modelo",
        403
      );
    }
  }

  return repository.updateModel(idmodelo, {
    descrip: data.descrip,
    brandId: data.brandId,
    lineId: data.lineId,
  });
};

export const deleteModel = async (user: UserToken, idmodelo: number) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para eliminar modelos", 403);
  }

  const existing = await prisma.autosModelo.findUnique({
    where: { idmodelo },
    include: {
      versiones: {
        include: { company: true },
      },
    },
  });

  if (!existing) {
    throw new AppError("Modelo no encontrado", 404);
  }

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.versiones.flatMap((v) => v.company.map((c) => c.id))
    );

    const hasCompany = [...versionCompanyIds].some((id) =>
      adminCompanyIds.includes(id)
    );

    if (!hasCompany) {
      throw new AppError(
        "No tienes permisos para eliminar este modelo",
        403
      );
    }
  }

  await repository.deleteModel(idmodelo);
};

export const getVersions = async (
  user: UserToken,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: GetVehiclesQuery
): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) {
    return createPaginatedResponse([], 0, page, limit);
  }

  const { items, total } = await repository.getVersions(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    modelId: filters?.modelId,
    isSuperAdmin,
    companyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
}; 

export const createVersion = async (
  user: UserToken,
  data: CreateVehicleVersionInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para crear vehículos", 403);
  }

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const adminCompanyIds = !isSuperAdmin
    ? await getAdminCompanyIds(user.id)
    : undefined;

  if (!isSuperAdmin) {
    const invalidCompanies = data.companyIds.filter(
      (id) => !adminCompanyIds?.includes(id)
    );
    if (invalidCompanies.length > 0) {
      throw new AppError(
        "Intentas asociar vehículos a compañías que no están a tu cargo",
        403
      );
    }
  }

  return repository.createVersion({
    brandId: data.brandId,
    modelId: data.modelId,
    descrip: data.descrip,
    nueva_descrip: data.nueva_descrip,
    codigo: data.codigo,
    companyIds: data.companyIds,
  });
};

export const updateVersion = async (
  user: UserToken,
  idversion: number,
  data: UpdateVehicleVersionInput
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para editar vehículos", 403);
  }

  const existing = await prisma.autosVersion.findUnique({
    where: { idversion },
    include: { company: true },
  });

  if (!existing) {
    throw new AppError("Versión de vehículo no encontrada", 404);
  }

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;

  if (!isSuperAdmin) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const currentCompanyIds = existing.company.map((c) => c.id);

    if (!currentCompanyIds.some((id) => adminCompanyIds.includes(id))) {
      throw new AppError(
        "No tienes permisos para editar esta versión de vehículo",
        403
      );
    }

    if (data.companyIds) {
      const invalidCompanies = data.companyIds.filter(
        (id) => !adminCompanyIds.includes(id)
      );
      if (invalidCompanies.length > 0) {
        throw new AppError(
          "Intentas asociar vehículos a compañías que no están a tu cargo",
          403
        );
      }
    }
  }

  return repository.updateVersion(idversion, data);
};

export const deleteVersion = async (
  user: UserToken,
  idversion: number
) => {
  if (user.role === Role.USER) {
    throw new AppError("No tienes permisos para eliminar vehículos", 403);
  }

  const existing = await prisma.autosVersion.findUnique({
    where: { idversion },
    include: { company: true },
  });

  if (!existing) {
    throw new AppError("Versión de vehículo no encontrada", 404);
  }

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;

  if (!isSuperAdmin) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const currentCompanyIds = existing.company.map((c) => c.id);

    if (!currentCompanyIds.some((id) => adminCompanyIds.includes(id))) {
      throw new AppError(
        "No tienes permisos para eliminar esta versión de vehículo",
        403
      );
    }
  }

  await repository.deleteVersion(idversion);
};

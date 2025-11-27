import { AppError } from "../../core/errors/appError";
import { createPaginatedResponse, PaginatedResponse } from "../../utils/pagination";
import { UserToken } from "../../core/types/userToken";
import { Role } from "../../core/types/role";
import * as repository from "./repository";
import { CreateBrandInput, CreateLineInput, CreateVehicleVersionInput, GetVehiclesQuery, UpdateBrandInput, UpdateLineInput, UpdateVehicleVersionInput } from "./schema";
import prisma from "../../config/prisma";

const getAdminCompanyIds = async (userId: string): Promise<string[]> => {
  const userCompanies = await prisma.userCompany.findMany({ where: { userId }, select: { companyId: true } });
  return userCompanies.map((uc) => uc.companyId);
};

export const getVersionById = async (user: UserToken, idversion: number) => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds = !isSuperAdmin && user.role === Role.ADMIN ? await getAdminCompanyIds(user.id) : undefined;
  const version = await repository.getVersionById(idversion, companyIds, isSuperAdmin);
  if (!version) throw new AppError("Version de vehiculo no encontrada", 404);
  return version;
};

export const getBrands = async (user: UserToken, page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: GetVehiclesQuery): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds = !isSuperAdmin && user.role === Role.ADMIN ? await getAdminCompanyIds(user.id) : undefined;
  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) return createPaginatedResponse([], 0, page, limit);

  const { items, total } = await repository.getBrands(page, limit, sortBy, sortOrder, { search: filters?.search, isSuperAdmin, companyIds });
  return createPaginatedResponse(items, total, page, limit);
};

export const createBrand = async (user: UserToken, data: CreateBrandInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para crear marcas", 403);
  return repository.createBrand({ descrip: data.descrip });
};

export const updateBrand = async (user: UserToken, idmarca: number, data: UpdateBrandInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para editar marcas", 403);

  const existing = await prisma.autosMarca.findUnique({
    where: { idmarca },
    include: {
      lineas: {
        include: {
          versiones: { include: { company: true } },
        },
      },
    },
  });
  if (!existing) throw new AppError("Marca no encontrada", 404);

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.lineas.flatMap((linea) => linea.versiones.flatMap((v) => v.company.map((c) => c.id))),
    );
    const hasCompany = [...versionCompanyIds].some((id) => adminCompanyIds.includes(id));
    if (!hasCompany) throw new AppError("No tienes permisos para editar esta marca", 403);
  }

  return repository.updateBrand(idmarca, data);
};

export const deleteBrand = async (user: UserToken, idmarca: number) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para eliminar marcas", 403);

  const existing = await prisma.autosMarca.findUnique({
    where: { idmarca },
    include: {
      lineas: {
        include: {
          versiones: { include: { company: true } },
        },
      },
    },
  });
  if (!existing) throw new AppError("Marca no encontrada", 404);

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(
      existing.lineas.flatMap((linea) => linea.versiones.flatMap((v) => v.company.map((c) => c.id))),
    );
    const hasCompany = [...versionCompanyIds].some((id) => adminCompanyIds.includes(id));
    if (!hasCompany) throw new AppError("No tienes permisos para eliminar esta marca", 403);
  }

  await repository.deleteBrand(idmarca);
};

export const getLines = async (user: UserToken, page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: GetVehiclesQuery): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const companyIds = !isSuperAdmin && user.role === Role.ADMIN ? await getAdminCompanyIds(user.id) : undefined;
  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) return createPaginatedResponse([], 0, page, limit);

  const { items, total } = await repository.getLines(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    isSuperAdmin,
    companyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
};

export const createLine = async (user: UserToken, data: CreateLineInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para crear lineas", 403);
  return repository.createLine({ brandId: data.brandId, descrip: data.descrip });
};

export const updateLine = async (user: UserToken, idlinea: number, data: UpdateLineInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para editar lineas", 403);

  const existing = await prisma.autosLinea.findUnique({ where: { idlinea }, include: { versiones: { include: { company: true } } } });
  if (!existing) throw new AppError("Linea no encontrada", 404);

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(existing.versiones.flatMap((v) => v.company.map((c) => c.id)));
    const hasCompany = [...versionCompanyIds].some((id) => adminCompanyIds.includes(id));
    if (!hasCompany) throw new AppError("No tienes permisos para editar esta linea", 403);
  }

  return repository.updateLine(idlinea, { descrip: data.descrip, brandId: data.brandId });
};

export const deleteLine = async (user: UserToken, idlinea: number) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para eliminar lineas", 403);

  const existing = await prisma.autosLinea.findUnique({ where: { idlinea }, include: { versiones: { include: { company: true } } } });
  if (!existing) throw new AppError("Linea no encontrada", 404);

  if (user.role === Role.ADMIN) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const versionCompanyIds = new Set(existing.versiones.flatMap((v) => v.company.map((c) => c.id)));
    const hasCompany = [...versionCompanyIds].some((id) => adminCompanyIds.includes(id));
    if (!hasCompany) throw new AppError("No tienes permisos para eliminar esta linea", 403);
  }

  await repository.deleteLine(idlinea);
};

export const getVersions = async (user: UserToken, page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: GetVehiclesQuery): Promise<PaginatedResponse<any>> => {
  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  let companyIds = !isSuperAdmin && user.role === Role.ADMIN ? await getAdminCompanyIds(user.id) : undefined;
  const companyIdFilter = filters?.companyId;

  if (!isSuperAdmin && companyIdFilter) {
    companyIds = (companyIds || []).filter((id) => id === companyIdFilter);
  }
  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) return createPaginatedResponse([], 0, page, limit);

  const effectiveCompanyIds = isSuperAdmin ? (companyIdFilter ? [companyIdFilter] : undefined) : companyIds;
  const { items, total } = await repository.getVersions(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    lineId: filters?.lineId,
    isSuperAdmin,
    companyIds: effectiveCompanyIds,
  });

  return createPaginatedResponse(items, total, page, limit);
};

export const createVersion = async (user: UserToken, data: CreateVehicleVersionInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para crear vehiculos", 403);

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  const adminCompanyIds = !isSuperAdmin ? await getAdminCompanyIds(user.id) : undefined;
  if (!isSuperAdmin) {
    const invalidCompanies = data.companyIds.filter((id) => !adminCompanyIds?.includes(id));
    if (invalidCompanies.length > 0) throw new AppError("Intentas asociar vehiculos a compa¤ias que no estan a tu cargo", 403);
  }

  // Validar compañías activas
  const companies = await prisma.company.findMany({ where: { id: { in: data.companyIds } }, select: { id: true, active: true } });
  const inactive = companies.filter((c) => c.active === false).map((c) => c.id);
  if (inactive.length > 0) throw new AppError("No puedes asociar vehiculos a compañías inactivas", 400);

  const hasExisting = !!data.brandId && !!data.lineId;
  if (hasExisting) {
    return repository.createVersion({ lineId: data.lineId!, descrip: data.descrip, codigo: data.codigo ?? "", companyIds: data.companyIds });
  }

  return prisma.$transaction(async (tx) => {
    const lastBrand = await tx.autosMarca.findFirst({ orderBy: { idmarca: "desc" }, select: { idmarca: true } });
    const newBrandId = (lastBrand?.idmarca ?? 0) + 1;
    const brand = await tx.autosMarca.create({ data: { idmarca: newBrandId, descrip: data.newBrandDescrip ?? data.descrip.substring(0, 50) } });

    const lastLine = await tx.autosLinea.findFirst({ orderBy: { idlinea: "desc" }, select: { idlinea: true } });
    const newLineId = (lastLine?.idlinea ?? 0) + 1;
    const linea = await tx.autosLinea.create({ data: { idlinea: newLineId, idmarca: brand.idmarca, descrip: data.newLineDescrip ?? data.descrip.substring(0, 50) } });

    const lastVersion = await tx.autosVersion.findFirst({ orderBy: { idversion: "desc" }, select: { idversion: true } });
    const newVersionId = (lastVersion?.idversion ?? 0) + 1;

    const version = await tx.autosVersion.create({
      data: {
        idversion: newVersionId,
        idlinea: linea.idlinea,
        descrip: data.descrip,
        codigo: data.codigo ?? "",
        company: { connect: data.companyIds.map((id) => ({ id })) },
      },
    });

    return version;
  });
};

export const updateVersion = async (user: UserToken, idversion: number, data: UpdateVehicleVersionInput) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para editar vehiculos", 403);

  const existing = await prisma.autosVersion.findUnique({ where: { idversion }, include: { company: true, linea: true } });
  if (!existing) throw new AppError("Version de vehiculo no encontrada", 404);

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  if (!isSuperAdmin) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const currentCompanyIds = existing.company.map((c) => c.id);
    if (!currentCompanyIds.some((id) => adminCompanyIds.includes(id))) throw new AppError("No tienes permisos para editar esta version de vehiculo", 403);
    if (data.companyIds) {
      const invalidCompanies = data.companyIds.filter((id) => !adminCompanyIds.includes(id));
      if (invalidCompanies.length > 0) throw new AppError("Intentas asociar vehiculos a compa¤ias que no estan a tu cargo", 403);
    }
  }

  // Validar compañías activas si se modifican
  if (data.companyIds) {
    const companies = await prisma.company.findMany({ where: { id: { in: data.companyIds } }, select: { id: true, active: true } });
    const inactive = companies.filter((c) => c.active === false).map((c) => c.id);
    if (inactive.length > 0) throw new AppError("No puedes asociar vehiculos a compañías inactivas", 400);
  }

  let lineIdToUse = data.lineId ?? existing.idlinea;

  // Permitir crear nueva marca/linea al editar (flujo similar a createVersion)
  if (data.newBrandDescrip && data.newLineDescrip) {
    await prisma.$transaction(async (tx) => {
      const lastBrand = await tx.autosMarca.findFirst({ orderBy: { idmarca: "desc" }, select: { idmarca: true } });
      const newBrandId = (lastBrand?.idmarca ?? 0) + 1;
      await tx.autosMarca.create({ data: { idmarca: newBrandId, descrip: data.newBrandDescrip! } });

      const lastLine = await tx.autosLinea.findFirst({ orderBy: { idlinea: "desc" }, select: { idlinea: true } });
      const newLineId = (lastLine?.idlinea ?? 0) + 1;
      await tx.autosLinea.create({ data: { idlinea: newLineId, idmarca: newBrandId, descrip: data.newLineDescrip! } });

      lineIdToUse = newLineId;
    });
  }

  return repository.updateVersion(idversion, { ...data, lineId: lineIdToUse });
};

export const deleteVersion = async (user: UserToken, idversion: number) => {
  if (user.role === Role.USER) throw new AppError("No tienes permisos para eliminar vehiculos", 403);

  const existing = await prisma.autosVersion.findUnique({ where: { idversion }, include: { company: true, linea: true } });
  if (!existing) throw new AppError("Version de vehiculo no encontrada", 404);

  const isSuperAdmin = user.role === Role.SUPER_ADMIN;
  if (!isSuperAdmin) {
    const adminCompanyIds = await getAdminCompanyIds(user.id);
    const currentCompanyIds = existing.company.map((c) => c.id);
    if (!currentCompanyIds.some((id) => adminCompanyIds.includes(id))) throw new AppError("No tienes permisos para eliminar esta version de vehiculo", 403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.autosVersion.delete({ where: { idversion } });

    // Si la linea queda sin versiones, eliminar linea y potencialmente la marca
    const remainingVersionsForLine = await tx.autosVersion.count({ where: { idlinea: existing.idlinea } });
    if (remainingVersionsForLine === 0) {
      const brandId = existing.linea?.idmarca;
      await tx.autosLinea.delete({ where: { idlinea: existing.idlinea } });

      if (brandId !== undefined) {
        const remainingLinesForBrand = await tx.autosLinea.count({ where: { idmarca: brandId } });
        if (remainingLinesForBrand === 0) {
          await tx.autosMarca.delete({ where: { idmarca: brandId } });
        }
      }
    }
  });
};

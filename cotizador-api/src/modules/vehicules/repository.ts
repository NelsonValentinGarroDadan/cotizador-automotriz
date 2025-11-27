import prisma from "../../config/prisma";
import { calculatePagination } from "../../utils/pagination";

interface BrandFilters {
  search?: string;
  companyIds?: string[];
  isSuperAdmin?: boolean;
}

interface LineFilters extends BrandFilters {
  brandId?: number;
  lineId?: number;
}

interface VersionFilters extends LineFilters {}

const getNextId = async (table: "autosMarca" | "autosLinea" | "autosVersion") => {
  if (table === "autosMarca") {
    const last = await prisma.autosMarca.findFirst({ orderBy: { idmarca: "desc" }, select: { idmarca: true } });
    return (last?.idmarca ?? 0) + 1;
  }
  if (table === "autosLinea") {
    const last = await prisma.autosLinea.findFirst({ orderBy: { idlinea: "desc" }, select: { idlinea: true } });
    return (last?.idlinea ?? 0) + 1;
  }
  const last = await prisma.autosVersion.findFirst({ orderBy: { idversion: "desc" }, select: { idversion: true } });
  return (last?.idversion ?? 0) + 1;
};

export const getBrands = async (page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: BrandFilters) => {
  const { skip, take } = calculatePagination(page, limit);
  const where: any = {};

  if (filters?.search) where.descrip = { contains: filters.search };
  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.lineas = {
      some: {
        versiones: {
          some: {
            company: {
              some: { id: { in: filters.companyIds } },
            },
          },
        },
      },
    };
  }
  if (!filters?.isSuperAdmin) {
    where.lineas = {
      some: {
        versiones: {
          some: {
            company: {
              some: { active: true },
            },
          },
        },
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.autosMarca.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
    prisma.autosMarca.count({ where }),
  ]);

  return { items, total };
};

export const createBrand = async (data: { descrip: string }) => {
  const idmarca = await getNextId("autosMarca");
  return prisma.autosMarca.create({ data: { idmarca, descrip: data.descrip } });
};

export const updateBrand = async (idmarca: number, data: { descrip?: string }) => {
  return prisma.autosMarca.update({ where: { idmarca }, data: { ...(data.descrip !== undefined && { descrip: data.descrip }) } });
};

export const deleteBrand = async (idmarca: number) => prisma.autosMarca.delete({ where: { idmarca } });

export const getLines = async (page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: LineFilters) => {
  const { skip, take } = calculatePagination(page, limit);
  const where: any = {};

  if (filters?.search) where.descrip = { contains: filters.search };
  if (filters?.brandId) where.idmarca = filters.brandId;
  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.versiones = {
      some: {
        company: {
          some: { id: { in: filters.companyIds } },
        },
      },
    };
  }
  if (!filters?.isSuperAdmin) {
    where.versiones = {
      some: {
        company: {
          some: { active: true },
        },
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.autosLinea.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder } }),
    prisma.autosLinea.count({ where }),
  ]);

  return { items, total };
};

export const createLine = async (data: { brandId: number; descrip: string }) => {
  const idlinea = await getNextId("autosLinea");
  return prisma.autosLinea.create({ data: { idlinea, idmarca: data.brandId, descrip: data.descrip } });
};

export const updateLine = async (idlinea: number, data: { descrip?: string; brandId?: number }) => {
  return prisma.autosLinea.update({
    where: { idlinea },
    data: {
      ...(data.descrip !== undefined && { descrip: data.descrip }),
      ...(data.brandId !== undefined && { idmarca: data.brandId }),
    },
  });
};

export const deleteLine = async (idlinea: number) => prisma.autosLinea.delete({ where: { idlinea } });

export const getVersions = async (page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", filters?: VersionFilters): Promise<{ items: any[]; total: number }> => {
  const { skip, take } = calculatePagination(page, limit);
  const where: any = {};

  if (filters?.search) where.descrip = { contains: filters.search };
  if (filters?.lineId) where.idlinea = filters.lineId;
  if (filters?.brandId) {
    where.linea = { ...(where.linea || {}), idmarca: filters.brandId };
  }
  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.company = { some: { id: { in: filters.companyIds }, active: true } };
  } else if (!filters?.isSuperAdmin) {
    where.company = { some: { active: true } };
  }

  const [versions, total] = await Promise.all([
    prisma.autosVersion.findMany({
      where,
      skip,
      take,
      orderBy: sortBy === "idlinea" ? { idlinea: sortOrder } : { [sortBy]: sortOrder },
      include: { company: { select: { id: true, name: true } }, linea: true },
    }),
    prisma.autosVersion.count({ where }),
  ]);

  const brandIds = Array.from(new Set(versions.map((v) => v.linea?.idmarca).filter((x): x is number => x !== null && x !== undefined)));
  const lineIds = Array.from(new Set(versions.map((v) => v.idlinea)));

  const [brands, lines] = await Promise.all([
    prisma.autosMarca.findMany({ where: { idmarca: { in: brandIds } }, select: { idmarca: true, descrip: true } }),
    prisma.autosLinea.findMany({ where: { idlinea: { in: lineIds } }, select: { idlinea: true, descrip: true, idmarca: true } }),
  ]);

  const brandMap = new Map(brands.map((b) => [b.idmarca, b]));
  const lineMap = new Map(lines.map((l) => [l.idlinea, l]));

  const items = versions.map((v) => ({
    idversion: v.idversion,
    descrip: v.descrip,
    codigo: v.codigo,
    idlinea: v.idlinea,
    company: v.company,
    linea: lineMap.get(v.idlinea) ?? null,
    marca: v.linea?.idmarca ? brandMap.get(v.linea.idmarca) ?? null : null,
  }));

  return { items, total };
};

export const getVersionById = async (idversion: number, companyIds?: string[], isSuperAdmin?: boolean) => {
  const where: any = { idversion };
  if (!isSuperAdmin && companyIds?.length) {
    where.company = { some: { id: { in: companyIds } } };
  }

  const version = await prisma.autosVersion.findFirst({ where, include: { company: { select: { id: true, name: true } }, linea: true } });
  if (!version) return null;

  const brand = version.linea?.idmarca
    ? await prisma.autosMarca.findUnique({ where: { idmarca: version.linea.idmarca }, select: { idmarca: true, descrip: true } })
    : null;

  return {
    idversion: version.idversion,
    descrip: version.descrip,
    codigo: version.codigo,
    idlinea: version.idlinea,
    company: version.company,
    linea: version.linea ? { idlinea: version.linea.idlinea, descrip: version.linea.descrip } : null,
    marca: brand,
  };
};

export const createVersion = async (data: { lineId: number; descrip: string; codigo: string; companyIds: string[] }) => {
  const idversion = await getNextId("autosVersion");
  return prisma.autosVersion.create({
    data: {
      idversion,
      idlinea: data.lineId,
      descrip: data.descrip,
      codigo: data.codigo,
      company: { connect: data.companyIds.map((id) => ({ id })) },
    },
  });
};

export const updateVersion = async (idversion: number, data: { lineId?: number; descrip?: string; codigo?: string; companyIds?: string[] }) => {
  return prisma.autosVersion.update({
    where: { idversion },
    data: {
      ...(data.lineId !== undefined && { idlinea: data.lineId }),
      ...(data.descrip !== undefined && { descrip: data.descrip }),
      ...(data.codigo !== undefined && { codigo: data.codigo }),
      ...(data.companyIds && { company: { set: data.companyIds.map((id) => ({ id })) } }),
    },
  });
};

export const deleteVersion = async (idversion: number) => prisma.autosVersion.delete({ where: { idversion } });

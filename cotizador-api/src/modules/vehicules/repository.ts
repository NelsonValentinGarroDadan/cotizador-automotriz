import prisma from "../../config/prisma";
import { calculatePagination } from "../../utils/pagination";

interface BrandFilters {
  search?: string;
  companyIds?: string[];
  isSuperAdmin?: boolean; 
}

interface LineFilters extends BrandFilters {
  brandId?: number;
}

interface ModelFilters extends LineFilters {
  lineId?: number;
}

interface VersionFilters extends ModelFilters {
  modelId?: number;
}

const getNextId = async (table: "autosMarca" | "autosLinea" | "autosModelo" | "autosVersion") => {
  if (table === "autosMarca") {
    const last = await prisma.autosMarca.findFirst({
      orderBy: { idmarca: "desc" },
      select: { idmarca: true },
    });
    return (last?.idmarca ?? 0) + 1;
  }
  if (table === "autosLinea") {
    const last = await prisma.autosLinea.findFirst({
      orderBy: { idlinea: "desc" },
      select: { idlinea: true },
    });
    return (last?.idlinea ?? 0) + 1;
  }
  if (table === "autosModelo") {
    const last = await prisma.autosModelo.findFirst({
      orderBy: { idmodelo: "desc" },
      select: { idmodelo: true },
    });
    return (last?.idmodelo ?? 0) + 1;
  }
  const last = await prisma.autosVersion.findFirst({
    orderBy: { idversion: "desc" },
    select: { idversion: true },
  });
  return (last?.idversion ?? 0) + 1;
};

export const getBrands = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: VersionFilters
) => {
  const { skip, take } = calculatePagination(page, limit);

  const where: any = {};

  if (filters?.search) {
    where.descrip = { contains: filters.search };
  }

  if (filters?.brandId) {
    where.idmarca = filters.brandId;
  }

  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.versiones = {
      some: {
        company: {
          id: { in: filters.companyIds },
        },
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.autosMarca.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.autosMarca.count({ where }),
  ]);

  return { items, total };
};

// Brands CRUD
export const createBrand = async (data: { descrip: string; logo?: string; codigo?: string }) => {
  const idmarca = await getNextId("autosMarca");
  return prisma.autosMarca.create({
    data: {
      idmarca,
      descrip: data.descrip,
      logo: data.logo ?? "",
      orden: 0,
      codigo: data.codigo ?? "",
      repuestos: 0,
      predeterminada: 0,
    },
  });
};

export const updateBrand = async (
  idmarca: number,
  data: { descrip?: string; logo?: string; codigo?: string }
) => {
  return prisma.autosMarca.update({
    where: { idmarca },
    data: {
      ...(data.descrip !== undefined && { descrip: data.descrip }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.codigo !== undefined && { codigo: data.codigo }),
    },
  });
};

export const deleteBrand = async (idmarca: number) => {
  return prisma.autosMarca.delete({ where: { idmarca } });
};

export const getLines = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: LineFilters
) => {
  const { skip, take } = calculatePagination(page, limit);

  const where: any = {};

  if (filters?.search) {
    where.descrip = { contains: filters.search };
  }

  if (filters?.brandId) {
    where.idmarca = filters.brandId;
  }

  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.modelos = {
      some: {
        versiones: {
          some: {
            company: {
              id: { in: filters.companyIds },
            },
          },
        },
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.autosLinea.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.autosLinea.count({ where }),
  ]);

  return { items, total };
};

// Lines CRUD
export const createLine = async (data: { brandId: number; descrip: string }) => {
  const idlinea = await getNextId("autosLinea");
  return prisma.autosLinea.create({
    data: {
      idlinea,
      idmarca: data.brandId,
      descrip: data.descrip,
      ajuste: 0,
      dias_nadcon: 0,
      leyenda_nadcon: "",
      seguro: 0,
      gestion: 0,
      flete: 0,
      idpais_fabricacion: 0,
      compra_vence: 0,
      costo_ad_pm: 0,
      costo_ad_pm_costo: 0,
      inactivo: 0,
      idgrupo_servicio: 0,
      valor_hora_servicio: 0,
      precio_backup: 0,
      valor_dia_chapa: 0,
      valor_panio_pintura: 0,
      adicional_pl_valor: 0,
      adicional_pl_porcentaje: 0,
      precios_en_dolares: 0,
      comercial: 0,
      cantidad_mo: 0,
      costo_entrega: 0,
      codigo_salesforce: "",
      impuesto_interno: 0,
      idtasa: 0,
      idiva: 0,
      idtipocpu: 0,
    },
  });
};

export const updateLine = async (
  idlinea: number,
  data: { descrip?: string; brandId?: number }
) => {
  return prisma.autosLinea.update({
    where: { idlinea },
    data: {
      ...(data.descrip !== undefined && { descrip: data.descrip }),
      ...(data.brandId !== undefined && { idmarca: data.brandId }),
    },
  });
};

export const deleteLine = async (idlinea: number) => {
  return prisma.autosLinea.delete({ where: { idlinea } });
};

export const getModels = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: ModelFilters
) => {
  const { skip, take } = calculatePagination(page, limit);

  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { descrip: { contains: filters.search } },
      { nueva_descrip: { contains: filters.search } },
      { codigo: { contains: filters.search } },
    ];
  }

  if (filters?.brandId) {
    where.idmarca = filters.brandId;
  }

  if (filters?.lineId) {
    where.idlinea = filters.lineId;
  }

  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.versiones = {
      some: {
        company: {
          id: { in: filters.companyIds },
        },
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.autosModelo.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.autosModelo.count({ where }),
  ]);

  return { items, total };
};

// Models CRUD
export const createModel = async (data: { brandId: number; lineId: number; descrip: string }) => {
  const idmodelo = await getNextId("autosModelo");
  return prisma.autosModelo.create({
    data: {
      idmodelo,
      descrip: data.descrip,
      idmarca: data.brandId,
      idlinea: data.lineId,
      codigo: "",
      codigo_viejo: "",
      idtipo: 0,
      idmotor: 0,
      idcombustible: 0,
      idgrupo: 0,
      iva: 0,
      idimpuesto: 0,
      iibb: 0,
      costo_ad_pm: 0,
      costo_ad_pvp: 0,
      adicional: 0,
      adicional_pl_valor: 0,
      adicional_pl_porcentaje: 0,
    },
  });
};

export const updateModel = async (
  idmodelo: number,
  data: { descrip?: string; brandId?: number; lineId?: number }
) => {
  return prisma.autosModelo.update({
    where: { idmodelo },
    data: {
      ...(data.descrip !== undefined && { descrip: data.descrip }),
      ...(data.brandId !== undefined && { idmarca: data.brandId }),
      ...(data.lineId !== undefined && { idlinea: data.lineId }),
    },
  });
};

export const deleteModel = async (idmodelo: number) => {
  return prisma.autosModelo.delete({ where: { idmodelo } });
};

export const getVersions = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: VersionFilters
): Promise<{ items: any[]; total: number }> => {
  const { skip, take } = calculatePagination(page, limit);

  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { descrip: { contains: filters.search } },
      { nueva_descrip: { contains: filters.search } },
      { codigo: { contains: filters.search } },
    ];
  }

  if (filters?.brandId) {
    where.idmarca = filters.brandId;
  }

  if (filters?.lineId) {
    where.modelo = {
      ...(where.modelo || {}),
      idlinea: filters.lineId,
    };
  }

  if (filters?.modelId) {
    where.idmodelo = filters.modelId;
  }

  if (!filters?.isSuperAdmin && filters?.companyIds?.length) {
    where.company = {
      some: {
        id: { in: filters.companyIds },
      },
    };
  }

  const [versions, total] = await Promise.all([
    prisma.autosVersion.findMany({
      where,
      skip,
      take,
      orderBy:
        sortBy === "idmarca"
          ? { marca: { descrip: sortOrder } }
          : sortBy === "idlinea"
          ? { modelo: { linea: { descrip: sortOrder } } }
          : sortBy === "idmodelo"
          ? { modelo: { descrip: sortOrder } }
          : { [sortBy]: sortOrder },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.autosVersion.count({ where }),
  ]);

  const brandIds = Array.from(new Set(versions.map((v) => v.idmarca)));
  const modelIds = Array.from(new Set(versions.map((v) => v.idmodelo)));

  const [brands, models] = await Promise.all([
    prisma.autosMarca.findMany({
      where: { idmarca: { in: brandIds } },
      select: { idmarca: true, descrip: true },
    }),
    prisma.autosModelo.findMany({
      where: { idmodelo: { in: modelIds } },
      select: {
        idmodelo: true,
        descrip: true,
        idlinea: true,
      },
    }),
  ]);

  const lineIds = Array.from(
    new Set(models.map((m) => m.idlinea).filter((id) => id !== null))
  );

  const lines = await prisma.autosLinea.findMany({
    where: { idlinea: { in: lineIds } },
    select: { idlinea: true, descrip: true },
  });

  const brandMap = new Map(brands.map((b) => [b.idmarca, b]));
  const lineMap = new Map(lines.map((l) => [l.idlinea, l]));
  const modelMap = new Map(
    models.map((m) => [
      m.idmodelo,
      {
        idmodelo: m.idmodelo,
        descrip: m.descrip,
        linea: m.idlinea ? lineMap.get(m.idlinea) ?? null : null,
      },
    ])
  );

  const items = versions.map((v) => ({
    ...v,
    marca: brandMap.get(v.idmarca) ?? null,
    modelo: modelMap.get(v.idmodelo) ?? null,
  }));

  return { items, total };
};

export const getVersionById = async (
  idversion: number,
  companyIds?: string[],
  isSuperAdmin?: boolean
) => {
  const where: any = { idversion };

  if (!isSuperAdmin && companyIds?.length) {
    where.company = {
      some: { id: { in: companyIds } },
    };
  }

  const version = await prisma.autosVersion.findFirst({
    where,
    include: {
      company: {
        select: { id: true, name: true },
      },
    },
  });

  if (!version) {
    return null;
  }

  const [brand, model] = await Promise.all([
    prisma.autosMarca.findUnique({
      where: { idmarca: version.idmarca },
      select: { idmarca: true, descrip: true },
    }),
    prisma.autosModelo.findUnique({
      where: { idmodelo: version.idmodelo },
      select: { idmodelo: true, descrip: true, idlinea: true },
    }),
  ]);

  let linea = null;
  if (model?.idlinea) {
    linea = await prisma.autosLinea.findUnique({
      where: { idlinea: model.idlinea },
      select: { idlinea: true, descrip: true },
    });
  }

  return {
    ...version,
    marca: brand ?? null,
    modelo: model
      ? {
          idmodelo: model.idmodelo,
          descrip: model.descrip,
          linea,
        }
      : null,
  };
};

// Versions CRUD
export const createVersion = async (
  data: {
    brandId: number;
    modelId: number;
    descrip: string;
    nueva_descrip?: string;
    codigo?: string;
    companyIds: string[];
  }
) => {
  const idversion = await getNextId("autosVersion");
  return prisma.autosVersion.create({
    data: {
      idversion,
      idmarca: data.brandId,
      idmodelo: data.modelId,
      descrip: data.descrip,
      descrip_nadin: data.descrip,
      descrip_otra: "",
      codigo: data.codigo ?? "",
      inactivo: 0,
      cod_ph: "",
      codigo_viejo: "",
      codigo_acara: "",
      nueva_descrip: data.nueva_descrip ?? "",
      paquetes: "",
      paquetes2: "",
      paquetes3: "",
      ajuste: 0,
      incentivo_tactico: 0,
      incentivo_tactico_ph: 0,
      adicional_pl_valor: 0,
      adicional_pl_porcentaje: 0,
      no_tomar_usado: 0,
      txt_otro_sistema: "",
      iibb_cordoba_origen: "",
      iibb_cordoba_marca: "",
      iibb_cordoba_tipo: "",
      iibb_cordoba_modelo: "",
      iva: 0,
      equipamiento: "",
      sfx_ventas: "",
      sfx_produccion: "",
      idtasa: 0,
      gear_box_type: "",
      connected_car: 0,
      servicios_conectados: 0,
      precio_especial: 0,
      company: {
        connect: data.companyIds.map((id) => ({ id })),
      },
    },
  });
};

export const updateVersion = async (
  idversion: number,
  data: {
    brandId?: number;
    modelId?: number;
    descrip?: string;
    nueva_descrip?: string;
    codigo?: string;
    companyIds?: string[];
  }
) => {
  return prisma.autosVersion.update({
    where: { idversion },
    data: {
      ...(data.brandId !== undefined && { idmarca: data.brandId }),
      ...(data.modelId !== undefined && { idmodelo: data.modelId }),
      ...(data.descrip !== undefined && { descrip: data.descrip, descrip_nadin: data.descrip }),
      ...(data.nueva_descrip !== undefined && { nueva_descrip: data.nueva_descrip }),
      ...(data.codigo !== undefined && { codigo: data.codigo }),
      ...(data.companyIds && {
        company: {
          set: data.companyIds.map((id) => ({ id })),
        },
      }),
    },
  });
};

export const deleteVersion = async (idversion: number) => {
  return prisma.autosVersion.delete({
    where: { idversion },
  });
};

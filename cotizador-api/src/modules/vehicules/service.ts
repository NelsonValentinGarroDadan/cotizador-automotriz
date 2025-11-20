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
  let companyIds =
    !isSuperAdmin && user.role === Role.ADMIN
      ? await getAdminCompanyIds(user.id)
      : undefined;

  const companyIdFilter = filters?.companyId;

  if (!isSuperAdmin && companyIdFilter) {
    companyIds = (companyIds || []).filter((id) => id === companyIdFilter);
  }

  if (user.role === Role.ADMIN && (!companyIds || companyIds.length === 0)) {
    return createPaginatedResponse([], 0, page, limit);
  }

  const effectiveCompanyIds = isSuperAdmin
    ? companyIdFilter
      ? [companyIdFilter]
      : undefined
    : companyIds;

  const { items, total } = await repository.getVersions(page, limit, sortBy, sortOrder, {
    search: filters?.search,
    brandId: filters?.brandId,
    lineId: filters?.lineId,
    modelId: filters?.modelId,
    isSuperAdmin,
    companyIds: effectiveCompanyIds,
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
  const hasExisting = !!data.brandId && !!data.modelId;

  // Caso 1: usar marca/modelo existentes (comportamiento anterior)
  if (hasExisting) {
    return repository.createVersion({
      // non-null porque hasExisting es true
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      brandId: data.brandId!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      modelId: data.modelId!,
      descrip: data.descrip,
      nueva_descrip: data.nueva_descrip,
      codigo: data.codigo,
      companyIds: data.companyIds,
    });
  }

  // Caso 2: crear marca + línea + modelo + versión en una transacción
  return prisma.$transaction(async (tx) => {
    // Crear marca
    const lastBrand = await tx.autosMarca.findFirst({
      orderBy: { idmarca: "desc" },
      select: { idmarca: true },
    });
    const newBrandId = (lastBrand?.idmarca ?? 0) + 1;
    const brand = await tx.autosMarca.create({
      data: {
        idmarca: newBrandId,
        descrip: data.newBrandDescrip ?? data.descrip.substring(0, 50),
        logo: "",
        orden: 0,
        codigo: "",
        repuestos: 0,
        predeterminada: 0,
      },
    });

    // Crear línea
    const lastLine = await tx.autosLinea.findFirst({
      orderBy: { idlinea: "desc" },
      select: { idlinea: true },
    });
    const newLineId = (lastLine?.idlinea ?? 0) + 1;
    const linea = await tx.autosLinea.create({
      data: {
        idlinea: newLineId,
        idmarca: brand.idmarca,
        descrip: data.newLineDescrip ?? data.descrip.substring(0, 50),
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

    // Crear modelo
    const lastModel = await tx.autosModelo.findFirst({
      orderBy: { idmodelo: "desc" },
      select: { idmodelo: true },
    });
    const newModelId = (lastModel?.idmodelo ?? 0) + 1;
    const modelo = await tx.autosModelo.create({
      data: {
        idmodelo: newModelId,
        descrip: data.newModelDescrip ?? data.descrip.substring(0, 50),
        idmarca: brand.idmarca,
        idlinea: linea.idlinea,
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

    // Crear versión
    const lastVersion = await tx.autosVersion.findFirst({
      orderBy: { idversion: "desc" },
      select: { idversion: true },
    });
    const newVersionId = (lastVersion?.idversion ?? 0) + 1;

    const version = await tx.autosVersion.create({
      data: {
        idversion: newVersionId,
        idmarca: brand.idmarca,
        idmodelo: modelo.idmodelo,
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

    return version;
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

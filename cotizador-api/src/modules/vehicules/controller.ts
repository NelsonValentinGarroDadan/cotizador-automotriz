import { Request, Response } from "express";
import { getPaginationParams } from "../../utils/pagination";
import * as service from "./service";
import {
  createBrandSchema,
  createLineSchema,
  createModelSchema,
  getVehiclesQuerySchema,
  updateBrandSchema,
  updateLineSchema,
  updateModelSchema,
  updateVehicleVersionSchema,
} from "./schema";
import { AppError } from "../../core/errors/appError";

const ALLOWED_SORT_FIELDS = ["descrip", "idmarca", "idlinea", "idmodelo", "idversion"];

export const getBrands = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "descrip"
  );

  const filters = getVehiclesQuerySchema.parse(req.query);

  const result = await service.getBrands(req.user, page, limit, sortBy, sortOrder, filters);
  res.json(result);
};

export const createBrand = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const payload = createBrandSchema.parse(req.body);
  const created = await service.createBrand(req.user, payload);
  res.status(201).json(created);
};

export const updateBrand = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idmarca = Number(req.params.idmarca);
  if (Number.isNaN(idmarca)) {
    throw new AppError("ID de marca inválido", 400);
  }

  const payload = updateBrandSchema.parse(req.body);
  const updated = await service.updateBrand(req.user, idmarca, payload);
  res.json(updated);
};

export const deleteBrand = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idmarca = Number(req.params.idmarca);
  if (Number.isNaN(idmarca)) {
    throw new AppError("ID de marca inválido", 400);
  }

  await service.deleteBrand(req.user, idmarca);
  res.status(204).send();
};

export const getLines = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "descrip"
  );

  const filters = getVehiclesQuerySchema.parse(req.query);

  const result = await service.getLines(req.user, page, limit, sortBy, sortOrder, filters);
  res.json(result);
};

export const createLine = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const payload = createLineSchema.parse(req.body);
  const created = await service.createLine(req.user, payload);
  res.status(201).json(created);
};

export const updateLine = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idlinea = Number(req.params.idlinea);
  if (Number.isNaN(idlinea)) {
    throw new AppError("ID de línea inválido", 400);
  }

  const payload = updateLineSchema.parse(req.body);
  const updated = await service.updateLine(req.user, idlinea, payload);
  res.json(updated);
};

export const deleteLine = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idlinea = Number(req.params.idlinea);
  if (Number.isNaN(idlinea)) {
    throw new AppError("ID de línea inválido", 400);
  }

  await service.deleteLine(req.user, idlinea);
  res.status(204).send();
};

export const getModels = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "descrip"
  );

  const filters = getVehiclesQuerySchema.parse(req.query);

  const result = await service.getModels(req.user, page, limit, sortBy, sortOrder, filters);
  res.json(result);
};

export const createModel = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const payload = createModelSchema.parse(req.body);
  const created = await service.createModel(req.user, payload);
  res.status(201).json(created);
};

export const updateModel = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idmodelo = Number(req.params.idmodelo);
  if (Number.isNaN(idmodelo)) {
    throw new AppError("ID de modelo inválido", 400);
  }

  const payload = updateModelSchema.parse(req.body);
  const updated = await service.updateModel(req.user, idmodelo, payload);
  res.json(updated);
};

export const deleteModel = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idmodelo = Number(req.params.idmodelo);
  if (Number.isNaN(idmodelo)) {
    throw new AppError("ID de modelo inválido", 400);
  }

  await service.deleteModel(req.user, idmodelo);
  res.status(204).send();
};

export const getVersionById = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const idversion = Number(req.params.idversion);
  if (Number.isNaN(idversion)) {
    throw new AppError("ID de version invalido", 400);
  }

  const version = await service.getVersionById(req.user, idversion);
  res.json(version);
};

export const getVersions = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "descrip"
  );
  console.log(req.query);
  const validate = getVehiclesQuerySchema.safeParse(req.query);
  if (!validate .success) {
    const errors = validate .error.issues.map((e) => e.message);
    throw new AppError(errors.join(','), 403);
  }

  const filters = validate.data;

  const result = await service.getVersions(req.user, page, limit, sortBy, sortOrder, filters);
  res.json(result);
};

export const createVersion = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const created = await service.createVersion(req.user, req.body);
  res.status(201).json(created);
};

export const updateVersion = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idversion = Number(req.params.idversion);
  if (Number.isNaN(idversion)) {
    throw new AppError("ID de versión inválido", 400);
  }

  const payload = updateVehicleVersionSchema.parse(req.body);
  const updated = await service.updateVersion(req.user, idversion, payload);
  res.json(updated);
};

export const deleteVersion = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const idversion = Number(req.params.idversion);
  if (Number.isNaN(idversion)) {
    throw new AppError("ID de versión inválido", 400);
  }

  await service.deleteVersion(req.user, idversion);
  res.status(204).send();
};

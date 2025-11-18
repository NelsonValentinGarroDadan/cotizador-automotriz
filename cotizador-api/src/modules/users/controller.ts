import { Request, Response } from "express";
import * as service from "./service";
import { getPaginationParams } from "../../utils/pagination";
import { AppError } from "../../core/errors/appError";
import { Role } from "../../core/types/role";

export const getAllUsers = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["firstName", "lastName", "email", "createdAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "firstName"
  );

  const search = req.query.search as string | undefined;
  const role = req.query.role as Role | undefined;
  const companies = req.query.companyIds as string | undefined;
  const fechaCreacion = req.query.fechaCreacion as string | undefined;
  let companyIds: string[] | undefined;
  if (companies) {
    companyIds = companies.split(",").filter(Boolean);
  }

  const result = await service.getAllUsers(
    req.user,
    page,
    limit,
    sortBy,
    sortOrder,
    { search, role, companyIds, fechaCreacion }
  );

  res.json(result);
};

export const getUserById = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const user = await service.getUserById(req.params.id, req.user);
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const user = await service.createUser(req.body, req.user);
  res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const { allowedPlanIds } = req.body;
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const parsedAllowedPlanIds = allowedPlanIds
    ? Array.isArray(allowedPlanIds)
      ? allowedPlanIds
      : JSON.parse(allowedPlanIds)
    : undefined;

  await service.updateUser(req.params.id, {
    ...req.body,
    allowedPlanIds: parsedAllowedPlanIds,
  }, req.user);
  res.status(200).send();
};

export const deleteUser = async (req: Request, res: Response) => {
   if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deleteUser(req.params.id, req.user);
  res.status(200).send();
};

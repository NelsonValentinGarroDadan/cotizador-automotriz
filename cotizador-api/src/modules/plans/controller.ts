// backend/src/modules/plan/controller.ts
import { Request, Response } from "express";
import * as service from "./service";
import { AppError } from "../../core/errors/appError";
import path from "path";
import sharp from "sharp";
import { getPaginationParams } from "../../utils/pagination";

const uploadDir = path.join(__dirname, "../../../uploads/plans");

export const getAllPlans = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["name", "createdAt", "updatedAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "name"
  );

  const filters: {
    name?: string;
    includeInactive?: boolean;
    companyIds?: string[];
  } = {};

  if (req.query.search) filters.name = String(req.query.search);
  if (req.query.includeInactive)
    filters.includeInactive = req.query.includeInactive === "true";

  // ✅ Agregar filtro por compañías
  if (req.query.companyIds) {
    const companyIdsParam = String(req.query.companyIds);
    filters.companyIds = companyIdsParam.split(",").filter(Boolean);
  }

  const result = await service.getAllPlans(
    req.user.id,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );

  res.json(result);
};

export const getPlanById = async (req: Request, res: Response) => {
  const plan = await service.getPlanById(req.params.id, req.user);
  res.json(plan);
};

export const createPlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { name, description, companyIds, coefficients, desdeMonto, hastaMonto, desdeCuota, hastaCuota } = req.body;

  // ✅ Parse de arrays JSON
  const parsedCompanyIds = Array.isArray(companyIds)
    ? companyIds
    : JSON.parse(companyIds || "[]");

  const parsedCoefficients = Array.isArray(coefficients)
    ? coefficients
    : JSON.parse(coefficients || "[]");

  let logo: string | undefined;
  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    logo = `/uploads/plans/${fileName}`;
  }

  const plan = await service.createPlan(
    {
      name,
      description,
      companyIds: parsedCompanyIds,
      coefficients: parsedCoefficients,
      desdeMonto: desdeMonto ? parseFloat(desdeMonto) : undefined,
      hastaMonto: hastaMonto ? parseFloat(hastaMonto) : undefined,
      desdeCuota: desdeCuota ? parseInt(desdeCuota) : undefined,
      hastaCuota: hastaCuota ? parseInt(hastaCuota) : undefined,
      logo,
    },
    req.user
  );

  res.status(201).json(plan);
};

export const updatePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const { id } = req.params;
  const { name, description, companyIds, active, coefficients, desdeMonto, hastaMonto, desdeCuota, hastaCuota } = req.body;


  const parsedCompanyIds = companyIds
    ? Array.isArray(companyIds)
      ? companyIds
      : JSON.parse(companyIds || "[]")
    : undefined;

  let logo: string | undefined;
  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    logo = `/uploads/plans/${fileName}`;
  }

  const updated = await service.updatePlan(
    id,
    {
      name,
      description,
      companyIds: parsedCompanyIds,
      active: active !== undefined ? active : undefined,
      coefficients,
      desdeMonto,
      hastaMonto,
      desdeCuota,
      hastaCuota,
      logo,
    },
    req.user
  );


  res.json(updated);
};

export const deletePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deletePlan(req.params.id, req.user);
  res.status(204).send();
};
// backend/src/modules/plan/controller.ts
import { Request, Response } from "express"; 
import * as service from "./service";
import { getPaginationParams } from "../../utils/pagination";
import { AppError } from "../../core/errors/appError";
import path from "path";
import sharp from "sharp";

const uploadDir = path.join(__dirname, "../../../uploads/plans");

export const getAllPlans = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["name", "createdAt", "updatedAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "name"
  );

  const filters: { name?: string; companyId?: string; createdAtFrom?: Date } =
    {};
  if (req.query.search) filters.name = String(req.query.search);
  if (req.query.companyId) filters.companyId = String(req.query.companyId);
  if (req.query.fechaCreacion) {
    filters.createdAtFrom = new Date(String(req.query.fechaCreacion));
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

  const { name, description, companyId } = req.body;
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
    { name, description, companyId, logo },
    req.user
  );
  res.status(201).json(plan);
};

export const updatePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { id } = req.params;
  const { name, description, companyId } = req.body;
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
    { name, description, companyId, logo },
    req.user
  );
  res.json(updated);
};

export const deletePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deletePlan(req.params.id, req.user);
  res.status(204).send();
};
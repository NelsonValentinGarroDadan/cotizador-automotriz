import { Request, Response } from "express";
import sharp from "sharp";
import path from "path"; 
import * as service from "./service";
import { getPaginationParams } from "../../utils/pagination";
import { AppError } from "../../core/errors/appError";

const uploadDir = path.join(__dirname, "../../../uploads/companies");

export const getAllCompanies = async (req: Request, res: Response) => {
  if (!req.user) throw new Error("Usuario no autenticado");

  const ALLOWED_SORT_FIELDS = ["name", "createdAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "name"
  );

  const filters: { name?: string; createdAtFrom?: Date } = {};
  if (req.query.search) filters.name = String(req.query.search);
  if (req.query.fechaCreacion) {  
    filters.createdAtFrom = new Date(String(req.query.fechaCreacion));
  }

  const result = await service.getAllCompanies(req.user.id, page, limit, sortBy, sortOrder, filters);
  res.json(result);
};
export const getCompanyById = async (req: Request, res: Response) => {  
  const company = await service.getCompanyById(req.params.id,req.user); 

  res.json(company);
};


export const createCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { name } = req.body;
  let logo: string | undefined;

  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    logo = `/uploads/companies/${fileName}`;
  }

  const company = await service.createCompany({ name, logo }, req.user);
  res.status(201).json(company);
};


export const updateCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const { id } = req.params;
  const { name } = req.body;
  let logo: string | undefined;

  if (req.file) {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit:  "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath);

    logo = `/uploads/companies/${fileName}`;
  }

  const updated = await service.updateCompany(id, { name, logo }, req.user);
  res.json(updated);
};

export const deleteCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deleteCompany(req.params.id,req.user);
  res.status(204).send();
};

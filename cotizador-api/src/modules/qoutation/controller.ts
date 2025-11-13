// backend/src/modules/quotation/controller.ts
import { Request, Response } from "express";
import * as service from "./service";
import { AppError } from "../../core/errors/appError";
import { getPaginationParams } from "../../utils/pagination";

export const getAllQuotations = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["createdAt", "clientName", "totalValue"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "createdAt"
  );

  const filters: {
    search?: string;
    companyIds?: string[];
    planVersionId?: string;
    createdAtFrom?: Date;
    createdAtTo?: Date;
  } = {};

  if (req.query.search) filters.search = String(req.query.search);
  
  if (req.query.companyIds) {
    const companyIdsParam = String(req.query.companyIds);
    filters.companyIds = companyIdsParam.split(",").filter(Boolean);
  }

  if (req.query.planVersionId) {
    filters.planVersionId = String(req.query.planVersionId);
  }

  if (req.query.fechaDesde) {
    filters.createdAtFrom = new Date(String(req.query.fechaDesde));
  }

  if (req.query.fechaHasta) {
    filters.createdAtTo = new Date(String(req.query.fechaHasta));
  }

  const result = await service.getAllQuotations(
    req.user.id,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );

  res.json(result);
};

export const getQuotationById = async (req: Request, res: Response) => {
  const quotation = await service.getQuotationById(req.params.id, req.user);
  res.json(quotation);
};

export const createQuotation = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { planVersionId, companyId, clientName, clientDni, vehicleData, totalValue } = req.body;

  const quotation = await service.createQuotation(
    {
      planVersionId,
      companyId,
      clientName,
      clientDni,
      vehicleData,
      totalValue: totalValue ? parseFloat(totalValue) : undefined,
    },
    req.user
  );

  res.status(201).json(quotation);
};

export const updateQuotation = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { id } = req.params;
   const { planVersionId, companyId, clientName, clientDni, vehicleData, totalValue } = req.body;

  const updated = await service.updateQuotation(
    id,
    {
      clientName,
      clientDni,
      vehicleData,
      planVersionId, 
      companyId,
      totalValue: totalValue ? parseFloat(totalValue) : undefined,
    },
    req.user
  );

  res.json(updated);
};

export const deleteQuotation = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deleteQuotation(req.params.id, req.user);
  res.status(204).send();
};
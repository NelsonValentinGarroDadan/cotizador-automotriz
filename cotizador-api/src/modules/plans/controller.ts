// backend/src/modules/plan/controller.ts
import { Request, Response } from "express";
import * as service from "./service";
import { AppError } from "../../core/errors/appError";
import { getPaginationParams } from "../../utils/pagination";
import {
  uploadImageToBlob,
  getSignedBlobUrl,
} from "../../core/storage/blobStorage";

export const getAllPlans = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["name", "createdAt", "updatedAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "createdAt"
  );

  const filters: {
    name?: string;
    includeInactive?: boolean;
    companyIds?: string[];
  } = {};

  if (req.query.search) filters.name = String(req.query.search);
  if (req.query.includeInactive)
    filters.includeInactive = req.query.includeInactive === "true";

  if (req.query.companyIds) {
    const companyIdsParam = String(req.query.companyIds);
    filters.companyIds = companyIdsParam.split(",").filter(Boolean);
  }

  const result = await service.getAllPlans(
    req.user,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );

  const plansWithSignedLogo = result.data.map((plan: any) => {
    const signedLogo = plan.logo ? getSignedBlobUrl(plan.logo) : null;
    return {
      ...plan,
      logo: signedLogo ?? plan.logo,
      logoUrl: signedLogo,
      companies: plan.companies?.map((company: any) => {
        const signedCompanyLogo = company.logo
          ? getSignedBlobUrl(company.logo)
          : null;
        return {
          ...company,
          logo: signedCompanyLogo ?? company.logo,
          logoUrl: signedCompanyLogo,
        };
      }),
    };
  });

  res.json({ ...result, data: plansWithSignedLogo });
};

export const getPlanById = async (req: Request, res: Response) => {
  const plan = await service.getPlanById(req.params.id, req.user);

  const planWithSignedLogo = plan
    ? {
        ...plan,
        logo: plan.logo ? getSignedBlobUrl(plan.logo) : null,
        logoUrl: plan.logo ? getSignedBlobUrl(plan.logo) : null,
        companies: plan.companies?.map((company: any) => {
          const signedCompanyLogo = company.logo
            ? getSignedBlobUrl(company.logo)
            : null;
          return {
            ...company,
            logo: signedCompanyLogo ?? company.logo,
            logoUrl: signedCompanyLogo,
          };
        }),
      }
    : plan;

  res.json(planWithSignedLogo);
};

export const createPlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const {
    name,
    description,
    companyIds,
    coefficients,
    desdeMonto,
    hastaMonto,
    desdeCuota,
    hastaCuota,
    allowedUserIds,
  } = req.body;

  const parsedCompanyIds = Array.isArray(companyIds)
    ? companyIds
    : JSON.parse(companyIds || "[]");

  const parsedCoefficients = Array.isArray(coefficients)
    ? coefficients
    : JSON.parse(coefficients || "[]");

  const parsedAllowedUserIds = allowedUserIds
    ? Array.isArray(allowedUserIds)
      ? allowedUserIds
      : JSON.parse(allowedUserIds)
    : [];

  let logo: string | undefined;
  if (req.file) {
    logo = await uploadImageToBlob(req.file.buffer, { folder: "plans" });
  }

  const plan = await service.createPlan(
    {
      name,
      description,
      companyIds: parsedCompanyIds,
      coefficients: parsedCoefficients,
      allowedUserIds: parsedAllowedUserIds,
      desdeMonto: desdeMonto ? parseFloat(desdeMonto) : undefined,
      hastaMonto: hastaMonto ? parseFloat(hastaMonto) : undefined,
      desdeCuota: desdeCuota ? parseInt(desdeCuota, 10) : undefined,
      hastaCuota: hastaCuota ? parseInt(hastaCuota, 10) : undefined,
      logo,
    },
    req.user
  );

  const signedLogo = plan?.logo ? getSignedBlobUrl(plan.logo) : null;
  const planWithSignedLogo = plan
    ? {
        ...plan,
        logo: signedLogo ?? plan.logo,
        logoUrl: signedLogo,
      }
    : plan;

  res.status(201).json(planWithSignedLogo);
};

export const updatePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const { id } = req.params;
  const {
    name,
    description,
    companyIds,
    active,
    coefficients,
    desdeMonto,
    hastaMonto,
    desdeCuota,
    hastaCuota,
    allowedUserIds,
  } = req.body;

  const parsedCompanyIds = companyIds
    ? Array.isArray(companyIds)
      ? companyIds
      : JSON.parse(companyIds || "[]")
    : undefined;

  let logo: string | undefined;
  if (req.file) {
    logo = await uploadImageToBlob(req.file.buffer, {
      folder: "plans",
      identifier: id,
    });
  }

  const parsedAllowedUserIds = allowedUserIds
    ? Array.isArray(allowedUserIds)
      ? allowedUserIds
      : JSON.parse(allowedUserIds)
    : undefined;

  const updated = await service.updatePlan(
    id,
    {
      name,
      description,
      allowedUserIds: parsedAllowedUserIds,
      active: active !== undefined ? active : undefined,
      companyIds: parsedCompanyIds,
      coefficients,
      desdeMonto,
      hastaMonto,
      desdeCuota,
      hastaCuota,
      logo,
    },
    req.user
  );

  const signedLogo = updated?.logo ? getSignedBlobUrl(updated.logo) : null;
  const updatedWithSignedLogo = updated
    ? {
        ...updated,
        logo: signedLogo ?? updated.logo,
        logoUrl: signedLogo,
      }
    : updated;

  res.json(updatedWithSignedLogo);
};

export const deletePlan = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deletePlan(req.params.id, req.user);
  res.status(204).send();
};

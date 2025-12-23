import { Request, Response } from "express";
import * as service from "./service";
import { getPaginationParams } from "../../utils/pagination";
import { AppError } from "../../core/errors/appError";
import {
  uploadImageToBlob,
  getSignedBlobUrl,
} from "../../core/storage/blobStorage";

export const getAllCompanies = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const ALLOWED_SORT_FIELDS = ["name", "createdAt"];
  const { page, limit, sortBy, sortOrder } = getPaginationParams(
    req.query,
    ALLOWED_SORT_FIELDS,
    "name"
  );

  const filters: { name?: string; createdAtFrom?: Date; includeInactive?: boolean } = {};
  if (req.query.search) filters.name = String(req.query.search);
  if (req.query.fechaCreacion) {  
    filters.createdAtFrom = new Date(String(req.query.fechaCreacion));
  }
  if (req.query.includeInactive === "true") filters.includeInactive = true;

  const result = await service.getAllCompanies(
    req.user,
    page,
    limit,
    sortBy,
    sortOrder,
    filters
  );
  const companiesWithSignedLogo = result.data.map((company: any) => {
    const signedLogo = company.logo ? getSignedBlobUrl(company.logo) : null;
    return {
      ...company,
      logo: signedLogo ?? company.logo,
      logoUrl: signedLogo,
    };
  });

  res.json({ ...result, data: companiesWithSignedLogo });
};
export const getCompanyById = async (req: Request, res: Response) => {  
  const company = await service.getCompanyById(req.params.id,req.user); 
  const signedLogo = company?.logo ? getSignedBlobUrl(company.logo) : null;
  const companyWithSignedLogo = company
    ? {
        ...company,
        logo: signedLogo ?? company.logo,
        logoUrl: signedLogo,
      }
    : company;

  res.json(companyWithSignedLogo);
};


export const createCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);

  const { name } = req.body;
  let logo: string | undefined;

  if (req.file) {
    logo = await uploadImageToBlob(req.file.buffer, { folder: "companies" });
  }

  const company = await service.createCompany({ name, logo }, req.user);
  const signedLogo = company?.logo ? getSignedBlobUrl(company.logo) : null;
  const companyWithSignedLogo = company
    ? {
        ...company,
        logo: signedLogo ?? company.logo,
        logoUrl: signedLogo,
      }
    : company;

  res.status(201).json(companyWithSignedLogo);
};


export const updateCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  const { id } = req.params;
  const { name } = req.body;
  const active =
    typeof req.body.active === "string"
      ? req.body.active === "true"
      : req.body.active === undefined
        ? undefined
        : Boolean(req.body.active);
  let logo: string | undefined;

  if (req.file) {
    logo = await uploadImageToBlob(req.file.buffer, {
      folder: "companies",
      identifier: id,
    });
  }

  const updated = await service.updateCompany(id, { name, logo, active }, req.user);

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

export const deleteCompany = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Usuario no autenticado", 403);
  await service.deleteCompany(req.params.id,req.user);
  res.status(204).send();
};

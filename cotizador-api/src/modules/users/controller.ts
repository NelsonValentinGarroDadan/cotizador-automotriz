import { Request, Response } from "express";
import * as service from "./service";
import { getPaginationParams } from "../../utils/pagination";
import { AppError } from "../../core/errors/appError";
import { Role } from "../../core/types/role";

export const getAllUsers = async (req: Request, res: Response) => {
    const ALLOWED_SORT_FIELDS = ['firstName', 'lastName', 'email', 'createdAt'];
    const { page, limit, sortBy, sortOrder } = getPaginationParams(
        req.query,
        ALLOWED_SORT_FIELDS,
        'firstName'  
    );
    
    // ✅ Extraer filtros adicionales
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const companies = req.query.companyIds as string | undefined; 
    const fechaCreacion = req.query.fechaCreacion as string | undefined;
    
    // ✅ Parsear companyIds si vienen como array o string separado por comas
    let companyIds: string[] | undefined;
    if (companies) {
        companyIds = companies.split(',').filter(Boolean);
    } 
    const result = await service.getAllUsers(
        page, 
        limit, 
        sortBy, 
        sortOrder,
        { search, role, companyIds, fechaCreacion }
    );
    
    res.json(result);
};

export const getUserById = async (req:Request, res:Response) => {
    const user = await service.getUserById(req.params.id);
    res.json(user);
}

export const createUser = async (req:Request, res:Response) => {
    if (!req.user) throw new AppError("Usuario no autenticado", 403);

    // Solo SUPER_ADMIN puede crear otro SUPER_ADMIN
    if (req.body.role === "SUPER_ADMIN" && req.user.role !== Role.SUPER_ADMIN) {
        throw new AppError("Solo un SUPER_ADMIN puede crear otro SUPER_ADMIN", 403);
    }

    const user = await service.createUser(req.body);
    res.status(201).json(user);
}

export const updateUser = async (req:Request, res:Response) => {
    const { allowedPlanIds } = req.body;

    const parsedAllowedPlanIds = allowedPlanIds
    ? Array.isArray(allowedPlanIds)
        ? allowedPlanIds
        : JSON.parse(allowedPlanIds)
    : undefined;

    await service.updateUser(req.params.id, {
    ...req.body,
    allowedPlanIds: parsedAllowedPlanIds
    });
        res.status(200).send();
    }

export const deleteUser = async (req:Request, res:Response) => {
    await service.deleteUser(req.params.id);
    res.status(200).send();
}

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";
import { Role } from "../types/role";


export const authorizeRole = (roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user; 
    if (!user) throw new AppError("No autorizado", 401);

    if (!roles.includes(user.role)) {
      throw new AppError("No tenés permisos suficientes", 403);
    } 

    next();
  };
};

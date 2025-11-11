import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../core/errors/appError";
import { UserToken } from "../types/userToken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default function authenticate (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Token no proporcionado", 401);

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string") {
      throw new AppError("Token inválido", 401);
    }
    req.user = payload as UserToken; // Necesitarás extender Request con user
    
  } catch {
    throw new AppError("Token inválido", 401);
  }finally{
    next();
  }
};

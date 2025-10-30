import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../core/errors/appError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default function authenticate (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Token no proporcionado", 401);

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Necesitarás extender Request con user
    next();
  } catch {
    throw new AppError("Token inválido", 401);
  }
};

import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Si es un error conocido (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Si es un error desconocido
  console.error("❌ Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

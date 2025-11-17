import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/appError";

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Conversión de boolean
      if (req.body.active && typeof req.body.active === "string") {
        req.body.active = req.body.active === "true";
      }

      // Función utilitaria para parsear JSON seguro
      const safeParseJSON = (value: unknown) => {
        if (!value) return undefined;
        if (typeof value !== "string") return value;
        try {
          const parsed = JSON.parse(value);
          return parsed;
        } catch {
          // deja el valor original si no se puede parsear
          return value;
        }
      };

      // Aplicar parse seguro a posibles campos JSON enviados como string
      req.body.companyIds = req.body.companyIds && safeParseJSON(req.body.companyIds);
      req.body.coefficients = req.body.coefficients && safeParseJSON(req.body.coefficients);
      req.body.allowedUserIds =
        req.body.allowedUserIds && safeParseJSON(req.body.allowedUserIds);

      // Normalizar strings vacíos a arrays vacíos donde aplique
      if (req.body.coefficients === "") {
        req.body.coefficients = [];
      }
      if (req.body.allowedUserIds === "") {
        req.body.allowedUserIds = [];
      }

      // Validar con Zod
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((err) => err.message);
        console.error("Errores de validación Zod:", errors);
        return res.status(400).json({ message: "Error de validación", errors });
      }

      req.body = result.data;
      next();
    } catch (error) {
      console.log(error);
      throw new AppError("Formato inválido de JSON en los campos enviados", 400);
    }
  };
};


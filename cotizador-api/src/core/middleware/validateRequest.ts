import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ( err.message ));
      return res.status(400).json({ message: "Error de validacion", errors });
    }

    // Guarda los datos validados para evitar mutaciones directas
    req.body = result.data;
    next();
  };
};

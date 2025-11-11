// backend/src/modules/plan/schema.ts
import { z } from "zod";

export const createPlanSchema = z.object({
  name: z
    .string({ message: "El nombre del plan es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),
  description: z
    .string()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional(),
  companyId: z
    .string({ message: "La compañía es obligatoria" })
    .uuid("ID de compañía inválido"),
});

export const updatePlanSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres")
    .optional(),
  description: z
    .string()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional(),
  companyId: z
    .string()
    .uuid("ID de compañía inválido")
    .optional(),
});

export const createPlanVersionSchema = z.object({
  planId: z.string().uuid(),
  version: z.number().optional(),
  coefficients: z
    .array(
      z.object({
        plazo: z.number(),
        tna: z.number(),
        coeficiente: z.number(),
        quebrantoFinanciero: z.number().optional(),
        cuotaBalon6M: z.number().optional(),
        cuotaBalon12M: z.number().optional(),
        cuotaBalon18M: z.number().optional(),
        cuotaBalon24M: z.number().optional(),
        cuotaBalon30M: z.number().optional(),
        cuotaBalon36M: z.number().optional(),
        cuotaBalon42M: z.number().optional(),
        cuotaBalon48M: z.number().optional(),
        cuotaPromedio: z.number().optional(),
      })
    )
    .optional(),
});

export type CreatePlanVersion = z.infer<typeof createPlanVersionSchema>;
export type CreatePlan = z.infer<typeof createPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
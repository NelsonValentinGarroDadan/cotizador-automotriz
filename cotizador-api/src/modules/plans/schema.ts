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

export type CreatePlan = z.infer<typeof createPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
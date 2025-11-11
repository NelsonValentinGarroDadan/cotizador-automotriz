import { z } from "zod";
export const coefficientSchema = z.object({
  plazo: z.coerce.number().int().min(1, 'El plazo debe ser mayor a 0'),
  tna: z.coerce.number().nonnegative(),
  coeficiente: z.coerce.number().nonnegative(),
  quebrantoFinanciero: z.coerce.number().nonnegative().optional(),
  cuotaBalon6M: z.coerce.number().optional(),
  cuotaBalon12M: z.coerce.number().optional(),
  cuotaBalon18M: z.coerce.number().optional(),
  cuotaBalon24M: z.coerce.number().optional(),
  cuotaBalon30M: z.coerce.number().optional(),
  cuotaBalon36M: z.coerce.number().optional(),
  cuotaBalon42M: z.coerce.number().optional(),
  cuotaBalon48M: z.coerce.number().optional(),
  cuotaPromedio: z.coerce.number().optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().max(1000).optional(),
  companyIds: z.array(z.uuid()).min(1, 'Debe seleccionar al menos una compañía'),
  desdeMonto: z.coerce.number().nonnegative().optional(),
  hastaMonto: z.coerce.number().nonnegative().optional(),
  desdeCuota: z.coerce.number().int().optional(),
  hastaCuota: z.coerce.number().int().optional(),
  coefficients: z.array(coefficientSchema).optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  description: z.string().max(1000).optional(),
  companyIds: z.array(z.string().uuid()).optional(),
  
});
 
export const createPlanVersionSchema = z.object({
  planId: z.uuid(),
  version: z.coerce.number().int().optional(), 
  desdeMonto: z.coerce.number().nonnegative().optional(),
  hastaMonto: z.coerce.number().nonnegative().optional(),
  desdeCuota: z.coerce.number().int().optional(),
  hastaCuota: z.coerce.number().int().optional(),
  
  coefficients: z.array(coefficientSchema).min(1, 'Debe incluir al menos un coeficiente'),
});

export type CreatePlan = z.infer<typeof createPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
export type CreatePlanVersion = z.infer<typeof createPlanVersionSchema>;

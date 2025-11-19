import { z } from "zod";

export const getVehiclesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  brandId: z.coerce.number().int().positive().optional(),
  lineId: z.coerce.number().int().positive().optional(),
  modelId: z.coerce.number().int().positive().optional(),
});

// Brands
export const createBrandSchema = z.object({
  descrip: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(50, "La descripción no puede superar los 50 caracteres"),
  logo: z.string().max(100).optional().default(""),
  codigo: z.string().max(20).optional().default(""),
});

export const updateBrandSchema = createBrandSchema.partial();

// Lines
export const createLineSchema = z.object({
  brandId: z.coerce
    .number()
    .int("El ID de marca debe ser un entero")
    .positive("El ID de marca debe ser positivo"),
  descrip: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(50, "La descripción no puede superar los 50 caracteres"),
});

export const updateLineSchema = createLineSchema.partial();

// Models
export const createModelSchema = z.object({
  brandId: z.coerce
    .number()
    .int("El ID de marca debe ser un entero")
    .positive("El ID de marca debe ser positivo"),
  lineId: z.coerce
    .number()
    .int("El ID de línea debe ser un entero")
    .positive("El ID de línea debe ser positivo"),
  descrip: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(50, "La descripción no puede superar los 50 caracteres"),
});

export const updateModelSchema = createModelSchema.partial();

// Versions
export const createVehicleVersionSchema = z.object({
  brandId: z.coerce
    .number()
    .int("El ID de marca debe ser un entero")
    .positive("El ID de marca debe ser positivo"),
  modelId: z.coerce
    .number()
    .int("El ID de modelo debe ser un entero")
    .positive("El ID de modelo debe ser positivo"),
  descrip: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .max(150, "La descripción no puede superar los 150 caracteres"),
  nueva_descrip: z
    .string()
    .max(100, "La descripción corta no puede superar los 100 caracteres")
    .optional()
    .default(""),
  codigo: z
    .string()
    .max(20, "El código no puede superar los 20 caracteres")
    .optional()
    .default(""),
  companyIds: z
    .array(z.string().uuid("ID de compañía inválido"))
    .min(1, "Debe asociar al menos una compañía"),
});

export const updateVehicleVersionSchema = createVehicleVersionSchema.partial();

export type GetVehiclesQuery = z.infer<typeof getVehiclesQuerySchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateLineInput = z.infer<typeof createLineSchema>;
export type UpdateLineInput = z.infer<typeof updateLineSchema>;
export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type CreateVehicleVersionInput = z.infer<typeof createVehicleVersionSchema>;
export type UpdateVehicleVersionInput = z.infer<typeof updateVehicleVersionSchema>;

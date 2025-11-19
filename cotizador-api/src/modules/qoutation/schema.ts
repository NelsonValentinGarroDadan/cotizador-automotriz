// backend/src/modules/quotation/schema.ts
import { z } from "zod";

export const createQuotationSchema = z.object({
  planVersionId: z.uuid("ID de versión del plan inválido"),
  companyId: z.string().uuid("ID de compañía inválido"),
  clientName: z
    .string()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),
  clientDni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(20, "El DNI no puede superar los 20 caracteres"),
  vehicleData: z
    .string()
    .max(255, "Los datos del vehículo no pueden superar los 255 caracteres")
    .optional(),
  vehicleVersionId: z.coerce
    .number()
    .int("El ID de versión de vehículo debe ser un número entero")
    .positive("El ID de versión de vehículo debe ser positivo")
    .optional(),
  totalValue: z.coerce
    .number()
    .nonnegative("El valor total debe ser positivo")
    .optional(),
});

export const updateQuotationSchema = z.object({
  planVersionId: z
    .uuid("ID de versión del plan inválido")
    .optional(),
  companyId: z
    .string()
    .uuid("ID de compañía inválido")
    .optional(),
  clientName: z
    .string()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres")
    .optional(),
  clientDni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(20, "El DNI no puede superar los 20 caracteres")
    .optional(),
  vehicleData: z
    .string()
    .max(255, "Los datos del vehículo no pueden superar los 255 caracteres")
    .optional(),
  vehicleVersionId: z.coerce
    .number()
    .int("El ID de versión de vehículo debe ser un número entero")
    .positive("El ID de versión de vehículo debe ser positivo")
    .optional(),
  totalValue: z.coerce
    .number()
    .nonnegative("El valor total debe ser positivo")
    .optional(),
});

export type CreateQuotation = z.infer<typeof createQuotationSchema>;
export type UpdateQuotation = z.infer<typeof updateQuotationSchema>;


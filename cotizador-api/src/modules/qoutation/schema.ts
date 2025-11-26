// backend/src/modules/quotation/schema.ts
import { z } from "zod";

export const createQuotationSchema = z.object({
  planVersionId: z.uuid("ID de version del plan invalido"),
  companyId: z.string().uuid("ID de compañia invalido"),
  clientName: z
    .string()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),
  clientDni: z
    .string()
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(20, "El DNI no puede superar los 20 caracteres"),
  vehicleVersionId: z.coerce
    .number()
    .int("El ID de version de vehiculo debe ser un numero entero")
    .positive("El ID de version de vehiculo debe ser positivo"),
  totalValue: z.coerce
    .number()
    .nonnegative("El valor total debe ser positivo")
    .optional(),
});

export const updateQuotationSchema = z.object({
  planVersionId: z
    .uuid("ID de version del plan invalido")
    .optional(),
  companyId: z
    .string()
    .uuid("ID de compañia invalido")
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
  vehicleVersionId: z.coerce
    .number()
    .int("El ID de version de vehiculo debe ser un numero entero")
    .positive("El ID de version de vehiculo debe ser positivo")
    .optional(),
  totalValue: z.coerce
    .number()
    .nonnegative("El valor total debe ser positivo")
    .optional(),
});

export type CreateQuotation = z.infer<typeof createQuotationSchema>;
export type UpdateQuotation = z.infer<typeof updateQuotationSchema>;


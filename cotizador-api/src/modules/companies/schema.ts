import { z } from "zod";

export const createCompanyValidation = z.object({
  name: z
    .string({ error: "El nombre de la compañía es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"), 
});

export const createCompanySchema = z.object({
  name: z
    .string({ error: "El nombre de la compañía es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"), 
});

export const updateCompanySchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(255, "El nombre no puede superar los 255 caracteres")
      .optional(),
  })

export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

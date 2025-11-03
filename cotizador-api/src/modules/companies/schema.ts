import { z } from "zod";

export const createCompanySchema = z.object({
  name: z
    .string({ error: "El nombre de la compañía es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),
  ownerId: z
    .uuid("El ID del propietario debe ser un UUID válido"),
});

export const updateCompanySchema = z
  .object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(255, "El nombre no puede superar los 255 caracteres")
      .optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.active !== undefined,
    { message: "Debes modificar al menos un campo" }
  );

export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

import { z } from "zod";

// Regex para solo letras (mayúsculas o minúsculas, con acentos)
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+$/;

export const createUserSchema = z.object({
  email: z
    .string()
    .email({ error: "El campo 'email' debe ser un correo válido" }),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z
    .string()
    .min(3, "El 'firstName' debe tener al menos 3 caracteres")
    .regex(nameRegex, "El 'firstName' solo puede contener letras"),
  lastName: z
    .string()
    .min(3, "El 'lastName' debe tener al menos 3 caracteres")
    .regex(nameRegex, "El 'lastName' solo puede contener letras"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"], {
    error: "El campo 'role' es obligatorio",
  }),
  companyIds: z.array(z.uuid()).optional(),
  allowedPlanIds: z.array(z.uuid()).optional(),
});

export const updateUserSchema = z
  .object({
    email: z
      .string()
      .email({ error: "El campo 'email' debe ser un correo válido" })
      .optional(),
    firstName: z
      .string()
      .min(3, "El 'firstName' debe tener al menos 3 caracteres")
      .regex(nameRegex, "El 'firstName' solo puede contener letras")
      .optional(),
    lastName: z
      .string()
      .min(3, "El 'lastName' debe tener al menos 3 caracteres")
      .regex(nameRegex, "El 'lastName' solo puede contener letras")
      .optional(),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .optional(),
    companyIds: z.array(z.uuid()).optional(),
    allowedPlanIds: z.array(z.uuid()).optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviarse al menos un campo para actualizar",
  });

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;


import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string({ error : "El campo 'password' es obligatorio"}),
});

export type LoginUser = z.infer<typeof loginSchema>;

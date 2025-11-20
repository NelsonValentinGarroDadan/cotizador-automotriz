import { z } from "zod";

export const getVehiclesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  brandId: z.coerce.number().int().positive().optional(),
  lineId: z.coerce.number().int().positive().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  companyId: z
    .uuid("ID de compañia inalido")
    .optional(),
});

// Brands
export const createBrandSchema = z.object({
  descrip: z
    .string()
    .min(2, "La descripcion debe tener al menos 2 caracteres")
    .max(50, "La descripcion no puede superar los 50 caracteres"),
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
    .min(2, "La descripcion debe tener al menos 2 caracteres")
    .max(50, "La descripcion no puede superar los 50 caracteres"),
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
    .int("El ID de linea debe ser un entero")
    .positive("El ID de linea debe ser positivo"),
  descrip: z
    .string()
    .min(2, "La descripcion debe tener al menos 2 caracteres")
    .max(50, "La descripcion no puede superar los 50 caracteres"),
});

export const updateModelSchema = createModelSchema.partial();

// Versions
export const createVehicleVersionSchema = z
  .object({
    brandId: z.coerce
      .number()
      .int("El ID de marca debe ser un entero")
      .positive("El ID de marca debe ser positivo")
      .optional(),
    modelId: z.coerce
      .number()
      .int("El ID de modelo debe ser un entero")
      .positive("El ID de modelo debe ser positivo")
      .optional(),
    descrip: z
      .string()
      .min(2, "La descripcion debe tener al menos 2 caracteres")
      .max(150, "La descripcion no puede superar los 150 caracteres"),
    nueva_descrip: z
      .string()
      .max(100, "La descripcion corta no puede superar los 100 caracteres")
      .optional()
      .default(""),
    codigo: z
      .string()
      .max(20, "El codigo no puede superar los 20 caracteres")
      .optional()
      .default(""),
    companyIds: z
      .array(z.uuid("ID de compaña invalido"))
      .min(1, "Debe asociar al menos una compañia"),
    // Campos para crear nuevas entidades si no se seleccionan existentes
    newBrandDescrip: z
      .string()
      .min(2, "La descripcion de la marca debe tener al menos 2 caracteres")
      .max(50, "La descripcion de la marca no puede superar los 50 caracteres")
      .optional(),
    newLineDescrip: z
      .string()
      .min(2, "La descripcion de la linea debe tener al menos 2 caracteres")
      .max(50, "La descripcion de la linea no puede superar los 50 caracteres")
      .optional(),
    newModelDescrip: z
      .string()
      .min(2, "La descripcion del modelo debe tener al menos 2 caracteres")
      .max(50, "La descripcion del modelo no puede superar los 50 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasExisting = !!data.brandId && !!data.modelId;
    const hasNew =
      !!data.newBrandDescrip &&
      !!data.newLineDescrip &&
      !!data.newModelDescrip;

    if (!hasExisting && !hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Debes seleccionar marca y modelo existentes o ingresar nueva marca, linea y modelo",
        path: ["brandId"],
      });
    }

    if (hasExisting && hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "No puedes combinar seleccion de marca/modelo existentes con creacion de nuevas entidades",
        path: ["brandId"],
      });
    }
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


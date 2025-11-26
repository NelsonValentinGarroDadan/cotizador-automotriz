import { z } from "zod";

export const getVehiclesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  brandId: z.coerce.number().int().positive().optional(),
  lineId: z.coerce.number().int().positive().optional(),
  companyId: z.uuid("ID de compañia invalido").optional(),
});

// Brands
export const createBrandSchema = z.object({
  descrip: z.string().min(2, "La descripcion debe tener al menos 2 caracteres").max(50, "La descripcion no puede superar los 50 caracteres"),
});

export const updateBrandSchema = createBrandSchema.partial();

// Lines
export const createLineSchema = z.object({
  brandId: z.coerce.number().int("El ID de marca debe ser un entero").positive("El ID de marca debe ser positivo"),
  descrip: z.string().min(2, "La descripcion debe tener al menos 2 caracteres").max(50, "La descripcion no puede superar los 50 caracteres"),
});

export const updateLineSchema = createLineSchema.partial();

// Versions
export const createVehicleVersionSchema = z
  .object({
    brandId: z.coerce.number().int("El ID de marca debe ser un entero").positive("El ID de marca debe ser positivo").optional(),
    lineId: z.coerce.number().int("El ID de linea debe ser un entero").positive("El ID de linea debe ser positivo").optional(),
    descrip: z.string().min(2, "La descripcion debe tener al menos 2 caracteres").max(150, "La descripcion no puede superar los 150 caracteres"),
    codigo: z.string().min(1, "El codigo es obligatorio").max(20, "El codigo no puede superar los 20 caracteres"),
    companyIds: z.array(z.uuid("ID de compañia invalido")).min(1, "Debe asociar al menos una compañia"),
    newBrandDescrip: z.string().min(2, "La descripcion de la marca debe tener al menos 2 caracteres").max(50, "La descripcion de la marca no puede superar los 50 caracteres").optional(),
    newLineDescrip: z.string().min(2, "La descripcion de la linea debe tener al menos 2 caracteres").max(50, "La descripcion de la linea no puede superar los 50 caracteres").optional(),
  })
  .superRefine((data, ctx) => {
    const hasExisting = !!data.brandId && !!data.lineId;
    const hasNew = !!data.newBrandDescrip && !!data.newLineDescrip;

    if (!hasExisting && !hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes seleccionar marca y linea existentes o ingresar nueva marca y linea",
        path: ["brandId"],
      });
    }

    if (hasExisting && hasNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puedes combinar seleccion de marca/linea existentes con creacion de nuevas entidades",
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
export type CreateVehicleVersionInput = z.infer<typeof createVehicleVersionSchema>;
export type UpdateVehicleVersionInput = z.infer<typeof updateVehicleVersionSchema>;

